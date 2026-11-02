import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { checkRules, createResult, LintData, prepareRules } from './lintEngine';
import { discoverFiles, Document, fieldLocation, loadFiles, LoadIssue, parseDocument, pointerPart, SourceNode } from './loader';
import { builtinRules, cacheRuleValue } from './rules';
import { SourceKeyIndex } from './sourceKeyIndex';
import { LintNode, LintOptions, LintResult, Location } from './types';

const builtinIds = new Set(builtinRules.map(rule => rule.id));

interface IndexedNode extends LintNode {
    fields: Map<string, Location>;
}

interface IndexedDocument {
    file: string;
    nodes: IndexedNode[];
    packIds: ReadonlySet<string>;
    references: Document['references'];
    issues: LoadIssue[];
}

interface Snapshot {
    documents: Map<string, IndexedDocument>;
    sourceKeys: SourceKeyIndex;
    result: LintResult;
}

/**
 * Reusable workspace validation for editors and other long-running tools.
 * Keeps compact rule inputs and source keys, not parsed catalog payloads.
 * Notify the session of file changes with lintFile; refresh discovers external changes.
 */
export class LintSession {
    private readonly cwd: string;
    private readonly inputs: string[];
    private readonly options: LintOptions;
    private readonly contents = new Map<string, string>();
    private snapshot?: Snapshot;
    private pending: Promise<unknown> = Promise.resolve();

    constructor(inputs: string[] = [], options: LintOptions = {}) {
        this.cwd = resolve(options.cwd ?? process.cwd());
        this.options = { ...options, config: structuredClone(options.config), rules: options.rules?.slice() };
        this.inputs = inputs.length ? inputs.slice() : this.options.config?.files ?? ['.'];
    }

    /** Rebuild the workspace index from disk, retaining supplied editor buffers. */
    public refresh(): Promise<LintResult> {
        return this.enqueue(() => this.rebuild()).then(result => structuredClone(result));
    }

    /**
     * Revalidate one changed file and references affected by its source keys.
     * Pass text for an unsaved buffer; omit it to use disk and discard that buffer.
     * Returns the complete workspace report, including updated diagnostics in other files.
     */
    public lintFile(file: string, text?: string): Promise<LintResult> {
        return this.lintChanges(new Map([[resolve(this.cwd, file), text]]));
    }

    /** Revalidate a batch of disk changes, skipping files outside the selected inputs. */
    public lintFiles(files: string[]): Promise<LintResult> {
        return this.lintChanges(new Map(files.map(file => [resolve(this.cwd, file), undefined])));
    }

    private lintChanges(changes: Map<string, string | undefined>): Promise<LintResult> {
        return this.enqueue(async () => {
            const snapshot = this.snapshot;
            if (snapshot && [...changes.keys()].some(file => !snapshot.documents.has(file))) {
                // Discover filenames only; an unrelated save must not reparse the catalog.
                const { selected, ignored } = await discoverFiles(this.inputs, this.cwd, this.options.config?.ignore);
                const referenced = new Set([...snapshot.documents.values()].flatMap(doc => doc.references.map(ref => ref.target)));
                for (const file of changes.keys()) {
                    if (!snapshot.documents.has(file) && (ignored.has(file) || (!selected.has(file) && !referenced.has(file)))) {
                        changes.delete(file);
                    }
                }
            }
            if (!changes.size && snapshot) { return snapshot.result; }
            for (const [file, text] of changes) {
                if (text === undefined) { this.contents.delete(file); }
                else { this.contents.set(file, text); }
            }
            if (!snapshot || changes.size > 1 || this.options.rules?.length) { return this.rebuild(); }
            const [path, text] = changes.entries().next().value!;
            const previous = snapshot.documents.get(path);
            if (!previous) { return this.rebuild(); }
            let document: Document;
            try {
                document = parseDocument(path, text ?? await readFile(path, 'utf8'));
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                    return this.rebuild();
                }
                throw error;
            }
            if (!sameReferences(previous.references, document.references)) {
                return this.rebuild();
            }
            for (const id of previous.packIds) {
                document.packIds.add(id);
            }
            return this.update(document, previous);
        }).then(result => structuredClone(result));
    }

    /** Release the cache and editor buffers after pending checks have completed. */
    public clear(): Promise<void> {
        return this.enqueue(async () => {
            this.snapshot = undefined;
            this.contents.clear();
        });
    }

    private enqueue<T>(action: () => Promise<T>): Promise<T> {
        const operation = this.pending.then(action).catch(error => {
            this.snapshot = undefined;
            throw error;
        });
        this.pending = operation.catch(() => undefined);
        return operation;
    }

    private async rebuild(): Promise<LintResult> {
        const prepared = prepareRules(this.options);
        const loaded = await loadFiles(this.inputs, this.cwd, this.options.config?.ignore, this.contents);
        const sourceKeys = new SourceKeyIndex();
        sourceKeys.add(loaded.nodes);
        const result = createResult(loaded.files, await checkRules(loaded, prepared, sourceKeys.keys), prepared);
        const issuesByFile = new Map<string, LoadIssue[]>();
        for (const issue of loaded.issues) {
            const issues = issuesByFile.get(issue.location.file) ?? [];
            issues.push(issue);
            issuesByFile.set(issue.location.file, issues);
        }
        const documents = new Map<string, IndexedDocument>();
        const cachedKeys = new SourceKeyIndex();
        for (const document of loaded.documents.values()) {
            const indexed = indexDocument(document, issuesByFile.get(document.file) ?? []);
            documents.set(document.file, indexed);
            cachedKeys.add(indexed.nodes);
        }
        this.snapshot = { documents, sourceKeys: cachedKeys, result };
        return result;
    }

    private async update(document: Document, previous: IndexedDocument): Promise<LintResult> {
        const prepared = prepareRules(this.options);
        const snapshot = this.snapshot!;
        // File-reference errors are unchanged when the edges are unchanged, but their
        // source positions may move when lines are inserted into the edited document.
        const fileIssues = previous.issues.filter(issue => issue.ruleId === 'file-reference').map(issue => ({
            ...issue,
            location: document.references.find(ref => ref.location.pointer === issue.location.pointer)!.location
        }));
        const indexed = indexDocument(document, [...document.issues, ...fileIssues]);
        snapshot.sourceKeys.remove(previous.nodes);
        snapshot.sourceKeys.add(indexed.nodes);
        snapshot.documents.set(document.file, indexed);

        const all = [...snapshot.documents.values()];
        const data: LintData = {
            files: snapshot.result.files,
            nodes: all.flatMap(doc => doc.nodes),
            issues: all.flatMap(doc => doc.issues),
            location: indexedLocation
        };
        const diagnostics = await checkRules(data, prepared, snapshot.sourceKeys.keys, id => builtinIds.has(id));
        const localData: LintData = {
            files: [document.file], nodes: document.nodes, issues: document.issues,
            location: (node, field) => field === undefined ? node.location : fieldLocation(document, node as SourceNode, field)
        };
        const formulas = await checkRules(localData, prepared, snapshot.sourceKeys.keys, id => !builtinIds.has(id));
        const unchanged = snapshot.result.diagnostics.filter(item => !builtinIds.has(item.ruleId) && item.file !== document.file);
        snapshot.result = createResult(data.files, [...diagnostics, ...unchanged, ...formulas], prepared);
        return snapshot.result;
    }
}

function sameReferences(a: Document['references'], b: Document['references']): boolean {
    return a.length === b.length && a.every((ref, index) =>
        ref.target === b[index].target && ref.packId === b[index].packId && ref.location.pointer === b[index].location.pointer);
}

function indexDocument(document: Document, issues: LoadIssue[]): IndexedDocument {
    const nodes = new Map<LintNode, IndexedNode>();
    for (const node of document.nodes) {
        const value = cacheRuleValue(node.value);
        const fields = Object.keys(value);
        if (!fields.length) {
            continue;
        }
        nodes.set(node, {
            value, location: node.location, packIds: node.packIds,
            fields: new Map(fields.map(field => [field, fieldLocation(document, node, field)]))
        });
    }
    for (const [source, indexed] of nodes) {
        let parent = source.parent;
        while (parent && !nodes.has(parent)) {
            parent = parent.parent;
        }
        indexed.parent = parent && nodes.get(parent);
    }
    return { file: document.file, nodes: [...nodes.values()], packIds: document.packIds, references: document.references, issues };
}

function indexedLocation(node: LintNode, field?: string): Location {
    return field === undefined ? node.location : (node as IndexedNode).fields.get(field) ?? {
        ...node.location, pointer: `${node.location.pointer}/${pointerPart(field)}`
    };
}

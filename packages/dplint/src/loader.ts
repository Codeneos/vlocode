import { readFile, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { glob } from 'glob';
import { createScanner, SyntaxKind, visit } from 'jsonc-parser';
import { JsonObject, LintNode, Location } from './types';
import { configNames } from './config';

export interface LoadIssue { ruleId: string; location: Location; message: string }
interface Document {
    file: string;
    text: string;
    lines: number[];
    packIds: Set<string>;
    references: { target: string; location: Location }[];
}

interface SourceNode extends LintNode { offset: number }

export function pointerPart(value: string): string { return value.replace(/~/g, '~0').replace(/\//g, '~1'); }

export async function loadFiles(inputs: string[], cwd: string, ignore: string[] = []) {
    const ignored = new Set(await glob(ignore, { cwd, absolute: true, nodir: true, dot: true }));
    const selected = new Set<string>();
    for (const input of inputs) {
        const full = resolve(cwd, input);
        const info = await stat(full).catch((error: NodeJS.ErrnoException) => {
            if (error.code === 'ENOENT') { return undefined; }
            throw error;
        });
        const files = info?.isFile() ? [full] : await glob(info?.isDirectory() ? '**/*.json' : input, {
            cwd: info?.isDirectory() ? full : cwd,
            absolute: true, nodir: true, ignore: ['**/node_modules/**', '**/.git/**', ...configNames.map(name => `**/${name}`)]
        });
        if (!files.length) { throw new Error(`No input files matched: ${input}`); }
        files.filter(file => !ignored.has(file)).forEach(file => selected.add(file));
    }
    if (!selected.size) { throw new Error('No input files remain after applying ignore patterns'); }

    const documents = new Map<string, Document>();
    const nodes: SourceNode[] = [];
    const issues: LoadIssue[] = [];
    const queue = [...selected].sort();
    const queued = new Set(queue);
    for (let i = 0; i < queue.length; i++) {
        const file = queue[i];
        const text = await readFile(file, 'utf8');
        const doc: Document = { file, text, lines: [0], packIds: new Set(), references: [] };
        for (let offset = 0; offset < text.length; offset++) { if (text[offset] === '\n') { doc.lines.push(offset + 1); } }
        documents.set(file, doc);
        let data: unknown;
        try { data = JSON.parse(text); }
        catch (error) {
            const message = (error as Error).message;
            const position = /position (\d+)/.exec(message);
            const offset = position ? Number(position[1]) : /end of JSON/.test(message) ? text.length : 0;
            issues.push({ ruleId: 'json-syntax', location: atOffset(doc, '', offset), message });
            continue;
        }

        const parents: SourceNode[] = [];
        // Keep parsed records and object offsets, not a second tree for every JSON token.
        // Expanded rate tables can be hundreds of megabytes in a single file.
        visit(text, {
            onObjectBegin(offset, _length, line, column, getPath) {
                const path = getPath();
                const pointer = path.length ? '/' + path.map(part => pointerPart(String(part))).join('/') : '';
                const value = path.reduce<unknown>((value, key) => value![key], data) as JsonObject;
                const packIds = path[0] === 'dataPacks' && typeof path[1] === 'number'
                    ? new Set([`${file}#/dataPacks/${path[1]}`]) : doc.packIds;
                const node: SourceNode = { value, offset, location: { file, pointer, line: line + 1, column: column + 1 }, packIds, parent: parents.at(-1) };
                nodes.push(node);
                parents.push(node);
            },
            onObjectEnd() { parents.pop(); },
            onLiteralValue(value, _offset, _length, line, column, getPath) {
                if (typeof value === 'string' && /\.json$/i.test(value) && !isAbsolute(value) && !value.includes('://') && !/[\r\n]/.test(value)) {
                    const path = getPath();
                    doc.references.push({ target: resolve(dirname(file), value), location: {
                        file, pointer: path.length ? '/' + path.map(part => pointerPart(String(part))).join('/') : '', line: line + 1, column: column + 1
                    } });
                }
            }
        });
        for (const ref of doc.references) {
            if (queued.has(ref.target) || ignored.has(ref.target)) { continue; }
            try {
                if (!(await stat(ref.target)).isFile()) { throw new Error('Not a file'); }
                queued.add(ref.target);
                queue.push(ref.target);
            } catch (error) {
                issues.push({ ruleId: 'file-reference', location: ref.location, message: `Cannot load child JSON file ${relative(cwd, ref.target)}: ${(error as Error).message}` });
            }
        }
    }

    const incoming = new Set([...documents.values()].flatMap(doc => doc.references.map(ref => ref.target)));
    const headers = new Set([...documents.keys()].filter(file => /_DataPack\.json$/i.test(file)));
    const headersByFolder = new Map<string, string[]>();
    for (const header of headers) {
        const folder = dirname(header);
        const siblings = headersByFolder.get(folder) ?? [];
        siblings.push(header);
        headersByFolder.set(folder, siblings);
    }
    const roots = [...documents.keys()].filter(file => headers.has(file) || !incoming.has(file));
    const cycles = new Set<string>();
    function assign(file: string, packId: string, ancestors = new Set<string>()) {
        const doc = documents.get(file);
        if (!doc || doc.packIds.has(packId)) { return; }
        doc.packIds.add(packId);
        const stack = new Set([...ancestors, file]);
        for (const ref of doc.references) {
            if (stack.has(ref.target)) {
                const id = `${file}#${ref.location.pointer}`;
                if (!cycles.has(id)) {
                    cycles.add(id);
                    issues.push({ ruleId: 'file-reference', location: ref.location, message: `Circular child JSON reference to ${relative(cwd, ref.target)}` });
                }
            } else { assign(ref.target, packId, stack); }
        }
    }
    for (const file of roots) {
        // Directory scans also select siblings omitted from the header's fields.
        // Give these files their folder's unambiguous header scope; explicitly
        // referenced children inherit their owner's scope through assign().
        const siblings = headersByFolder.get(dirname(file));
        const packId = !headers.has(file) && siblings?.length === 1 ? siblings[0] : file;
        assign(file, packId);
    }
    for (const doc of documents.values()) { if (!doc.packIds.size) { assign(doc.file, doc.file); } }

    return {
        files: [...documents.keys()].sort(), nodes, issues,
        location(node: LintNode, field?: string): Location {
            return field === undefined ? node.location : fieldLocation(documents.get(node.location.file)!, node as SourceNode, field);
        }
    };
}

function atOffset(doc: Document, pointer: string, offset: number): Location {
    let lo = 0;
    let hi = doc.lines.length;
    while (lo + 1 < hi) {
        const mid = (lo + hi) >>> 1;
        if (doc.lines[mid] <= offset) { lo = mid; } else { hi = mid; }
    }
    return { file: doc.file, pointer, line: lo + 1, column: offset - doc.lines[lo] + 1 };
}

function fieldLocation(doc: Document, node: SourceNode, field: string): Location {
    const pointer = `${node.location.pointer}/${pointerPart(field)}`;
    if (!Object.hasOwn(node.value, field)) { return { ...node.location, pointer }; }
    const scanner = createScanner(doc.text, true);
    scanner.setPosition(node.offset);
    let depth = 0;
    let token: SyntaxKind;
    while ((token = scanner.scan()) !== SyntaxKind.EOF) {
        if (token === SyntaxKind.OpenBraceToken || token === SyntaxKind.OpenBracketToken) { depth++; }
        else if (token === SyntaxKind.CloseBraceToken || token === SyntaxKind.CloseBracketToken) { if (--depth === 0) { break; } }
        else if (depth === 1 && token === SyntaxKind.StringLiteral) {
            const key = scanner.getTokenValue();
            if (scanner.scan() === SyntaxKind.ColonToken) {
                if (key === field) { scanner.scan(); return atOffset(doc, pointer, scanner.getTokenOffset()); }
            }
        }
    }
    return { ...node.location, pointer };
}

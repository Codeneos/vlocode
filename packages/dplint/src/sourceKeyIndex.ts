import { isReference } from './rules';
import { LintNode } from './types';

/** Source declarations indexed by key, with deterministic ordering for duplicate diagnostics. */
export class SourceKeyIndex {
    public readonly keys = new Map<string, LintNode[]>();

    public add(nodes: readonly LintNode[]): void {
        const changed = new Set<string>();
        for (const node of nodes) {
            const key = node.value.VlocityRecordSourceKey;
            if (typeof key !== 'string' || !key || isReference(node)) {
                continue;
            }
            const records = this.keys.get(key) ?? [];
            records.push(node);
            this.keys.set(key, records);
            changed.add(key);
        }
        for (const key of changed) {
            this.keys.get(key)!.sort((a, b) =>
                a.location.file.localeCompare(b.location.file, 'en') ||
                a.location.line - b.location.line || a.location.column - b.location.column);
        }
    }

    public remove(nodes: readonly LintNode[]): void {
        for (const node of nodes) {
            const key = node.value.VlocityRecordSourceKey;
            if (typeof key !== 'string' || isReference(node)) {
                continue;
            }
            const records = this.keys.get(key);
            if (!records) {
                continue;
            }
            records.splice(records.indexOf(node), 1);
            if (!records.length) {
                this.keys.delete(key);
            }
        }
    }
}

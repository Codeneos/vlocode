import { sortObjectKeys, type DatapackObject } from '@vlocode/vlocity-deploy';

interface BuildToolsSorter {
    generateListSortKey(record: DatapackObject, fields: string[]): string;
}

/** Keep Build Tools' large-list optimization, with the same canonical tie-break as small lists. */
export function stabilizeBuildToolsSorting(sorter: BuildToolsSorter): void {
    const generate = sorter.generateListSortKey.bind(sorter);
    sorter.generateListSortKey = (record, fields) =>
        `${generate(record, fields)}\u0000${JSON.stringify(sortObjectKeys(record))}`;
}

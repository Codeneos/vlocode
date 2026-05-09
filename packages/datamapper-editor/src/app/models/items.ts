import type { DataMapperItem, DataMapperKind, LoadObjectGroup } from './datamapper.model';

export function newGlobalKey(): string {
    return crypto.randomUUID();
}

export function createMappingItem(kind: DataMapperKind, loadObjects: LoadObjectGroup[], previous?: DataMapperItem): DataMapperItem {
    const isLoad = kind === 'load';
    return {
        GlobalKey: newGlobalKey(),
        IsDisabled: false,
        IsRequiredForUpsert: false,
        IsUpsertKey: false,
        OutputCreationSequence: isLoad ? (previous?.OutputCreationSequence ?? loadObjects[0]?.sequence ?? 1) : undefined,
        OutputObjectName: isLoad ? (previous?.OutputObjectName ?? loadObjects[0]?.outputObjectName ?? '') : 'json',
        VlocityDataPackType: 'SObject',
        VlocityRecordSObjectType: 'OmniDataTransformItem'
    };
}

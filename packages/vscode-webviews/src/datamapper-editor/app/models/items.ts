import type { DataMapperItem, DataMapperKind, LoadObjectGroup } from './datamapper.model';

export function newGlobalKey(): string {
    return crypto.randomUUID();
}

export function createMappingItem(kind: DataMapperKind, loadObjects: LoadObjectGroup[], previous?: DataMapperItem): DataMapperItem {
    const isLoad = kind === 'load';
    const outputCreationSequence = previous?.OutputCreationSequence ?? loadObjects[0]?.sequence ?? 1;
    return {
        DefaultValue: '',
        FilterGroup: 0,
        GlobalKey: newGlobalKey(),
        InputObjectQuerySequence: 0,
        IsDisabled: false,
        IsRequiredForUpsert: false,
        IsUpsertKey: false,
        LinkedObjectSequence: 0,
        OutputCreationSequence: outputCreationSequence,
        OutputObjectName: isLoad ? (previous?.OutputObjectName ?? loadObjects[0]?.outputObjectName ?? '') : 'json',
        TransformValuesMappings: '{ }',
        VlocityDataPackType: 'SObject',
        VlocityRecordSObjectType: 'OmniDataTransformItem'
    };
}

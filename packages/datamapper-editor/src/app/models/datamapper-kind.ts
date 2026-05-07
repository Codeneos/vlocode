import type { DataMapperKind, DataMapperModel, TabId } from './datamapper.model';

export function getDataMapperKind(model: DataMapperModel): DataMapperKind {
    const type = String(model.header['Type'] ?? model.header['type'] ?? '').toLowerCase();
    if (type.includes('load')) {
        return 'load';
    }
    if (type.includes('transform')) {
        return 'transform';
    }
    return 'extract';
}

export function getDataMapperSubtitle(model: DataMapperModel, kind: DataMapperKind) {
    const type = String(model.header['Type'] ?? '').trim();
    const displayType = type || kind[0].toUpperCase() + kind.slice(1);
    return `${model.sourceFormat.toUpperCase()} ${displayType} DataMapper`;
}

export function getTabs(kind: DataMapperKind): Array<{ id: TabId; label: string }> {
    if (kind === 'load') {
        return [
            { id: 'objects', label: 'Objects' },
            { id: 'formula', label: 'Formula' },
            { id: 'mapping', label: 'Mapping' }
        ];
    }
    if (kind === 'transform') {
        return [
            { id: 'formula', label: 'Formula' },
            { id: 'mapping', label: 'Transforms' },
            { id: 'preview', label: 'Preview' }
        ];
    }
    return [
        { id: 'extract', label: 'Extract' },
        { id: 'formula', label: 'Formula' },
        { id: 'mapping', label: 'Mapping' },
        { id: 'preview', label: 'Preview' }
    ];
}

export function firstTab(kind: DataMapperKind): TabId {
    return getTabs(kind)[0].id;
}

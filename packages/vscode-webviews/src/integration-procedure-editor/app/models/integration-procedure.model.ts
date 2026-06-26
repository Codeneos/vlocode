export type SourceFormat = 'json' | 'xml';
export type RuntimeShape = 'managed' | 'standard';
export type LeftTab = 'outline' | 'add' | 'problems';
export type InspectorTab = 'settings' | 'conditions' | 'io' | 'failure' | 'json';
export type DropPosition = 'before' | 'after' | 'inside';
export type ReferenceKind = 'apexClass' | 'dataMapper';

export interface IntegrationProcedureHeader {
    active?: boolean;
    description?: string;
    language?: string;
    name: string;
    requiredPermission?: string;
    responseCacheType?: string;
    subType: string;
    type: string;
    versionNumber?: number | string;
}

export interface IntegrationProcedureElement {
    active: boolean;
    description?: string;
    key: string;
    level: number;
    name: string;
    parentKey?: string;
    propertySet: Record<string, unknown>;
    sequenceNumber: number;
    sourceKey: string;
    type: string;
}

export interface IntegrationProcedureModel {
    datapackType: string;
    elements: IntegrationProcedureElement[];
    fileName: string;
    header: IntegrationProcedureHeader;
    propertySet: Record<string, unknown>;
    runtime: RuntimeShape;
    sourceFormat: SourceFormat;
    sourceKey?: string;
    title: string;
}

export interface IntegrationProcedureLayout {
    inspectorCollapsed: boolean;
    inspectorWidth: number;
    leftCollapsed: boolean;
}

export interface EditorState {
    apexClasses?: string[];
    dataMappers?: string[];
    layout?: IntegrationProcedureLayout;
    model: IntegrationProcedureModel;
}

export type ExtensionToWebviewMessage =
    | { type: 'load'; state: EditorState }
    | { type: 'saved' }
    | { type: 'error'; message: string };

export type WebviewToExtensionMessage =
    | { type: 'ready' }
    | { type: 'change'; model: IntegrationProcedureModel }
    | { type: 'save'; model: IntegrationProcedureModel }
    | { type: 'deploy'; model: IntegrationProcedureModel }
    | { type: 'refresh' }
    | { type: 'openSalesforce' }
    | { type: 'viewSource' }
    | { type: 'openReference'; kind: ReferenceKind; name: string }
    | { type: 'layout'; layout: IntegrationProcedureLayout };

export interface FlowRow {
    depth: number;
    element: IntegrationProcedureElement;
    hasChildren: boolean;
}

export interface FlowNode {
    children: FlowNode[];
    depth: number;
    element: IntegrationProcedureElement;
}

export interface Problem {
    elementKey?: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface DataRaptorInputParameter {
    element: string;
    index: number;
    inputParam: string;
}

export interface ElementTemplate {
    description: string;
    family: 'Actions' | 'Data Mappers' | 'Groups';
    icon: string;
    type: string;
}

export interface InsertContext {
    afterKey?: string;
    parentKey?: string;
}

export interface MapEntry {
    key: string;
    value: string;
}

export interface MapEntryEditor {
    key: string;
    mapName: string;
    originalKey: string;
    title: string;
    value: string;
}

export interface ElementDropCommand {
    draggedKey: string;
    position: Exclude<DropPosition, 'inside'>;
    targetKey: string;
}

export interface ElementInsideDropCommand {
    draggedKey: string;
    parentKey: string;
}

export interface TemplateDropCommand {
    parentKey?: string;
    position?: Exclude<DropPosition, 'inside'>;
    targetKey?: string;
    templateType: string;
}

export interface DataRaptorInputParameterChange {
    index: number;
    parameter: Pick<DataRaptorInputParameter, 'element' | 'inputParam'>;
}

export interface DataRaptorInputParameterFieldChange {
    field: 'element' | 'inputParam';
    index: number;
    value: string;
}

export interface ElementFieldChange {
    field: keyof IntegrationProcedureElement;
    value: string | boolean;
}

export interface HeaderFieldChange {
    field: keyof IntegrationProcedureHeader;
    value: string | boolean;
}

export interface MapEntriesChange {
    entries: MapEntry[];
    mapName: string;
}

export interface PropertyValueChange {
    field: string;
    value: unknown;
}

export interface ReferenceOpen {
    kind: ReferenceKind;
    name: string;
}

export const EMPTY_MODEL: IntegrationProcedureModel = {
    datapackType: 'IntegrationProcedure',
    elements: [],
    fileName: '',
    header: {
        name: 'Integration Procedure',
        type: '',
        subType: ''
    },
    propertySet: {},
    runtime: 'standard',
    sourceFormat: 'json',
    title: 'Integration Procedure'
};

export const DEFAULT_INSPECTOR_WIDTH = 520;
export const MIN_INSPECTOR_WIDTH = 360;
export const MAX_INSPECTOR_WIDTH = 760;
export const INSPECTOR_KEYBOARD_RESIZE_STEP = 32;
export const DEFAULT_LAYOUT: IntegrationProcedureLayout = {
    inspectorCollapsed: false,
    inspectorWidth: DEFAULT_INSPECTOR_WIDTH,
    leftCollapsed: false
};

export const INSPECTOR_TABS: Array<{ id: InspectorTab; label: string }> = [
    { id: 'settings', label: 'Settings' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'io', label: 'Input / Output' },
    { id: 'failure', label: 'Failure' },
    { id: 'json', label: 'JSON' }
];

export function normalizeLayout(layout?: Partial<IntegrationProcedureLayout>): IntegrationProcedureLayout {
    const width = typeof layout?.inspectorWidth === 'number' && Number.isFinite(layout.inspectorWidth)
        ? layout.inspectorWidth
        : DEFAULT_INSPECTOR_WIDTH;
    return {
        inspectorCollapsed: layout?.inspectorCollapsed === true,
        inspectorWidth: Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, Math.round(width))),
        leftCollapsed: layout?.leftCollapsed === true
    };
}

import type { OmniScriptElementRecord, OmniScriptRecord } from '@vlocode/omniscript';

export type SourceFormat = 'json' | 'xml';
export type RuntimeShape = 'managed' | 'standard';
export type LeftTab = 'outline' | 'add' | 'problems';
export type InspectorTab = 'settings' | 'conditions' | 'io' | 'failure' | 'json';
export type DropPosition = 'before' | 'after' | 'inside';
export type ReferenceKind = 'apexClass' | 'dataMapper';

export interface IntegrationProcedureModel {
    datapackType: string;
    elements: OmniScriptElementRecord[];
    fileName: string;
    header: Omit<OmniScriptRecord, 'propertySet'>;
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
    element: OmniScriptElementRecord;
    hasChildren: boolean;
}

export interface FlowNode {
    children: FlowNode[];
    depth: number;
    element: OmniScriptElementRecord;
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
    field: keyof OmniScriptElementRecord;
    value: string | boolean;
}

export interface HeaderFieldChange {
    field: keyof IntegrationProcedureModel['header'];
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
        activationField: 'IsActive',
        customJavaScript: '',
        dataRaptorBundleId: '',
        id: 'IntegrationProcedure',
        isActive: false,
        isLwcEnabled: false,
        isReusable: false,
        name: 'Integration Procedure',
        omniProcessType: 'IntegrationProcedure',
        sObjectType: 'OmniProcess',
        testHTMLTemplates: '',
        type: '',
        subType: '',
        language: '',
        version: 1
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

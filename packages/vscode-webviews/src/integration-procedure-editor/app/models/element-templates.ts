import type { ElementTemplate, IntegrationProcedureElement } from './integration-procedure.model';
import { asRecord, stringifyValue } from './property-set';

export const ELEMENT_TEMPLATES: ElementTemplate[] = [
    { type: 'Remote Action', family: 'Actions', icon: 'radio-tower', description: 'Call an Apex remote class and method.' },
    { type: 'HTTP Action', family: 'Actions', icon: 'globe', description: 'Call an HTTP endpoint or named credential.' },
    { type: 'Set Values', family: 'Actions', icon: 'symbol-variable', description: 'Assign values into the procedure data JSON.' },
    { type: 'Response Action', family: 'Actions', icon: 'reply', description: 'Shape the final procedure response.' },
    { type: 'Integration Procedure Action', family: 'Actions', icon: 'references', description: 'Call another Integration Procedure.' },
    { type: 'Data Mapper Extract Action', family: 'Data Mappers', icon: 'database', description: 'Fetch Salesforce data through a Data Mapper.' },
    { type: 'Data Mapper Transform Action', family: 'Data Mappers', icon: 'type-hierarchy-sub', description: 'Transform JSON through a Data Mapper.' },
    { type: 'Data Mapper Post Action', family: 'Data Mappers', icon: 'cloud-upload', description: 'Write data through a Data Mapper.' },
    { type: 'Data Mapper Turbo Action', family: 'Data Mappers', icon: 'zap', description: 'Run a fast Data Mapper extract.' },
    { type: 'Conditional Block', family: 'Groups', icon: 'git-branch', description: 'Run child steps only when its formula is true.' },
    { type: 'Loop Block', family: 'Groups', icon: 'sync', description: 'Run child steps for each item in a list.' },
    { type: 'Try-Catch Block', family: 'Groups', icon: 'shield', description: 'Group steps with explicit failure handling.' },
    { type: 'Cache Block', family: 'Groups', icon: 'archive', description: 'Cache expensive child step output.' }
];

export const TEMPLATE_FAMILIES: ElementTemplate['family'][] = ['Actions', 'Data Mappers', 'Groups'];

export const GROUP_TYPES = new Set(['Conditional Block', 'Loop Block', 'Try-Catch Block', 'Cache Block']);

export function groupTemplates(templates: ElementTemplate[]) {
    const groups = new Map<ElementTemplate['family'], ElementTemplate[]>();
    for (const template of templates) {
        const group = groups.get(template.family) ?? [];
        group.push(template);
        groups.set(template.family, group);
    }
    return groups;
}

export function uniqueElementName(elements: IntegrationProcedureElement[], baseName: string) {
    const existing = new Set(elements.map(element => element.name.toLowerCase()));
    let name = baseName.replace(/\s+/g, '');
    let index = 1;
    while (existing.has(name.toLowerCase())) {
        name = `${baseName.replace(/\s+/g, '')}${++index}`;
    }
    return name;
}

export function defaultElementName(type: string) {
    return type.replace(/\b(Action|Block)\b/g, '').replace(/[^A-Za-z0-9]/g, '') || 'Element';
}

export function defaultPropertySet(type: string, name: string): Record<string, unknown> {
    const common = {
        label: name,
        failOnStepError: false,
        show: null
    };
    if (type === 'Remote Action') {
        return { ...common, remoteClass: '', remoteMethod: '', remoteOptions: {}, sendJSONPath: '', sendJSONNode: '', responseJSONPath: '', responseJSONNode: '' };
    }
    if (isDataMapperAction(type)) {
        return { ...common, bundle: '', ignoreCache: false, 'dataRaptor Input Parameters': [], responseJSONPath: '', responseJSONNode: '' };
    }
    if (type === 'Set Values') {
        return { ...common, elementValueMap: {} };
    }
    if (type === 'Response Action') {
        return { ...common, responseFormat: 'JSON', responseHeaders: {}, returnFullDataJSON: false };
    }
    return common;
}

export function elementSummary(element: IntegrationProcedureElement) {
    const propertySet = element.propertySet;
    if (element.type === 'Remote Action') {
        return [propertySet.remoteClass, propertySet.remoteMethod].filter(Boolean).join('.');
    }
    if (isDataMapperAction(element.type)) {
        return stringifyValue(propertySet.bundle || propertySet.dataRaptorBundle || propertySet.dataMapperName);
    }
    if (element.type === 'Set Values') {
        return Object.keys(asRecord(propertySet.elementValueMap)).join(', ');
    }
    if (element.type === 'Response Action') {
        return stringifyValue(propertySet.responseFormat || 'Response');
    }
    if (GROUP_TYPES.has(element.type)) {
        return stringifyValue(propertySet.executionConditionalFormula || propertySet.show || 'Group');
    }
    return stringifyValue(propertySet.label || '');
}

export function iconForType(type: string) {
    const templateIcon = ELEMENT_TEMPLATES.find(template => template.type === type)?.icon;
    if (templateIcon) {
        return templateIcon;
    }
    if (/Transform/i.test(type) && isDataMapperAction(type)) {
        return 'type-hierarchy-sub';
    }
    if (/Post/i.test(type) && isDataMapperAction(type)) {
        return 'cloud-upload';
    }
    if (/Turbo/i.test(type) && isDataMapperAction(type)) {
        return 'zap';
    }
    if (isDataMapperAction(type)) {
        return 'database';
    }
    return 'circle-outline';
}

export function isDataMapperAction(type: string): boolean {
    return /Data\s*Mapper|DataRaptor/i.test(type);
}

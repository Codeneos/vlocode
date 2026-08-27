import type { IntegrationProcedureModel, Problem } from './integration-procedure.model';
import { isDataMapperAction } from './element-templates';
import { asRecord } from './property-set';

export function validateModel(model: IntegrationProcedureModel): Problem[] {
    const problems: Problem[] = [];
    if (!model.header.name?.trim()) {
        problems.push({ severity: 'error', message: 'Procedure name is required.' });
    }
    const names = new Map<string, string>();
    const keys = new Set(model.elements.map(element => element.id));
    for (const element of model.elements) {
        if (!element.name.trim()) {
            problems.push({ severity: 'error', elementKey: element.id, message: 'Element name is required.' });
        }
        const normalized = element.name.trim().toLowerCase();
        if (names.has(normalized)) {
            problems.push({ severity: 'error', elementKey: element.id, message: `Duplicate element name "${element.name}".` });
        }
        names.set(normalized, element.id);
        if (element.parentElementId && !keys.has(element.parentElementId)) {
            problems.push({ severity: 'warning', elementKey: element.id, message: `${element.name} points to a missing parent.` });
        }
        if (element.type === 'Remote Action' && (!element.propertySet.remoteClass || !element.propertySet.remoteMethod)) {
            problems.push({ severity: 'warning', elementKey: element.id, message: `${element.name} is missing a remote class or method.` });
        }
        if (isDataMapperAction(element.type) && !element.propertySet.bundle) {
            problems.push({ severity: 'warning', elementKey: element.id, message: `${element.name} is missing a Data Mapper name.` });
        }
        if (element.type === 'Set Values' && !Object.keys(asRecord(element.propertySet.elementValueMap)).length) {
            problems.push({ severity: 'warning', elementKey: element.id, message: `${element.name} does not set any values.` });
        }
    }
    return problems;
}

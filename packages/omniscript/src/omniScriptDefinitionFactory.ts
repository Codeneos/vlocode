import { OmniScriptDefinition, OmniScriptElementDefinition } from './types';
import { deepClone, getErrorMessage, Iterable } from '@vlocode/util';
import { OmniScriptElementRecord, OmniScriptRecord } from './types/omniScript';

type DefinitionRecordMapping<TRec> = Record<string, 
    string | boolean | number | null | 
    { field?: keyof TRec, value?: any } |
    ((record: TRec, field: string) => any)
>;

/**
 * Converts Salesforce OmniScript and Element records into OmniScriptDefinition objects
 */
export class OmniScriptDefinitionFactory {

    private scriptMapping: DefinitionRecordMapping<OmniScriptRecord> = {
        'userTimeZone': null,
        'userProfile': '',
        'userName': '',
        'userId': '',
        'userCurrencyCode': '',
        'timeStamp': '',
        'testTemplates': rec => rec.testHTMLTemplates ?? '',
        'templateList': { value: [] },
        'sOmniScriptId': { field: 'id' },
        'sobjPL': { value: {} },
        'RPBundle': rec => rec.dataRaptorBundleId ?? '',
        'rMap': { value: {} },
        'response': null,
        'propSetMap': rec => this.parseAsJson(rec, 'propertySet'),
        'prefillJSON': '{}',
        'lwcId': { field: 'lwcId' },
        'labelMap': { value: {} },
        'labelKeyMap': { value: {} },
        'errorMsg': '',
        'error': 'OK',
        'dMap': { value: {} },
        'depSOPL': { value: {} },
        'depCusPL': { value: {} },
        'customJS': rec => rec.customJavaScript ?? '',
        'cusPL': { value: {} },
        'children': { value: [] },
        'bReusable': { field: 'isReusable' },
        'bpVersion': { field: 'version' },
        'bpType': { field: 'type' },
        'bpSubType': { field: 'subType' },
        'bpLang': { field: 'language' },
        'bHasAttachment': false
    };

    private elementMapping: DefinitionRecordMapping<OmniScriptElementRecord> = {
        'type': { field: 'type' },
        'propSetMap': rec => this.parseAsJson(rec, 'propertySet'),
        'name': { field: 'name' },
        'level': { field: 'level' },
        'indexInParent': 0,
        'bHasAttachment': rec => rec.type === 'File'
    };

    public createScript(scriptRecord: OmniScriptRecord): OmniScriptDefinition {
        return this.createFromMapping<OmniScriptRecord, OmniScriptDefinition>(scriptRecord, this.scriptMapping);
    }

    public createElement(elementRecord: OmniScriptElementRecord): OmniScriptElementDefinition {
        const elementDefinition = this.createFromMapping<OmniScriptElementRecord, OmniScriptElementDefinition>(elementRecord, this.elementMapping);

        if (elementDefinition.type === 'Step') {
            elementDefinition.response = null;
            elementDefinition.inheritShowProp = null;
            elementDefinition.children = [];
            elementDefinition.bAccordionOpen = false;
            elementDefinition.bAccordionActive = false;
        }

        if (elementDefinition.type === 'Edit Block') {
            elementDefinition.propSetMap.rpe = true;
        }

        if (elementDefinition.type === 'Block') {
            if (elementDefinition.propSetMap.repeat === true) {
                elementDefinition.propSetMap.rpe = true;
            }
            if (elementDefinition.level < 2) {
                elementDefinition.propSetMap.bus = true;
            }
        }

        return elementDefinition;
    }

    public createElements(elementRecord: Iterable<OmniScriptElementRecord>): OmniScriptElementDefinition[] {
        return [...Iterable.map(elementRecord, element => this.createElement(element))];
    }

    private createFromMapping<TRec, TOut extends object = object>(record: TRec, recordMapping: DefinitionRecordMapping<TRec>): TOut {
        const definition = {} as TOut;
        for (const [field, def] of Object.entries(recordMapping)) {
            if (typeof def === 'function') {
                definition[field] = def(record, field);
            } else if (typeof def === 'object' && def !== null) {
                definition[field] = deepClone(def.field ? record[def.field] : def.value);
            } else {
                definition[field] = deepClone(def);
            }
        }
        return definition;
    }

    private parseAsJson<T>(record: T, field: keyof T): object | null {
        const value = record[field];
        if (!value) {
            return {};
        } else if (typeof value !== 'string' || value === 'null') {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch (err) {
            throw new Error(`Unable to parse field ${String(field)} for record with Id ${record['Id']} as JSON: ${getErrorMessage(err)}`);
        }
    }
}
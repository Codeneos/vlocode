import { OmniScriptDefinition, OmniScriptElementDefinition } from './types';
import { deepClone, getErrorMessage, Iterable } from '@vlocode/util';
import { OmniScriptElementRecord, OmniScriptRecord } from './omniScriptLookupService';

type DefinitionRecordMapping = Record<string, 
    string | boolean | number | null | 
    { field?: string, value?: any } |
    ((record: any, field: string) => any)
>;

/**
 * Converts Salesforce OmniScript and Element records into OmniScriptDefinition objects
 */
export class OmniScriptDefinitionFactory {

    private scriptMapping: DefinitionRecordMapping = {
        'userTimeZone': null,
        'userProfile': '',
        'userName': '',
        'userId': '',
        'userCurrencyCode': '',
        'timeStamp': '',
        'testTemplates': rec => rec['TestHTMLTemplates__c'] || '',
        'templateList': { value: [] },
        'sOmniScriptId': { field: 'Id' },
        'sobjPL': { value: {} },
        'RPBundle': rec => rec['DataRaptorBundleId__c'] || '',
        'rMap': { value: {} },
        'response': null,
        'propSetMap': rec => this.parseAsJson(rec, 'PropertySet__c'),
        'prefillJSON': '{}',
        'lwcId': { field: 'LwcId__c' },
        'labelMap': { value: {} },
        'labelKeyMap': { value: {} },
        'errorMsg': '',
        'error': 'OK',
        'dMap': { value: {} },
        'depSOPL': { value: {} },
        'depCusPL': { value: {} },
        'customJS': rec => rec['CustomJavaScript__c'] || '',
        'cusPL': { value: {} },
        'children': { value: [] },
        'bReusable': { field: 'IsReusable__c' },
        'bpVersion': { field: 'Version__c' },
        'bpType': { field: 'Type__c' },
        'bpSubType': { field: 'SubType__c' },
        'bpLang': { field: 'Language__c' },
        'bHasAttachment': false
    };

    private elementMapping: DefinitionRecordMapping = {
        'type': { field: 'Type__c' },
        'propSetMap': rec => this.parseAsJson(rec, 'PropertySet__c'),
        'name': { field: 'Name' },
        'level': { field: 'Level__c' },
        'indexInParent': 0,
        'bHasAttachment': rec => rec.type === 'File'
    };

    public createScript(scriptRecord: OmniScriptRecord): OmniScriptDefinition {
        return this.createFromMapping<OmniScriptDefinition>(scriptRecord, this.scriptMapping);
    }

    public createElement(elementRecord: OmniScriptElementRecord): OmniScriptElementDefinition {
        const elementDefinition = this.createFromMapping<any>(elementRecord, this.elementMapping);

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

    private createFromMapping<T extends object>(record: object, recordMapping: DefinitionRecordMapping): T {
        const definition = {} as T;
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

    private parseAsJson(record: object, field: string): object | null {
        if (!record[field]) {
            return {};
        } else if (record[field] === 'null') {
            return null;
        }

        try {
            return JSON.parse(record[field]);
        } catch (err) {
            throw new Error(`Unable to parse field ${field} for record with Id ${record['Id']} as JSON: ${getErrorMessage(err)}`);
        }
    }
}

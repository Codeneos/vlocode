import { QueryFormatter, QueryService, SalesforceQueryData } from '@vlocode/salesforce';
import { injectable } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptSpecification } from './types';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';

@injectable.singleton()
export class ScriptDefinitionProvider implements OmniScriptDefinitionProvider {
    constructor(
        private readonly queryService: QueryService
    ) { }

    /**
     * Get the script definition of an Activated OmniScript by querying from the OmniScriptDefinition Object. Requires the script to be activated.
     * @param input Script definition or Id
     * @returns
     */
    public async getScriptDefinition(input: OmniScriptSpecification | string): Promise<OmniScriptDefinition> {
        const query: SalesforceQueryData = {
            sobjectType: `%vlocity_namespace%__OmniScriptDefinition__c`,
            fieldList: [`%vlocity_namespace%__Sequence__c`, `%vlocity_namespace%__Content__c`],
            orderBy: [`%vlocity_namespace%__Sequence__c`],
            orderByDirection: 'asc'
        };

        if (typeof input === 'string') {
            query.whereCondition = `vlocity_namespace__OmniScriptId__c = '${input}'`;
        } else {
            query.whereCondition = {
                left: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__Type__c = '${input.type}'`,
                operator: `and`,
                right: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__SubType__c = '${input.subType}'`
            };
            if (input.language) {
                query.whereCondition = {
                    left: query.whereCondition,
                    operator: `and`,
                    right: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__Language__c = '${input.language}'`
                };
            }
        }

        const records = await this.queryService.query(QueryFormatter.format(query), false);

        if (records.length == 0) {
            throw new Error(`Specified OmniScript doesn't exists or isn't activated, activate the OmniScript before compiling it`);
        }

        try {
            return JSON.parse(records.reduce((sum: string, record) => sum.concat(record[`Content__c`]), ''));
        } catch (err) {
            throw new Error(`OmniScript compiled definition is corrupted; re-activate the OmniScript to regenerate the compiled definitions`);
        }
    }
}

import { injectable, Logger } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptSpecification, OmniScriptElementDefinition, OmniScriptEmbeddedScriptElementDefinition, isChoiceScriptElement, OmniScriptChoiceElementDefinition } from './omniScriptDefinition';
import { OmniScriptDefinitionFactory } from './omniScriptDefinitionFactory';
import { OmniScriptDefinitionBuilder } from './omniScriptDefinitionBuilder';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';
import { OmniScriptElementRecord, OmniScriptLookupService, OmniScriptRecord } from './omniScriptLookupService';
import { SalesforceSchemaService } from '@vlocode/salesforce';
import { groupBy } from '@vlocode/util';

@injectable()
export class OmniScriptDefinitionGenerator implements OmniScriptDefinitionProvider {

    private generator = new OmniScriptDefinitionFactory();

    constructor(
        private readonly lookup: OmniScriptLookupService,
        private readonly schema: SalesforceSchemaService,
        private readonly logger: Logger) {
    }

    public async getScriptDefinition(input: string | OmniScriptSpecification): Promise<OmniScriptDefinition> {
        const scriptRecord = await this.lookup.getScript(input);
        const scriptDef = await this.buildScriptDefinition(scriptRecord);
        return scriptDef;
    }

    private async buildScriptDefinition(scriptRecord: OmniScriptRecord): Promise<OmniScriptDefinition> {
        if (scriptRecord.omniProcessType !== 'OmniScript') {
            throw new Error(
                `Script with id ${scriptRecord.id} id not an OmniScript process (${scriptRecord.omniProcessType}). ` +
                `Only OmniScript process types supported script definition generation.`);
        }

        const scriptDef = this.generator.createScript(scriptRecord);
        const scriptBuilder = new OmniScriptDefinitionBuilder(scriptDef);
        await this.addElements(scriptBuilder, scriptRecord.id);

        if (scriptBuilder.templateNames.length > 0) {
            const templateRecords = await this.lookup.getActiveTemplates(scriptBuilder.templateNames);
            for (const template of templateRecords.values()) {
                scriptBuilder.addTemplate(template);
            }
        }

        return scriptBuilder.build();
    }

    /**
     * Add all elements from the OmniScript specified by spec parameter to the script builder.
     * Skips all inactive elements and loads embedded script elements recursively.
     * @param builder Script builder to add elements to
     * @param spec OmniScript specification to add elements from or id of the script
     * @param options Optional additional options to pass to the builders 1addElements1 method
     */
    private async addElements(builder: OmniScriptDefinitionBuilder, spec: OmniScriptSpecification | string, options?: { scriptElementId?: string }) {
        const elements = await this.lookup.getScriptElements(spec);

        for (const [id, record] of elements) {
            if (!this.isElementActive(record, elements)) {
                this.logger.debug(`Skipping [${record.type}] ${record.name} ${record.level}/${record.order} (${id})`);
                continue;
            }

            const definition = this.generator.createElement(record);

            if (isChoiceScriptElement(definition)) {
                await this.loadOptions(definition);
            }

            this.logger.debug(`Adding [${record.type}] ${record.name} ${record.level}/${record.order} (${id})`);
            builder.addElement(id, definition, {
                parentElementId: record.parentElementId,
                ...(options ?? {})
            });

            if (this.isEmbeddedScriptElement(definition)) {
                const embeddedScript = {
                    type: definition.propSetMap.Type,
                    subType: definition.propSetMap['Sub Type'],
                    language: definition.propSetMap['Language']
                };

                this.logger.debug(`Embedding script elements ${embeddedScript.type}/${embeddedScript.subType}/${embeddedScript.language}`);
                const scriptRecordPromise = this.lookup.getScript(embeddedScript);
                await this.addElements(builder, embeddedScript, { scriptElementId: id });

                // Merge JS and templates
                const scriptRecord = await scriptRecordPromise;
                if (scriptRecord.isActive) {
                    builder.mergeScriptTemplates(this.generator.createScript(scriptRecord));
                }
            }
        }
    }

    private async loadOptions(element: OmniScriptChoiceElementDefinition) {
        if (element.propSetMap.optionSource.type === 'SObject' && element.propSetMap.optionSource.source) {
            if (element.propSetMap.controllingField.element) {
                element.propSetMap.dependency = await this.getDependentPicklistOptions(element.propSetMap.optionSource.source);
            } else {
                element.propSetMap.options = await this.getPicklistOptions(element.propSetMap.optionSource.source);
            }
        }
    }

    private isElementActive(element: OmniScriptElementRecord, elements: Map<string, OmniScriptElementRecord>) {
        if (!element.active) {
            return false;
        }
        if (element.parentElementId) {
            return this.isElementActive(elements.get(element.parentElementId)!, elements);
        }
        return true;
    }

    private isEmbeddedScriptElement(def: OmniScriptElementDefinition): def is OmniScriptEmbeddedScriptElementDefinition {
        return def.type === 'OmniScript';
    }

    private async getPicklistOptions(picklist: string) {
        const entries = await this.getActivePicklistEntries(picklist);
        return entries.map(entry => ({ value: entry.label ?? entry.value, name: entry.value }));
    }

    private async getDependentPicklistOptions(picklist: string) {
        const entries = await this.getActivePicklistEntries(picklist);
        return groupBy(entries, 'validFor', entry => ({ value: entry.label ?? entry.value, name: entry.value }));
    }

    private async getActivePicklistEntries(picklist: string) {
        try {
            const [type, field] = picklist.split('.');
            const values = await this.schema.describePicklistValues(type, field);
            return values.filter(entry => entry.active);
        } catch(error) {
            this.logger.warn(`Unable to retrieve picklist values for: ${picklist}`);
        }
        return [];
    }
}

import { injectable, Logger } from '@vlocode/core';
import { NamespaceService, SalesforceLabels, SalesforceSchemaService } from '@vlocode/salesforce';
import { groupBy, sortBy } from '@vlocode/util';
import { VlocityDatapack, VlocityInterfaceInvoker } from '@vlocode/vlocity';

import { OmniScriptDefinition, OmniScriptSpecification, isChoiceScriptElement, OmniScriptChoiceElementDefinition } from './types';
import { OmniScriptDefinitionFactory } from './omniScriptDefinitionFactory';
import { OmniScriptDefinitionBuilder } from './omniScriptDefinitionBuilder';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';
import { OmniScriptElementRecord, OmniScriptRecord } from './types/omniScript';
import { OmniScriptAccess } from './omniScriptAccess';

@injectable()
export class OmniScriptDefinitionGenerator implements OmniScriptDefinitionProvider {

    private generator = new OmniScriptDefinitionFactory();

    constructor(
        private readonly scriptAccess: OmniScriptAccess,
        private readonly genericInvoker: VlocityInterfaceInvoker,
        private readonly schema: SalesforceSchemaService,
        private readonly labels: SalesforceLabels,
        private readonly namespaceService: NamespaceService,
        private readonly logger: Logger
    ) { }

    public async getScriptDefinition(input: string | OmniScriptSpecification): Promise<OmniScriptDefinition> {
        const scriptRecord = await this.scriptAccess.find(input);
        const scriptDef = await this.buildScriptDefinition(scriptRecord);
        return scriptDef;
    }

    public async getScriptDefinitionFromDatapack(datapack: VlocityDatapack): Promise<OmniScriptDefinition> {
        if (datapack.datapackType !== 'OmniScript') {
            throw new Error(`Datapack ${datapack.vlocityDataPackKey} is not an OmniScript`);
        }

        const record = this.namespaceService.updateObjectNamespace(OmniScriptRecord.fromDatapack(datapack));
        return this.buildScriptDefinition(record, record.elements);
    }

    private async buildScriptDefinition(
        scriptRecord: OmniScriptRecord, 
        elementRecords?: OmniScriptElementRecord[]
    ) : Promise<OmniScriptDefinition> {
        if (scriptRecord.omniProcessType !== 'OmniScript') {
            throw new Error(
                `OmniScript ${scriptRecord.id} is not an OmniScript process (${scriptRecord.omniProcessType}). ` +
                `Only OmniScript process types supported script definition generation.`
            );
        }

        const scriptDef = this.generator.createScript(scriptRecord);
        const scriptBuilder = new OmniScriptDefinitionBuilder(scriptDef);
        await this.addElements(scriptBuilder, elementRecords || scriptRecord.id);

        if (scriptBuilder.templateNames.length > 0) {
            const templateRecords = await this.scriptAccess.findActiveTemplates(scriptBuilder.templateNames);
            for (const template of templateRecords.values()) {
                scriptBuilder.addTemplate(template);
            }
        }

        // Add Labels and translate them to the current user language
        const labels = await this.labels.getCustomLabels(Object.keys(scriptDef.labelKeyMap));
        scriptDef.labelKeyMap = Object.fromEntries(Object.values(labels).map(label => ([label.name, label.value])));

        return scriptBuilder.build();
    }

    /**
     * Add all elements from the OmniScript specified by spec parameter to the script builder.
     * Skips all inactive elements and loads embedded script elements recursively.
     * @param builder Script builder to add elements to
     * @param elementsOrSpec OmniScript specification to add elements from or id of the script
     * @param options Optional additional options to pass to the builders `addElements` method
     */
    private async addElements(
        builder: OmniScriptDefinitionBuilder, 
        elementsOrSpec: OmniScriptElementRecord[] | OmniScriptSpecification | string, 
        options?: { scriptElementId?: string }
    ) {
        const scriptElements = Array.isArray(elementsOrSpec) ? elementsOrSpec 
            : typeof elementsOrSpec === 'string' 
            ? await this.scriptAccess.elements({ scriptId: elementsOrSpec }) 
            : (await this.scriptAccess.find(elementsOrSpec, { preferActive: true, withElements: true })).elements;

        const elements = new Map(
            sortBy(scriptElements, rec => (rec.level << 16) | rec.order, 'asc').map(record => [record.id, record])
        );

        for (const [id, record] of elements) {
            if (!this.isElementActive(record, elements)) {
                this.logger.debug(`Skipping [${record.type}] ${record.name} (${id})`);
                continue;
            }

            const definition = this.generator.createElement(record);

            if (definition.level === undefined) {
                definition.level = record.parentElementId ? builder.elementLevel(record.parentElementId) : 0;
            }

            if (isChoiceScriptElement(definition)) {
                if (builder.realtimePicklistSeed) {
                    // Add ru time picklists to definition so they can be resolved at runtime
                    builder.addRuntimePicklistSource(definition.propSetMap.optionSource, definition.propSetMap.controllingField);
                } else {
                    // Loading of picklist options can fail
                    await this.loadOptions(builder, definition);
                }
            }

            try {
                this.logger.debug(`Adding ${record.name} (${record.type})`);
                builder.addElement(id, definition, {
                    parentElementId: record.parentElementId,
                    ...(options ?? {})
                });
            } catch(error) {
                this.logger.error(`Failed to add element ${record.name} (${record.type}) to script definition:`, error);
            }

            if (definition.type === 'OmniScript') {
                const embeddedScript = {
                    type: definition.propSetMap.Type,
                    subType: definition.propSetMap['Sub Type'],
                    language: definition.propSetMap['Language']
                };

                this.logger.debug(`Embedding script elements ${embeddedScript.type}/${embeddedScript.subType}/${embeddedScript.language}`);
                await this.addElements(builder, embeddedScript, { scriptElementId: id });

                // Merge JS and templates
                const scriptRecord = await this.scriptAccess.find(embeddedScript);
                builder.embedScriptHeader(this.generator.createScript(scriptRecord));
            }
        }
    }

    private async loadOptions(builder: OmniScriptDefinitionBuilder, element: OmniScriptChoiceElementDefinition) {
        if (!element.propSetMap.optionSource.source) {
            return;
        }

        if (element.propSetMap.optionSource.type === 'SObject') {
            this.logger.debug(`Loading picklist options for SObject field: ${element.propSetMap.optionSource.source}`);
            if (element.propSetMap.controllingField.type === 'SObject' && element.propSetMap.controllingField.element) {
                element.propSetMap.dependency = await this.getDependentPicklistOptions(element.propSetMap.optionSource.source);
            } else {
                element.propSetMap.options = await this.getPicklistOptions(element.propSetMap.optionSource.source);
            }
        }

        if (element.propSetMap.optionSource.type === 'Custom') {
            if (element.propSetMap.controllingField.type === 'Custom' && element.propSetMap.controllingField.element) {
                // Let Vlocity handle custom dependent picklist sources at runtime
                builder.addRuntimePicklistSource(element.propSetMap.optionSource, element.propSetMap.controllingField);
            } else if (element.propSetMap.optionSource.source?.includes('.')) {
                this.logger.debug(`Loading picklist options from Custom source: ${element.propSetMap.optionSource.source}`);
                try {
                    const response = await this.genericInvoker.invoke(element.propSetMap.optionSource.source);
                    if (!Array.isArray(response.options)) {
                        element.propSetMap.options = [ { value: `Error ${element.propSetMap.optionSource.source} returned no options`, name: 'ERR' } ];
                    } else {
                        element.propSetMap.options = response.options;
                    }
                } catch(err) {
                    // When loading of picklist elements fails instead delegate loading to be done at runtime
                    // to avoid blocking the script builder from generating the rest of the script definition
                    builder.addRuntimePicklistSource(element.propSetMap.optionSource);
                    this.logger.warn(`Unable to load custom picklist options for script element "${element.name}":`, err);
                }
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
        } catch {
            this.logger.warn(`Unable to retrieve picklist values for: ${picklist}`);
        }
        return [];
    }
}

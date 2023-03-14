import { injectable, Logger } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptSpecification, OmniScriptElementDefinition, OmniScriptEmbeddedScriptElementDefinition } from './omniScriptDefinition';
import { OmniScriptDefinitionFactory } from './omniScriptDefinitionFactory';
import { OmniScriptDefinitionBuilder } from './omniScriptDefinitionBuilder';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';
import { OmniScriptElementRecord, OmniScriptLookupService, OmniScriptRecord } from './omniScriptLookupService';

@injectable()
export class OmniScriptLocalDefinitionProvider implements OmniScriptDefinitionProvider {

    private generator = new OmniScriptDefinitionFactory();

    constructor(
        private readonly lookup: OmniScriptLookupService,
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
                continue;
            }

            const definition = this.generator.createElement(record);

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

                await this.addElements(builder, embeddedScript, { scriptElementId: id });
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
}

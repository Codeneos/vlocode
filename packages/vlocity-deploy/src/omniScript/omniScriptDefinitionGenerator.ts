import { injectable, Logger } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptSpecification, OmniScriptElementDefinition, OmniScriptEmbeddedScriptElementDefinition } from './omniScriptDefinition';
import { Iterable } from '@vlocode/util';
import { OmniScriptDefinitionFactory } from './omniScriptDefinitionFactory';
import { OmniScriptDefinitionBuilder } from './omniScriptDefinitionBuilder';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';
import { OmniScriptLookupService, OmniScriptRecord } from './omniScriptLookupService';

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

        const elements = await this.lookup.getScriptElements(scriptRecord.id);
        const elementDefs = new Map(Iterable.map(elements.values(), record => 
            [
                record.id, { 
                    definition: this.generator.createElement(record),
                    record 
                } 
            ]
        ));

        for (const { definition, record } of elementDefs.values()) {            
            scriptBuilder.addElement(record.id, definition, {
                parentElementId: record.parentElementId
            });

            if (this.isEmbeddedScriptElement(definition)) {
                const elements = await this.lookup.getScriptElements({ 
                    type: definition.propSetMap.Type,
                    subType: definition.propSetMap['Sub Type'],
                    language: definition.propSetMap['Language']
                });

                for (const [id, scriptElementRecord] of elements) {
                    scriptBuilder.addElement(id, this.generator.createElement(scriptElementRecord), {
                        parentElementId: scriptElementRecord.parentElementId,
                        scriptElementId: record.id
                    });
                }
            }
        }

        if (scriptBuilder.templateNames.length > 0) {
            const templateRecords = await this.lookup.getActiveTemplates(scriptBuilder.templateNames);
            for (const template of templateRecords.values()) {
                scriptBuilder.addTemplate(template);
            }
        }

        return scriptBuilder.build();
    }

    private isEmbeddedScriptElement(def: OmniScriptElementDefinition): def is OmniScriptEmbeddedScriptElementDefinition {
        return def.type === 'OmniScript';
    }
}

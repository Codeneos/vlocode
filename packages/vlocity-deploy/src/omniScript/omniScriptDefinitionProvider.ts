import { OmniScriptDefinition, OmniScriptDetail } from './omniScriptDefinition';

/**
 * Provides OmniScript definitions.
 */
export interface OmniScriptDefinitionProvider {
    /**
     * Get the script definition of an OmniScript based on the Id or the type and subtype
     * @param input Script definition or Id
     */
    getScriptDefinition(input: string | OmniScriptDetail): OmniScriptDefinition | Promise<OmniScriptDefinition>;
}

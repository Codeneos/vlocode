import type { DatapackExportDefinition } from '@vlocode/vlocity-deploy';

export interface OmniStudioExportDefinitionEntry extends Partial<DatapackExportDefinition> {
    readonly config?: Partial<DatapackExportDefinition>;
}

export interface OmniStudioDatapackDefinitionConfig {
    readonly exportDefinitions: Record<string, OmniStudioExportDefinitionEntry | OmniStudioExportDefinitionEntry[]> | OmniStudioExportDefinitionEntry[];
}

declare const definitions: OmniStudioDatapackDefinitionConfig;

export default definitions;

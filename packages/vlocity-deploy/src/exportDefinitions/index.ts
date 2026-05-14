import type { DatapackExportDefinition } from '../export/exportDefinitions';

import industriesDefinitions from './industriesDatapackDefinitions.json';
import omniStudioManagedDefinitions from './omnistudioManagedDatapackDefinitions.json';
import omniStudioStandardDefinitions from './omnistudioStandardDatapackDefinitions.json';

export interface DatapackExportDefinitionFile {
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly definitions: {
        readonly [datapackType: string]: Readonly<DatapackExportDefinition>;
    };
}

export interface TypedDatapackExportDefinition extends DatapackExportDefinition {
    /**
     * The type of datapack to export, this is used to determine the export definition to use and is also used as the folder name of the exported datapack.
     */
    datapackType: string;
}

/**
 * Export definitions for Vlocity DataPacks, including predefined definitions for OmniStudio and Industries DataPacks.
 */
export const DatapackExportDefinitions = {
    industries: industriesDefinitions as unknown as DatapackExportDefinitionFile,
    omniStudioManaged: omniStudioManagedDefinitions as unknown as DatapackExportDefinitionFile,
    omniStudioStandard: omniStudioStandardDefinitions as unknown as DatapackExportDefinitionFile,
    all: [
        ...Object.entries(omniStudioManagedDefinitions.definitions).map(([key, definition]) => Object.assign (definition, { datapackType: key })),
        ...Object.entries(omniStudioStandardDefinitions.definitions).map(([key, definition]) => Object.assign (definition, { datapackType: key })),
        ...Object.entries(industriesDefinitions.definitions).map(([key, definition]) => Object.assign (definition, { datapackType: key })),
    ] as TypedDatapackExportDefinition[]
} as const;

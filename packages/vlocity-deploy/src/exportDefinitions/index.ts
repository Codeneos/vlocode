import type { DatapackExportDefinition } from '../export/exportDefinitions';

import industriesDefinitions from './industriesDatapackDefinitions.json';
import omniStudioManagedDefinitions from './omnistudioManagedDatapackDefinitions.json';
import omniStudioStandardDefinitions from './omnistudioStandardDatapackDefinitions.json';

export interface DatapackExportDefinitionFile {
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly definitions: Readonly<Record<string, DatapackExportDefinition>>;
}

export const datapackDefinitions = {
    industries: industriesDefinitions as unknown as DatapackExportDefinitionFile,
    omniStudioManaged: omniStudioManagedDefinitions as unknown as DatapackExportDefinitionFile,
    omniStudioStandard: omniStudioStandardDefinitions as unknown as DatapackExportDefinitionFile
} as const;

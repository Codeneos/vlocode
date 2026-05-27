import { BaseConfiguration } from './config';

export abstract class VlocodeSalesforceConfiguration extends BaseConfiguration {
    enabled: boolean;
    deployOnSave: boolean;
    apiVersion: string;
    manageMetaXmlFiles: boolean;
    developerLogsVisible: boolean;
    developerLogsAutoRefresh: boolean;
    developerLogsVisibility: 'self' | 'all';
    developerLogsLimit: number;
    exportFolder: string;
    exportFormat: 'classic' | 'sfdx';
}

export abstract class VlocodeVlocityDeployConfiguration extends BaseConfiguration {
    chunkSize: number;
    bulkApiThreshold: number;
    useBulkApi: boolean;
    standardRuntime: boolean;
    lwcActivation: boolean;
    lwcDeploymentType: 'metadata' | 'tooling';
    disableTriggers: boolean;
    allowUnresolvedDependencies: boolean;
}

export type CustomExportDefinitionFiles = Record<string, string>;

export default abstract class VlocodeConfiguration extends BaseConfiguration {
    logLevel: 'info' | 'verbose' | 'debug';
    enableLogLinks: boolean;
    //sfdxUsername?: string;
    projectPath?: string;
    customJobOptionsYaml?: string;
    customExportDefinitionFiles?: CustomExportDefinitionFiles;
    parallelLimit?: number;
    deployOnSave: boolean;
    autoActivate: boolean;
    compileOnBuild: boolean;
    deploymentMode: 'direct' | 'compatibility';
    conditionalContextMenus: boolean;
    deploy: VlocodeVlocityDeployConfiguration;
    salesforce: VlocodeSalesforceConfiguration;
    suggestRefactoringOnRename: boolean;
    applyRefactoringWithoutPreview: boolean;
    fsInterface: 'vscode' | 'native';
}

import { BaseConfiguration } from './config';

export abstract class VlocodeSalesforceConfiguration extends BaseConfiguration {
    enabled: boolean;
    deployOnSave: boolean;
    apiVersion: string;
    manageMetaXmlFiles: boolean;
    developerLogsVisible: boolean;
    developerLogsAutoRefresh: boolean;
    developerLogsVisibility: 'self' | 'all';
}

export abstract class VlocodeVlocityDeployConfiguration extends BaseConfiguration {
    chunkSize: number;
    bulkApiThreshold: number;
    useBulkApi: boolean;
}

export default abstract class VlocodeConfiguration extends BaseConfiguration {
    logLevel: 'info' | 'verbose' | 'debug';
    sfdxUsername?: string;
    projectPath?: string;
    customJobOptionsYaml?: string;
    parallelLimit?: number;
    deployOnSave: boolean;
    autoActivate: boolean;
    compileOnBuild: boolean;
    logInTerminal: boolean;
    deploymentMode: 'direct' | 'compatibility';
    conditionalContextMenus: boolean;
    deploy: VlocodeVlocityDeployConfiguration;
    salesforce: VlocodeSalesforceConfiguration;
}
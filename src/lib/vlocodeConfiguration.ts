export abstract class VlocodeSalesforceConfiguration {
    enabled: boolean;
    deployOnSave: boolean;
    apiVersion: string;
    manageMetaXmlFiles: boolean;
    developerLogsVisible: boolean;
    developerLogsAutoRefresh: boolean;
    developerLogsVisibility: 'self' | 'all';
}

export default abstract class VlocodeConfiguration {
    verbose: boolean;
    logLevel: 'info' | 'verbose' | 'debug';
    sfdxUsername?: string;
    httpProxy?: string;
    additionalOptions?: any;
    projectPath?: string;
    maxDepth?: number;
    customJobOptionsYaml?: string;
    deployOnSave: boolean;
    autoActivate: boolean;
    compileOnBuild: boolean;
    logInTerminal: boolean;
    deploymentMode: 'direct' | 'compatibility';
    salesforce: VlocodeSalesforceConfiguration;
}
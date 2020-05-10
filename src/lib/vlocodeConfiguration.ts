export interface VlocodeSalesforceConfiguration {
    enabled: boolean;
    deployOnSave: boolean;
    apiVersion: string;
    manageMetaXmlFiles: boolean;
}

export default interface Vlocodefiguration {
    verbose: boolean;
    debug: boolean;
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
    salesforce?: VlocodeSalesforceConfiguration;
}
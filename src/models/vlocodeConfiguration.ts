export interface VlocodeSalesforceConfiguration {
    enabled: boolean;
    deployOnSave: boolean;
    apiVersion: string;
}

export default interface Vlocodefiguration {
    verbose: boolean;
    debug: boolean;
    sfdxUsername?: string;
    username?: string;
    password?: string;
    loginUrl?: string;
    instanceUrl?: string;
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
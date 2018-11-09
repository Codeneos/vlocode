/**
 * Simple TS declaration file for Vlocity NPM module
 */

declare module 'vlocity' {

    import * as jsforce from 'jsforce';   

    class vlocity {
    
        constructor(options: vlocity.JobOptions);
    
        checkLogin(onSuccess: any, onError: any): void;
    
        getNamespace(onSuccess: any, onError: any): any;
    
        getPackageVersion(onSuccess: any, onError: any): void;
    
        login(onSuccess: any, onError: any, retryCount: Number): any;
    
        loginFailedMessage(error: any): any;
    
        sfdxLogin(onSuccess: any, onError: any): any;
    
        static runDataPacksCommand(action: vlocity.actionType, options: vlocity.JobOptions): any;
    
        readonly datapacksjob : vlocity.DatapacksJob;    
        readonly datapacksexpand : vlocity.DataPacksExpand;    
        readonly datapacksutils: vlocity.DataPacksUtils;    
        readonly datapacksexportbuildfile: vlocity.DataPacksExportBuildFile;
        readonly datapacksbuilder: vlocity.DataPacksBuilder;

        readonly tempFolder: string;
        readonly namespace: string;
    
        jsForceConnection: jsforce.Connection;
        accessToken: string;
        verbose: boolean;    
        sessionId: string;
        instanceUrl: string;
        passedInOptionsOverride: string;
        sfdxUsername: string;
    }

    export = vlocity;

    namespace vlocity {
        export class DatapacksJob {
            runJob(command : actionType, jobInfo: JobInfo, resolve, reject) : Promise<VlocityJobResult>
            /**
             * Data loaded from 'defaultjobsettings.yaml'
             */
            defaultJobSettings: any;
            /**
             * Data loaded from 'querydefinition.yaml'
             */
            queryDefinitions: { [datapackType: string] : QueryDefinition };
        }
    
        export interface QueryDefinition {
            VlocityDataPackType: string;
            query: string;
        }
    
        export class DataPacksExpand {
            generateFolderPath(dataPackType, parentName) : string;
            generateFolderOrFilename(filename, extension) : string;
            generateFilepath(dataPackType, parentName, filename, extension) : string;
            getNameWithFields(nameFields, dataPackData): string;
            getDataPackName (dataPackType, sObjectType, dataPackData) : string;        
            getListFileName(dataPackType, sObjectType, dataPackData) : string;         
            getDataPackFolder(dataPackType, sObjectType, dataPackData) : string;
        }
    
        export class DataPacksExportBuildFile {
            filename : string;
            currentExportFileData: any;
            readonly vlocity: any;
            resetExportBuildFile(djobInfo: JobInfo) : string;
            setFilename(jobInfon: JobInfo) : string;
            loadExportBuildFile(jobInfo: JobInfo) : string;
            saveFile(): void;
            addToExportBuildFile (jobInfo: JobInfo, dataPackData: any) : void;
        }
    
        export class DataPacksUtils {
            saveCurrentJobInfo(djobInfo: JobInfo) : void;
            loadCurrentJobInfo(jobInfon: JobInfo) : void;
            printJobStatus(jobInfo: JobInfo) : void;
        }

        export class DataPacksBuilder {
            allFileDataMap: {[key: string] : any};
        }

        export type VlocityJobStatus = 'Error' | 'Success' ;
    
        export interface VlocityJobResult {
            action?: string;
            message?: string;
            status?: VlocityJobStatus;
            records?: VlocityDatapackRecord[];
        }
        
        export interface VlocityDatapackRecord {
            ErrorMessage?: string;
            VlocityDataPackKey?: string;
            VlocityDataPackStatus?: VlocityJobStatus;
        }
    
        export interface JobOptions {
            sfdxUsername?: string;
            username?: string;
            password?: string;
            vlocityNamespace?: string;
            loginUrl?: string;
            accessToken?: string;
            sessionId?: string;
            instanceUrl?: string;
            httpProxy?: string;
            verbose?: boolean;
            performance?: boolean;
            passedInOptionsOverride?: string;
            commandLineOptionsOverride?: string;
            projectPath? : string;
            maxDepth?: number;
            // From JobInfo
            strict?:  boolean;
            continueAfterError?: boolean;
            supportHeadersOnly?: boolean;
            supportForceDeploy?: boolean;
            ignoreAllErrors?: boolean;
        }
    
        export interface JobInfo extends JobOptions {
            exportBuildFile?: string;
            fullManifest?: any;
            skipQueries?: boolean;
            queries?: any;
            manifest?: any;
            [key: string]: any;
        } 
    
        type actionType = 
            'Export' | 
            'Import' | 
            'Deploy' | 
            'BuildFile' | 
            'ExpandFile' | 
            'GetDiffs' | 
            'GetDiffsAndDeploy' | 
            'GetAllAvailableExports' |
            'RefreshProject' |
            'BuildManifest' |
            'ValidateLocalData' |
            'CleanOrgData' |
            'UpdateSettings' |
            'RefreshVlocityBase' |
            'Apex' |
            'JavaScript';
    }
}


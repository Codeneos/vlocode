/**
 * Simple TS declaration file for Vlocity NPM module
 */

declare module 'vlocity' {

    import * as jsforce from 'jsforce';   

    class vlocity {
    
        constructor(options: vlocity.JobOptions);
    
        /**
         * Refreshs loging token and sets `namespace` property.
         */
        checkLogin(): Promise<void>;
    
        /**
         * Logsin into Salesforce and sets the `organizationId`
         * @param retryCount number of tries to retry before thrown an exception
         */
        login(retryCount: Number): Promise<void>;
    
        static runDataPacksCommand(action: vlocity.actionType, options: vlocity.JobOptions) : Promise<vlocity.VlocityJobResult>
    
        readonly datapacksjob : vlocity.DatapacksJob;    
        readonly datapacksexpand : vlocity.DataPacksExpand;    
        readonly datapacksutils: vlocity.DataPacksUtils;    
        readonly datapacksexportbuildfile: vlocity.DataPacksExportBuildFile;
        readonly datapacksbuilder: vlocity.DataPacksBuilder;

        readonly PackageVersion : string; 
        readonly PackageMajorVersion : string;
        readonly PackageMinorVersion : string;
        readonly BuildToolSettingVersion : string;

        readonly tempFolder: string;
        readonly namespace: string;
        readonly namespacePrefix: string;
    
        jsForceConnection: jsforce.Connection;
        accessToken: string;
        verbose: boolean;    
        sessionId: string;
        instanceUrl: string;
        organizationId: string;
        passedInOptionsOverride: string;
        sfdxUsername: string;
    }

    export = vlocity;

    namespace vlocity {
        export class DatapacksJob {
            runJob(action : actionType, jobInfo: JobInfo) : Promise<VlocityJobResult>
            runJobWithInfo(jobInfo: JobInfo, action : actionType) : Promise<VlocityJobResult>
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
            generateFolderPath(dataPackType: string, parentName: string) : string;
            generateFolderOrFilename(filename: string, extension: string) : string;
            generateFilepath(dataPackType: string, parentName: string, filename: string, extension: string) : string;
            getNameWithFields(nameFields: string[], dataPackData: {}): string;
            getDataPackName (dataPackType: string, sObjectType: string, dataPackData : {}) : string;     
            getListFileName(dataPackType: string, sObjectType: string, dataPackData : {}) : string;         
            getDataPackFolder(dataPackType: string, sObjectType: string, dataPackData : {}) : string;
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

        export class UtilityService {                
            /**
             * Sets `namespace` and `namespacePrefix` property.
             */
            getNamespace(): Promise<void>;
        
            /**
             * Sets `PackageVersion`, `PackageMajorVersion`, `PackageMinorVersion` and `BuildToolSettingVersion`
             */
            getPackageVersion(): Promise<void>;
        }

        export class DataPacksBuilder {
            allFileDataMap: {[key: string] : any};
        }

        export type VlocityJobStatus = 'Error' | 'Success' ;
    
        export interface VlocityJobResult {
            action?: string;
            records?: VlocityDatapackRecord[];
            status?: VlocityJobStatus;
            message?: string;
            data?: any;            
        }
        
        export interface VlocityDatapackRecord {
            ErrorMessage?: string;
            VlocityDataPackKey?: string;
            VlocityDataPackStatus?: VlocityJobStatus;
            VlocityDataPackDisplayLabel?: string;
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
            jobAction?: actionType;
            exportBuildFile?: string;
            fullManifest?: any;
            skipQueries?: boolean;
            queries?: any;
            manifest?: any;
            hasError?: boolean;
            errors?: string[];
            sourceKeyToRecordId?: { [key: string] : string }
            currentStatus?: any[];
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
            'JavaScript' |
            'RetrieveSalesforce' |
            'GetAllAvailableExports' ;
    }
}


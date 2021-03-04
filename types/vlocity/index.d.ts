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
        login(retryCount: number): Promise<void>;

        static runDataPacksCommand(action: vlocity.actionType, options: vlocity.JobOptions) : Promise<vlocity.VlocityJobResult>

        readonly datapacksjob : vlocity.DatapacksJob;
        readonly datapacksexpand : vlocity.DataPacksExpand;
        readonly datapacksutils: vlocity.DataPacksUtils;
        readonly datapacksexportbuildfile: vlocity.DataPacksExportBuildFile;
        readonly datapacksbuilder: vlocity.DataPacksBuilder;
        readonly utilityservice: vlocity.UtilityService;

        readonly PackageVersion : string;
        readonly PackageMajorVersion : string;
        readonly PackageMinorVersion : string;
        readonly BuildToolSettingVersion : string;

        readonly tempFolder: string;
        readonly namespacePrefix: string;

        jsForceConnection: jsforce.Connection;
        accessToken: string;
        verbose: boolean;
        sessionId: string;
        instanceUrl: string;
        organizationId: string;
        passedInOptionsOverride: string;
        sfdxUsername: string;
        namespace: string;
    }

    export = vlocity

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
            overrideExpandedDefinition(overrides : any) : void;
            getExpandedDefinition(datapack: string, sobject: string | undefined | null, key: string) : any;
            isGuaranteedParentKey(parentKey : any) : boolean;
            loadApex(projectPath: string, filePath: string) : string;
            runApex(projectPath: string, filePaths: string, currentContextData: any) : Promise<void>
        }

        export class UtilityService {
            /**
             * Setups the connection depended properties, ensure is is called before doing any command.
             * Internally calls `getNamespace`, `getPackageVersion` and updates the expand definitions.
             */
            checkLogin(): Promise<void>;

            /**
             * Sets `namespace` and `namespacePrefix` property.
             */
            getNamespace(): Promise<void>;

            /**
             * Sets `PackageVersion`, `PackageMajorVersion`, `PackageMinorVersion` and `BuildToolSettingVersion`
             */
            getPackageVersion(): Promise<void>;

            login(): Promise<void>;

            sfdxLogin(): Promise<void>;
        }

        export class DataPacksBuilder {
            allFileDataMap: {[key: string] : any};
            compile: (lang: string, source: string, options: { includePaths: Array<string> }, cb: (error: any, css: string) => void) => void;
        }

        export interface VlocityJobResult {
            action: string;
            records: VlocityDatapackRecord[];
            status: 'error' | 'success';
            currentStatus: string;
            message: string;
        }

        export interface VlocityDatapackRecord {
            /** Optional error message; only set if `VlocityDataPackStatus == 'Error'` */
            ErrorMessage?: string;
            /** Datapack Manifest key in the, for example: OmniScript/MACD_FDO */
            VlocityDataPackKey: string;
            /** Type of the datapack; or example 'OmniScript', 'DataRaptor', etc */
            VlocityDataPackType: string;
            /** Status of the export; can either be Success or Error */
            VlocityDataPackStatus: 'Error' | 'Success' | 'Ready';
            /** Display label based on the datapack label settings */
            VlocityDataPackDisplayLabel: string;
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
            'RetrieveSalesforce';
    }
}


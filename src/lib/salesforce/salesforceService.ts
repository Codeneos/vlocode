import * as constants from '@constants';
import * as vscode from 'vscode';
import axios from 'axios';
import * as jsforce from 'jsforce';
import * as xml2js from 'xml2js';

import { Logger, injectable, FileSystem } from '@vlocode/core';
import JsForceConnectionProvider from '@lib/salesforce/connection/jsForceConnectionProvider';
import SObjectRecord from '@lib/salesforce/sobjectRecord';
import { cache , Timer , substringAfter, XML, evalTemplate, fileName, mapAsyncParallel } from '@vlocode/util';
import { PropertyAccessor } from '@lib/types';
import { stripPrefix } from 'xml2js/lib/processors';
import { VlocityNamespaceService } from '@lib/vlocity/vlocityNamespaceService';
import QueryService, { QueryResult } from './queryService';
import { SalesforceDeployService } from './salesforceDeployService';
import SalesforceLookupService from './salesforceLookupService';
import SalesforceSchemaService from './salesforceSchemaService';
import { DeveloperLog, DeveloperLogRecord } from './developerLog';
import RecordBatch from './recordBatch';
import { SalesforcePackageBuilder, SalesforcePackageType } from './deploymentPackageBuilder';
import { MetadataRegistry, MetadataType } from './metadataRegistry';
import { SalesforceProfile } from './salesforceProfile';
import { VSCodeFileSystemAdapter } from '../fs/vscodeFileSystemAdapter';

export interface InstalledPackageRecord extends jsforce.FileProperties {
    manageableState: string;
    namespacePrefix: string;
}

export interface OrganizationDetails {
    id: string;
    name: string;
    primaryContact: string;
    instanceName: string;
    isSandbox: boolean;
    organizationType: string;
    namespacePrefix: string;
}

export interface SalesforceDebugLevel {
    /**
     * Optionally the id or Level
     */
    id?: string;
    /**
     * Optionally the name of the logging level
     */
    developerName?: string;
    /** 
     * The log category level for Apex code. Includes information about Apex code. Can also include 
     * log messages generated by data manipulation language (DML) statements, inline SOQL or SOSL 
     * queries, the start and completion of triggers, the start and completion of test methods, 
     * and so on.
     */
    apexCode: 'None' | 'Error' | 'Warn' | 'Info' | 'Debug' | 'Fine' | 'Finer' | 'Finest';
    /**
     * The log category level for profiling information. Includes cumulative profiling information, 
     * such as the limits for your namespace, the number of emails sent, and so on. 
     */
    apexProfiling: 'None' | 'Info' | 'Fine' | 'Finest' ;
    /**
     * The log category level for callouts. Includes the request-response XML that the server is sending 
     * and receiving from an external Web service. The request-response XML is useful when debugging 
     * issues related to SOAP API calls.
     */
    callout: 'None' | 'Info' | 'Finest';
    /**
     * The log category for database activity. Includes information about database activity, 
     * including every DML statement or inline SOQL or SOSL query.
     */
    database: 'None' | 'Info' | 'Finest';
    /**
     * The log category level for validation rules. Includes information about validation rules, 
     * such as the name of the rule, or whether the rule evaluated true or false. 
     */
    validation: 'Info' | 'None';
    /**
     * The log category level for Visualforce. Includes information about Visualforce events, 
     * including serialization and deserialization of the view state or the evaluation of a 
     */
    visualforce: 'None' | 'Info' | 'Fine' | 'Finest' ;
    /**
     * The log category level for workflow rules. Includes information for workflow rules, 
     * such as the rule name and the actions taken.
     */
    workflow: 'None' | 'Error' | 'Warn' | 'Info' |  'Fine' | 'Finer' ;
    /**
     * The log category level for calls to all system methods, such as the System.debug method.
     */
    system: 'None' | 'Info' | 'Debug' | 'Fine' ;
}

type SoapDebuggingLevel = 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'FINE' | 'FINER' | 'FINEST';
export interface SoapDebuggingHeader {
    Db?: SoapDebuggingLevel;
    Workflow?: SoapDebuggingLevel;
    Validation?: SoapDebuggingLevel;
    Callout?: SoapDebuggingLevel;
    Apex_code?: SoapDebuggingLevel;
    Apex_profiling?: SoapDebuggingLevel;
    Visualforce?: SoapDebuggingLevel;
    System?: SoapDebuggingLevel;
    NBA?: SoapDebuggingLevel;
    Wave?: SoapDebuggingLevel;
    All?: SoapDebuggingLevel;
}

/**
 * Simple Salesforce SOAP request formatter
 */
class SoapRequest {

    constructor(
        public readonly method : string,
        public readonly namespace : string,
        public readonly debuggingHeader: SoapDebuggingHeader = {}) {
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    public toXml(requestBody: Object, sessionId: string) : string {
        const soapRequestObject = {
            'soap:Envelope': {
                $: {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns': this.namespace
                },
                'soap:Header': {
                    CallOptions: {
                        client: constants.API_CLIENT_NAME
                    },
                    DebuggingHeader: {
                        categories: Object.entries(this.debuggingHeader).map(([category, level]) => ({ category, level }))
                    },
                    SessionHeader: {
                        sessionId: sessionId
                    }
                },
                'soap:Body': {
                    [this.method]: requestBody,
                }
            }
        };
        return new xml2js.Builder(constants.MD_XML_OPTIONS).buildObject(soapRequestObject);
    }
}

/**
 * Simple SOAP response
 */
interface SoapResponse {
    Envelope: {
        Header?: any;
        Body?: {
            Fault?: {
                faultcode: string;
                faultstring: string;
            };
            [key: string]: any;
        };
    };
}

interface MetadataInfo { type: string; fullName: string; metadata: any; name: string; namespace?: string };

@injectable()
export default class SalesforceService implements JsForceConnectionProvider {

    @injectable.property public readonly metadataRegistry: MetadataRegistry;
    @injectable.property public readonly schema: SalesforceSchemaService;
    @injectable.property public readonly lookupService: SalesforceLookupService;
    @injectable.property public readonly deploy: SalesforceDeployService;

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly namespaceService: VlocityNamespaceService,
        private readonly queryService: QueryService,
        private readonly logger: Logger,
        private readonly fs: FileSystem) {
        this.fs = new VSCodeFileSystemAdapter(fs);
    }

    public async isProductionOrg() : Promise<boolean> {
        return !(await this.getOrganizationDetails()).isSandbox;
    }

    public getJsForceConnection() : Promise<jsforce.Connection> {
        return this.connectionProvider.getJsForceConnection();
    }

    public async isPackageInstalled(packageName: string | RegExp) : Promise<boolean> {
        return (await this.getInstalledPackageDetails(packageName)) !== undefined;
    }

    public async getPageUrl(page : string, ops?: { namespacePrefix? : string; useFrontdoor?: boolean}) {
        const con = await this.getJsForceConnection();
        let relativeUrl = page.replace(/^\/+/, '');
        if (relativeUrl.startsWith('apex/')) {
            // Build lightning URL
            const state = {
                componentDef: 'one:alohaPage',
                attributes: {
                    address: `${con.instanceUrl}/${relativeUrl}`
                },
                state: { }
            };
            relativeUrl = `one/one.app#${Buffer.from(JSON.stringify(state)).toString('base64')}`;
        }

        if (ops?.useFrontdoor) {
            relativeUrl = `secur/frontdoor.jsp?sid=${encodeURIComponent(con.accessToken)}&retURL=${encodeURIComponent(relativeUrl)}`;
        }

        const urlNamespace = ops?.namespacePrefix ? `--${  ops.namespacePrefix.replace(/_/i, '-')}` : '';
        let url = con.instanceUrl.replace(/(http(s|):\/\/)([^.]+)(.*)/i, `$1$3${urlNamespace}$4/${relativeUrl}`);

        if (relativeUrl.startsWith('lightning/') && url.includes('.my.')) {
            // replace my.salesforce.com with lightning.force.com for setup pages
            url = url.replace(/\.my\.salesforce\.com/i, '.lightning.force.com');
        }
        return url;
    }

    @cache(-1)
    public async getInstalledPackageNamespace(packageName: string | RegExp) : Promise<string> {
        const installedPackage = await this.getInstalledPackageDetails(packageName);
        if (!installedPackage) {
            throw new Error(`Package with name ${packageName} is not installed on your Salesforce organization`);
        }
        return installedPackage.namespacePrefix;
    }

    @cache(-1)
    public async getInstalledPackageDetails(packageName: string | RegExp) : Promise<InstalledPackageRecord | undefined> {
        const results = await this.getInstalledPackages();
        return results.find(packageInfo => typeof packageName === 'string' ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
    }

    @cache(-1)
    public async getInstalledPackages() : Promise<InstalledPackageRecord[]> {
        const con = await this.getJsForceConnection();
        return con.metadata.list( { type: 'InstalledPackage' }) as Promise<InstalledPackageRecord[]>;
    }

    @cache(-1)
    public async getOrganizationDetails() : Promise<OrganizationDetails> {
        const results = await this.query<OrganizationDetails>('SELECT Id, Name, PrimaryContact, IsSandbox, InstanceName, OrganizationType, NamespacePrefix FROM Organization');
        return results[0];
    }

    /**
     * Returns a list of records. All records are mapped to record proxy object 
     * @param query SOQL Query to execute
     */
    public async query<T extends Partial<SObjectRecord>>(query: string, useCache?: boolean) : Promise<T[]> {
        return this.queryService.query(
            this.namespaceService.updateNamespace(query), useCache
        );
    }

    /**
     * Query multiple records based on the where condition. The filter condition can either be a string or a complex filter object.
     * @param type SObject type
     * @param filter Object filter or Where conditional string 
     * @param lookupFields fields to lookup on the record
     * @param limit limit the number of results
     * @param useCache use the query cache
     */
    public async lookup<T extends object, K extends PropertyAccessor = keyof T>(type: string, filter?: T | string | Array<T | string>, lookupFields?: K[] | 'all', limit?: number, useCache?: boolean): Promise<QueryResult<T, K>[]>  {
        return this.lookupService.lookup(
            this.namespaceService.updateNamespace(type), filter, lookupFields, limit, useCache
        );
    }

    /**
     * Insert one or more records into Salesforce; by default uses the standard collections api but switches to bulk API when there
     * are more then 50 records to be inserted.
     * @remarks For more control ove the operation users can also directly create a record batch offering more control.
     * @param type Record types to insert
     * @param records record data and references
     * @param cancelToken optional cancellation token
     */
    public async* insert(type: string, records: Array<{ values: any; ref: string }>, cancelToken?: vscode.CancellationToken) {
        const batch = new RecordBatch(this.schema);
        for (const record of records) {
            batch.addInsert(type, record.values, record.ref);
        }
        yield* batch.execute(await this.getJsForceConnection(), undefined, cancelToken);
    }

    /**
     * Update one or more records in Salesforce using the ID field as foreign key; by default uses the standard collections api but switches to bulk API when there.
     * @remarks For more control ove the operation users can also directly create a record batch offering more control.
     * @param type Record types to updated; all data should have an ID field
     * @param records record data and references
     * @param cancelToken optional cancellation token
     */
    public async* update(type: string, records: Array<{ id: string; [key: string]: any }>, cancelToken?: vscode.CancellationToken) {
        const batch = new RecordBatch(this.schema, { useBulkApi: false, chunkSize: 100 });
        for (const record of records) {
            batch.addUpdate(type, record, record.id, record.id);
        }
        yield* batch.execute(await this.getJsForceConnection(), undefined, cancelToken);
    }

    private async soapToolingRequest(methodName: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<{ body?: any; debugLog?: any }> {
        const connection = await this.getJsForceConnection();
        const soapRequest = new SoapRequest(methodName, 'http://soap.sforce.com/2006/08/apex', debuggingHeader);
        const endpoint = `${connection.instanceUrl}/services/Soap/s/${connection.version}`;
        const result = await axios({
            method: 'POST',
            url: endpoint,
            headers: {
                'SOAPAction': '""',
                'Content-Type':  'text/xml;charset=UTF-8'
            },
            transformResponse: (data: any) => {
                return xml2js.parseStringPromise(data, {
                    tagNameProcessors: [ stripPrefix ],
                    attrNameProcessors: [ stripPrefix ],
                    valueProcessors: [
                        value => {
                            if (/^[0-9]+(\.[0-9]+){0,1}$/i.test(value)) {
                                return parseFloat(value);
                            } else if (/^true|false$/i.test(value)) {
                                return value.localeCompare('true', undefined, { sensitivity: 'base' }) === 0;
                            }
                            return value;
                        }
                    ],
                    explicitArray: false
                });
            },
            data: soapRequest.toXml(request, connection.accessToken)
        });
        const response = (await result.data) as SoapResponse;

        if (response.Envelope.Body?.Fault) {
            throw new Error(`SOAP API Fault: ${response.Envelope.Body.Fault?.faultstring}`);
        }

        return {
            body: response.Envelope.Body,
            debugLog: response.Envelope?.Header?.DebuggingInfo.debugLog,
        };
    }

    /**
     * Executes the specified APEX using the SOAP API and returns the result.
     * @param apex APEX code to execute
     * @param logLevels Optional debug log levels to use
     */
    public async executeAnonymous(apex: string, logLevels: SoapDebuggingHeader = {}) : Promise<jsforce.ExecuteAnonymousResult & { debugLog?: string }> {
        // Add any missing debug headers at default level of None                
        const validDebugCategories = [
            'Db', 'Workflow', 'Validation', 'Callout', 'Apex_code',
            'Apex_profiling', 'Visualforce', 'System', 'NBA', 'Wave'
        ];
        for (const category of validDebugCategories) {
            if(!logLevels[category]) {
                logLevels[category] = 'None';
            }
        }

        const response = await this.soapToolingRequest('executeAnonymous', {
            String: apex
        }, logLevels);
        return {
            ...response.body.executeAnonymousResponse.result,
            debugLog: response.debugLog
        };
    }

    public async getMetadataSetupUrl(file: string) : Promise<string> {
        const metadataInfo = await this.getMetadataInfo(file);
        if (metadataInfo?.fullName.includes('__mdt')) {
            metadataInfo.type = metadataInfo.type.replace('Custom', 'CustomMetadata');
        }
        const metadataUrlFormat = metadataInfo && this.metadataRegistry.getUrlFormat(metadataInfo.type);

        if (!metadataInfo || !metadataUrlFormat) {
            throw new Error(`Unable to resolve metadata type (is this a valid Salesforce metadata?) for: ${file}`);
        }

        const objectData = {
            nameField: metadataUrlFormat.nameField,
            namespace: metadataInfo.namespace ?? '',
            type: metadataInfo.type,
            fullName: metadataInfo.fullName,
            name: metadataInfo.name,
            metadata: metadataInfo.metadata
        };

        if (metadataUrlFormat.query) {
            const connection = await this.getJsForceConnection();
            const queryFormat = evalTemplate(metadataUrlFormat.query, objectData);
            const queryService = metadataUrlFormat.strategy == 'tooling' ? connection.tooling : connection;
            const { records } = await queryService.query<any>(queryFormat);

            if (!records.length) {
                throw new Error(`Unable to find the metadata record ${metadataInfo.fullName} in the current Salesforce org`);
            }

            if (records.length == 1) {
                Object.assign(objectData, { id: records[0].Id });
            } else {
                const nameFieldPath = metadataUrlFormat.nameField.split('.');
                const filteredRecord = records.find(r => nameFieldPath.reduce((obj, p) => obj && obj[p], r) == metadataInfo.fullName);
                Object.assign(objectData, { id: (filteredRecord ?? records[0]).Id });
            }

            Object.assign(objectData, { id: records[0]?.Id });
        }

        return evalTemplate(metadataUrlFormat.url, objectData);
    }

    /** 
     * Get metadata info about any file; returns metadata type and name or undefined if the specified type is not a Metadata source.
     * @param filePath Source file path
     * @returns 
     */
    public async getMetadataInfo(filePath: string | vscode.Uri) : Promise<MetadataInfo | undefined>;
    public async getMetadataInfo(filePaths: Array<string | vscode.Uri>) : Promise<(MetadataInfo | undefined)[]>;
    public async getMetadataInfo(input: string | vscode.Uri | Array<string | vscode.Uri>): Promise<MetadataInfo | undefined | (MetadataInfo | undefined)[]> {
        const filePaths = (Array.isArray(input) ? input : [ input ]);
        const files = filePaths.map(filePath => typeof filePath === 'string' ? filePath : filePath.fsPath);
        const sfPackage = (await new SalesforcePackageBuilder(SalesforcePackageType.retrieve).addFiles(files)).getPackage();
        const infos = await mapAsyncParallel(files, async file => {
            const info = sfPackage.getSourceFileInfo(file);
            if (info) {
                const metadataInfoFile = [...sfPackage.sourceFiles()].find(f => f.fsPath?.endsWith('.xml'))?.fsPath ?? file;
                const metadata = metadataInfoFile ? XML.parse(await this.fs.readFileAsString(metadataInfoFile), { ignoreAttributes: true }) : undefined;
                return {
                    ...this.getNameInfo(info),
                    type: info.componentType,
                    fullName: info.name,
                    metadata: metadata && Object.values(metadata).pop()
                };
            }
        });
        return Array.isArray(input) ? infos : infos.pop();
    }

    private getNameInfo(metadataInfo: { componentType: string; name: string }) : { name: string; namespace?: string } {
        let name = metadataInfo.name;
        if (metadataInfo.componentType == 'Layout') {
            name = substringAfter(metadataInfo.name, '-');
        }

        const nameParts = name.split('__');
        if (nameParts.length > 2) {
            return {
                namespace: nameParts.shift()!,
                name: nameParts.join('__')
            };
        }

        return { name };
    }

    /**
     * Load all known Salesforce profiles in the current workspace with the *.profile-meta.xml and the *.profile extension from the file system
     */
    public async loadProfilesFromDisk() {
        const profilesFiles = await this.fs.findFiles([ '**/*.profile-meta.xml', '**/*.profile' ]);
        const profiles: { file: string; profile: SalesforceProfile }[] = [];
        for (const file of profilesFiles) {
            const name = decodeURIComponent(fileName(file).split('.').shift()!);
            const data = this.fs.readFileAsString(file, 'utf-8');
            try {
                profiles.push({ file, profile: await new SalesforceProfile(name).loadProfile(await data) });
            } catch(err) {
                this.logger.error(`Unable load profile ${name} due a parsing of file system error`, err);
            }
        }
        return profiles;
    }

    /**
     * Compiles the specified class bodies on the server
     * @param apexClassBody APEX classes to compile
     */
    public async compileClasses(apexClassBody: string[]) : Promise<any> {
        const response = await this.soapToolingRequest('compileClasses', {
            scripts: apexClassBody
        });
        return {
            ...response.body.compileClassesResponse
        };
    }

    /**
     * Get the version of the current Salesforce connection
     */
    public async getApiVersion() {
        const connection = await this.getJsForceConnection();
        return connection.version;
    }

    /**
     * Get a list of available API version on the connected server
     */
    public async getApiVersions(count: number = 10) {
        const connection = await this.getJsForceConnection();
        const version = parseFloat(connection.version);
        const versions: string[] = [];
        for (let i = 0; i < count; i++) {
            versions.push((version - i).toFixed(1));
        }
        return versions;
    }

    /**
     * Retrieves developer logs from the server
     * @param from Since date
     * @param currentUserOnly true if to only query the logs fro the current user otherwise retiree all logs 
     */
    public async getDeveloperLogs(from?: Date, currentUserOnly: boolean = false): Promise<DeveloperLog[]> {
        const selectFields = ['Id', 'Application', 'DurationMilliseconds', 'Location', 'LogLength', 'LogUser.Name', 'Operation', 'Request', 'StartTime', 'Status' ];
        const filters = new Array<string>();
        if (from) {
            filters.push(`SystemModstamp >= ${from.toISOString()}`);
        }
        if (currentUserOnly) {
            const currentUser = await this.getConnectedUserInfo();
            filters.push(`LogUserId = '${currentUser.id}'`);
        }
        const toolingQuery = `Select ${selectFields.join(',')} From ApexLog ${filters.length ? `where ${filters.join(' and ')}` : ''}`;
        const entries = await this.query<DeveloperLogRecord>(toolingQuery);
        return entries.map(entry => new DeveloperLog(entry, this));
    }

    /**
     * Deletes all Developers for All users from the server and returns te number of delete log entries as number.
     */
    public async clearDeveloperLogs(token?: vscode.CancellationToken) {
        const [ { logCount } ] = (await this.query<{ logCount: number }>('Select count(Id) logCount From ApexLog'));
        if (logCount == 0) {
            return 0;
        }
        const connection = await this.getJsForceConnection();
        let logsDeleted = 0;
        while (token?.isCancellationRequested != true) {
            // Query and delete logs in chunks to avoid overloading the server
            const ids = (await this.query<DeveloperLogRecord>('Select Id From ApexLog limit 100')).map(record => record.id);
            if (ids.length == 0) {
                break;
            }
            this.logger.info(`Deleting ${logsDeleted + ids.length}/${logCount} debug logs from the server...`);
            await connection.tooling.delete('ApexLog', ids);
            logsDeleted += ids.length;
        }
        return logsDeleted;
    }

    /**
     * Gets a list of the currently configured logging levels in Salesforce
     */
    public async getDebugLevels(): Promise<Array<SalesforceDebugLevel>> {
        const selectFields = ['Id', 'DeveloperName', 'ApexCode', 'ApexProfiling', 'Callout', 'Database', 'System', 'Validation', 'Visualforce', 'Workflow' ];
        const toolingQuery = `Select ${selectFields.join(',')} From DebugLevel`;
        const entries = await this.query<SalesforceDebugLevel>(toolingQuery);
        return entries;
    }

    public async createDebugLevel(name: string, debugLevel: SalesforceDebugLevel) {
        // Create base trace flag object
        const debugLevelObject = {
            DeveloperName: name,
            MasterLabel: name
        } as any;

        // Set log levels per category based on the specified log levels
        const normalizedDebugLevels = new Map(Object.keys(debugLevel).map(key => ([key.toLowerCase(), debugLevel[key]])));
        const traceFlagFields = [ 'ApexCode', 'ApexProfiling', 'Callout', 'Database', 'System', 'Validation', 'Visualforce', 'Workflow' ];
        for (const field of traceFlagFields) {
            debugLevelObject[field] = normalizedDebugLevels.get(field.toLocaleLowerCase());
        }
        debugLevel.developerName = name;

        // get existing levels object and update that
        const connection = await this.getJsForceConnection();
        const existing = await connection.tooling.query<{ Id: string}>(`Select Id From DebugLevel where DeveloperName = '${name}' limit 1`);
        if (existing.totalSize > 0) {
            debugLevelObject.Id = existing.records[0].Id;
            debugLevel.id = debugLevelObject.Id;
        }

        // Save log levels
        if (!debugLevelObject.Id) {
            const result = await connection.tooling.create('DebugLevel', debugLevelObject) as jsforce.SuccessResult;
            debugLevel.id = result.id;
        } else {
            await connection.tooling.update('DebugLevel', debugLevelObject);
        }

        return debugLevel;
    }

    /**
     * Set the trace flags based on the specified details.
     * @param debugLevel Logging level to set
     * @param type Type of logging to set
     * @param trackedEntityId Optionally the tracked entity; required for class and use debugging
     * @param durationInSeconds Duration of the logging sessions; default is 1 hour or 3600 seconds
     * @returns Trace flag instance which can be used to extend or clear
     */
    public async setTraceFlags(debugLevel: SalesforceDebugLevel, type: 'DEVELOPER_LOG' | 'USER_DEBUG', trackedEntityId?: undefined, durationInSeconds?: number)
    public async setTraceFlags(debugLevel: SalesforceDebugLevel, type: 'USER_DEBUG' | 'CLASS_TRACING', trackedEntityId: string, durationInSeconds?: number)
    public async setTraceFlags(debugLevel: SalesforceDebugLevel, type: 'USER_DEBUG' | 'DEVELOPER_LOG' | 'CLASS_TRACING', trackedEntityId?: string, durationInSeconds: number = 3600) {
        // Create base trace flag object
        const traceFlag = {
            DebugLevelId: debugLevel.id,
            LogType: type,
            TracedEntityId: trackedEntityId,
            StartDate: new Date(),
            ExpirationDate: new Date(Date.now() + durationInSeconds * 1000),
        } as any;

        // Default to current user id when no id is set
        if (type === 'USER_DEBUG' && !trackedEntityId) {
            traceFlag.TracedEntityId = (await this.getConnectedUserInfo()).id;
        }

        // Save log levels
        const connection = await this.getJsForceConnection();
        const result = await connection.tooling.create('TraceFlag', traceFlag) as jsforce.SuccessResult;
        return result.id;
    }

    /**
     * Extends/refresh the trace flag with the specified ID
     * @param traceFlagsId Id of the trace flags to extend
     * @param durationInSeconds Number of seconds starting now by which to extend the trace flag
     */
    public async extendTraceFlags(traceFlagsId: string, durationInSeconds: number = 3600) {
        // Create base trace flag object
        const traceFlag = {
            Id: traceFlagsId,
            StartDate: new Date(),
            ExpirationDate: new Date(Date.now() + durationInSeconds * 1000),
        } as any;
        const connection = await this.getJsForceConnection();
        await connection.tooling.update('TraceFlag', traceFlag);
    }

    /**
     * Clears the specified trace flags from the server
     * @param traceFlagsId Id of the trace flags to clear
     */
    public async clearTraceFlags(traceFlagsId: string) {
        const connection = await this.getJsForceConnection();
        try {
            await connection.tooling.delete('TraceFlag', [ traceFlagsId ]);
        } catch(e) {
            this.logger.error(`TraceFlag with id ${traceFlagsId} could not be cleared.`);
        }
    }

    /**
     * Removes all active and expired trace flags for the current Salesforce instance.
     */
    public async clearAllTraceFlags() {
        return this.deleteToolingRecords('Select Id From TraceFlag');
    }

    /**
     * Clear all trace flags for the currently connected user; deletes TraceFlag where TracedEntityId is set to the id of the current user
     */
    public async clearUserTraceFlags() {
        const userId = (await this.getConnectedUserInfo()).id;
        return this.deleteToolingRecords(`Select Id From TraceFlag where TracedEntityId = '${userId}'`);
    }

    public clearApexTestResults() {
        return this.deleteToolingRecords('Select Id From ApexTestResult');
    }

    private async deleteToolingRecords(query: string) {
        const objectType = query.match(/from (?<objectType>[a-z_0-9]+)/i)?.groups?.objectType;
        if (!objectType) {
            throw new Error(`No object type found in query: ${query}`);
        }
        const connection = await this.getJsForceConnection();
        let result = (await connection.tooling.query<{Id: string}>(query));
        do{
            const ids = result.records.map(rec => rec.Id);
            if (ids.length > 0) {
                await connection.tooling.delete(`${objectType}`, ids);
            }
            if (!result.nextRecordsUrl) {
                break;
            }
            result = await connection.tooling.queryMore(result.nextRecordsUrl);
        } while(result.nextRecordsUrl);
    }

    /**
     * Gets basic details about the user for the current connection
     */
    @cache()
    public async getConnectedUserInfo() {
        const connection = await this.getJsForceConnection();
        const identity = await connection.identity();
        // Only return a subset of user details/ do not expose the rest as they might be more sensitive details there
        return {
            id: identity.user_id,
            username: identity.username,
            type: identity.user_type,
        };
    }

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX regsitery
     */
    public getMetadataTypes() : MetadataType[] {
        return this.metadataRegistry.getMetadataTypes();
    }

    /**
     * When the metadata type is a known metadata type return the type.
     */
    public getMetadataType(type: string) {
        return this.metadataRegistry.getMetadataType(type);
    }

    /**
     * 
     * @param page Name of the APEX page which exposes the requested class/controller
     * @param action Name of the class including namespace when a namespace is required
     * @param method Name of the method to call on the controller
     * @param data Data to pass to the controller
     */
    public async requestApexRemote(page: string, action: string, method: string, data: any) {
        const connection = await this.getJsForceConnection();
        const pageNamespace = this.namespaceService.updateNamespace(page).match(/(^[a-z_]+)__(?!c$)/i)?.[1];
        const body = {
            'action': this.namespaceService.updateNamespace(action),
            'method': this.namespaceService.updateNamespace(method),
            'data': data,
            'type': 'rpc',
            'tid': 1,
            'ctx': {
                'csrf': '1',
                'vid': '1',
                'ns': pageNamespace ?? '',
                'ver': parseInt(connection.version, 10)
            }
        };
        const request = {
            'method': 'POST',
            'url': `${connection.instanceUrl}/apexremote`,
            'body': JSON.stringify(body),
            'headers': {
                'content-type': 'application/json',
                'Referer': `${connection.instanceUrl}/apex/${this.namespaceService.updateNamespace(page)}`
            }
        };

        const timer = new Timer();
        try {
            const result = (await connection.request(request))?.[0];

            if (!result) {
                throw new Error('No response from Salesforce');
            }

            if (result?.statusCode != 200) {
                if (result.message) {
                    throw new Error(result.message);
                }
                throw new Error(`Received unexpected ${result?.statusCode} status code back from Salesforce`);
            }

            return result;
        } finally {
            this.logger.verbose(`APEX remote request ${page}->${method} [${timer.stop()}]`);
        }
    }
}
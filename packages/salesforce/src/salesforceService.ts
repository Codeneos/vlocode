import * as jsforce from 'jsforce';
import { FileSystem, injectable, Logger } from '@vlocode/core';
import { cache, evalTemplate, mapAsyncParallel, XML, substringAfter, fileName, Timer, FileSystemUri, CancellationToken, asArray, groupBy, isSalesforceId } from '@vlocode/util';

import { HttpMethod, HttpRequestInfo, SalesforceConnectionProvider } from './connection';
import { SalesforcePackageBuilder, SalesforcePackageType } from './deploymentPackageBuilder';
import { QueryService, QueryResult } from './queryService';
import { RecordBatch } from './recordBatch';
import { SalesforceDeployService } from './salesforceDeployService';
import { SalesforceLookupService } from './salesforceLookupService';
import { SalesforceProfile } from './salesforceProfile';
import { SalesforceSchemaService } from './salesforceSchemaService';
import { SObjectRecord, PropertyAccessor } from './types';
import { MetadataRegistry, MetadataType } from './metadataRegistry';
import { NamespaceService } from './namespaceService';
import { SoapClient, SoapDebuggingHeader } from './soapClient';
import { DeveloperLogs } from './developerLogs';
import { QueryBuilder } from './queryBuilder';
import { isArrayBuffer } from 'util/types';
import { SalesforceBatchService } from './salesforceBatchService';

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

interface MetadataInfo { type: string; fullName: string; metadata: any; name: string; namespace?: string }

@injectable()
export class SalesforceService implements SalesforceConnectionProvider {

    @injectable.property public readonly metadataRegistry: MetadataRegistry;
    @injectable.property public readonly schema: SalesforceSchemaService;
    @injectable.property public readonly lookupService: SalesforceLookupService;
    @injectable.property public readonly deploy: SalesforceDeployService;
    @injectable.property public readonly logs: DeveloperLogs;
    @injectable.property public readonly batch: SalesforceBatchService;

    constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly namespaceService: NamespaceService,
        private readonly queryService: QueryService,
        private readonly logger: Logger,
        private readonly fs: FileSystem) {
    }

    public async isProductionOrg() : Promise<boolean> {
        return !(await this.getOrganizationDetails()).isSandbox;
    }

    public getJsForceConnection() {
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

    @cache()
    public async getInstalledPackageNamespace(packageName: string | RegExp) : Promise<string> {
        const installedPackage = await this.getInstalledPackageDetails(packageName);
        if (!installedPackage) {
            throw new Error(`Package with name ${packageName} is not installed on your Salesforce organization`);
        }
        return installedPackage.namespacePrefix;
    }

    @cache()
    public async getInstalledPackageDetails(packageName: string | RegExp) : Promise<InstalledPackageRecord | undefined> {
        const results = await this.getInstalledPackages();
        return results.find(packageInfo => typeof packageName === 'string' ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
    }

    @cache()
    public async getInstalledPackages() : Promise<InstalledPackageRecord[]> {
        const con = await this.getJsForceConnection();
        const metadata = await con.metadata.list( { type: 'InstalledPackage' }) as InstalledPackageRecord[];
        return metadata ? (Array.isArray(metadata) ? metadata : [ metadata ]) : [];
    }

    @cache()
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
    public async* insert(type: string, records: Array<{ values: any; ref: string }>, cancelToken?: CancellationToken) {
        const batch = new RecordBatch(this.schema);
        for (const record of records) {
            batch.addInsert(this.namespaceService.updateNamespace(type), record.values, record.ref);
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
    public async* update(type: string, records: Array<{ id: string; [key: string]: any }>, cancelToken?: CancellationToken) {
        const batch = new RecordBatch(this.schema, { useBulkApi: false, chunkSize: 100 });
        for (const record of records) {
            batch.addUpdate(this.namespaceService.updateNamespace(type), record, record.id, record.id);
        }
        yield* batch.execute(await this.getJsForceConnection(), undefined, cancelToken);
    }
    
    /**
     * Delete one or more records based on a SOQL filter condition. Returns array of deleted record-ids
     * @param type SObject type to delete
     * @param filter Object filter or where-conditional selecting the records to delete 
     * @param chunkSize Number of records to delete in a single call
     */
    public async deleteWhere(type: string, filter?: object | string | Array<object | string>, chunkSize = 200) : Promise<{ id: string, success: boolean, error?: string }[]> {
        const records = await this.lookup(type, filter, ['Id'], undefined, false);
        return this.delete(records.map(rec => rec.Id), chunkSize);
    }

    /**
     * Delete one or more records by ID
     * @param ids list of IDs
     * @param chunkSize 
     * @returns 
     */
    public async delete(ids: Iterable<string | SObjectRecord>, chunkSize = 200) : Promise<{ id: string, success: boolean, error?: string }[]> {
        const connection = await this.getJsForceConnection();
        const deleteResults = new Array<{ id: string, success: boolean, error?: string }>();

        const groupedByType = Object.entries(await groupBy(ids, 
                async item => typeof item === 'string' ? (await this.schema.describeSObjectById(item)).name : item.attributes.type,
                item => typeof item === 'string' ? item : item.Id));

        while(groupedByType.length) {
            const [type, typedIds] = groupedByType.pop()!;

            while(typedIds.length) {
                const idChunk = typedIds.splice(0, chunkSize);
                this.logger.verbose(`Deleting ${idChunk.length} ${type} record(s)`);
                const result = await connection.del(type, idChunk, { allOrNone: false });

                for (const [index, deleteResult]of asArray(result).entries()) {
                    deleteResults.push({
                        id: idChunk[index],
                        success: deleteResult.success,
                        error: !deleteResult.success ? deleteResult.errors.map(f => `${f.message} (${f.fields.join(', ') || 'unknown'})`).join(', ') : undefined
                    });
                }
            }
        }

        return deleteResults;
    }

    private async soapToolingRequest(methodName: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<{ body?: any; debugLog?: any }> {
        const connection = await this.getJsForceConnection();
        const soapClient = new SoapClient(connection, `/services/Soap/s/${connection.version}`);
        return soapClient.request(methodName, request, debuggingHeader);
    }

    /**
     * Executes the specified APEX using the SOAP API and returns the result.
     * @param apex APEX code to execute
     * @param options.logLevels Optional debug log levels to use
     * @param options.updateNamespace Replace namespace placeholders with the actual namespace
     */
    public async executeAnonymous(apex: string, options?: { logLevels?: SoapDebuggingHeader, updateNamespace?: boolean }) : Promise<jsforce.ExecuteAnonymousResult & { debugLog?: string }> {
        // Add any missing debug headers at default level of None                
        const validDebugCategories = [
            'Db', 'Workflow', 'Validation', 'Callout', 'Apex_code',
            'Apex_profiling', 'Visualforce', 'System', 'NBA', 'Wave'
        ];

        const logLevels = options?.logLevels ?? {};
        for (const category of validDebugCategories) {
            if(!logLevels[category]) {
                logLevels[category] = 'None';
            }
        }

        const response = await this.soapToolingRequest('executeAnonymous', {
            String: options?.updateNamespace ? this.namespaceService.updateNamespace(apex) : apex
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
    public async getMetadataInfo(filePath: string | FileSystemUri) : Promise<MetadataInfo | undefined>;
    public async getMetadataInfo(filePaths: Array<string | FileSystemUri>) : Promise<(MetadataInfo | undefined)[]>;
    public async getMetadataInfo(input: string | FileSystemUri | Array<string | FileSystemUri>): Promise<MetadataInfo | undefined | (MetadataInfo | undefined)[]> {
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
     * Get all static resources matching the specified name, the body of the resource is retrieved when required. The body of the static resource is cached
     * @param resourceName Name of the static resource
     * @returns 
     */
    public async getStaticResource(resourceName: string) {
        const connection = await this.getJsForceConnection();
        const { records: staticResources } = await connection.tooling.query<any>(`SELECT Id, Body, Name, NamespacePrefix FROM StaticResource WHERE Name = '${resourceName}'`);
        
        if (staticResources.length == 0) {
            return [];
        }

        return staticResources.map(r => ({
            id: r.Id,
            namespace: r.NamespacePrefix,
            name: r.name,
            getBody: async function() {
                if (!this._body) {
                    this._body = await connection.request(r.Body);
                }
                return this._body as Buffer;
            }
        }));
    }

    /**
     * Get the content of the specified content version object based on the content version Id
     * @param versionId Content Version object Id
     */
     public async getContentVersionData(versionId: string) {
        if (!isSalesforceId(versionId)) {
            throw new Error(`Specified ID is not a Salesforce id: ${versionId}`);
        }
        const connection = await this.getJsForceConnection();
        const response = await connection.request<string>(`/services/data/v55.0/sobjects/ContentVersion/${versionId}/VersionData`);
        return response;
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
    public getApiVersion() {
        return this.connectionProvider.getApiVersion();
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
     * Gets basic details about the user for the current connection
     */
    @cache()
    public async getConnectedUserInfo() {
        const connection = await this.getJsForceConnection();
        const identity = await connection.identity();
        const { records: [ userObject ] } = await connection.query<any>(
            new QueryBuilder('User', [ 'ProfileId' ]).limit(1).where.equals('Id', identity.user_id).getQuery()
        );
        // Only return a subset of user details/do not expose the rest as they might be more sensitive details there
        return {
            id: identity.user_id,
            username: identity.username,
            type: identity.user_type,
            profileId: userObject.ProfileId
        };
    }
    

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX registry
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
    public async requestApexRemote(page: string, action: string, method: HttpMethod, data: any) {
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
        const request: HttpRequestInfo = {
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
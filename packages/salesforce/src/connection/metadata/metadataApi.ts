import { getObjectProperty, asArray, setObjectProperty, chunkAsyncParallel, unique, filterUndefined } from "@vlocode/util";
import { Stream } from 'stream';

import { SoapClient } from "../../soapClient";
import { SalesforceConnection } from "../salesforceConnection";
import { RestDeploymentApi } from "./restDeploymentApi";
import { Operations, Schemas } from "./metadataSchemas";
import { DeployOptions, DeployResult, DescribeMetadataResult, DescribeValueTypeResult, FileProperties, RetrieveResult, SalesforceMetadata, SaveResult, UpsertResult } from "./types";
import { ListMetadataQuery } from "./types/metadataQuery";
import { RetrieveRequest } from "./types/retrieveRequest";
import { MetadataTypes } from "./metadataTypes";
import { DeleteResult } from "../../types";
import { MetadataResponses } from "./metadataOperations";

export enum ValueTypeNamespace {
    metadata = 'http://soap.sforce.com/2006/04/metadata',
    tooling = 'urn:metadata.tooling.soap.sforce.com'
}

export interface DeploymentApi {
    deploy(data: Stream | Buffer | string, deployOptions: DeployOptions): Promise<DeployResult>;
    checkDeployStatus(id: string, includeDetails?: boolean): Promise<DeployResult>;
    cancelDeploy(id: string): Promise<DeployResult>;
}

/**
 * Metadata API implementation for Vlocode partially compatible with Metadata API class  from JSforce.
 *
 * Key differences between the JSforce implementation:
 *  - Does not support async Metadata API calls as these are deprecated by Salesforce since API version 31.0
 *  - Support strongly typed metadata APIs with IDE type completion
 *  - Support for both REST as well as SOAP Metadata API
 *  - Support deployment cancellation
 *  - Support rename of metadata
 *  - Support describe value type
 *  - Does not support old nodejs callback style; all calls return an awaitable promise
 */
export class MetadataApi implements DeploymentApi {

    private soap: SoapClient;
    private deployment: DeploymentApi;

    constructor(private connection: SalesforceConnection) {
        this.deployment = new RestDeploymentApi(this.connection);
        this.soap = new SoapClient(this.connection,
            `/services/Soap/m/{apiVersion}`,
            'http://soap.sforce.com/2006/04/metadata'
        );
    }

    private invoke<K extends keyof MetadataResponses>(method: K, message: object, responsePath?: string) : Promise<MetadataResponses[K]>;
    private async invoke<T>(method: string, message: object, responsePath?: string) : Promise<T> {
        const response = await this.soap.request(method, message, {
            requestSchema: Operations[method]?.request,
            responseSchema: Operations[method]?.response
        });
        return (responsePath ? getObjectProperty(response.body, responsePath) : response.body) as T;
    }

    private convertArray<T>(value: T | T[], asArray: true): T[];
    private convertArray<T>(value: T | T[], asArray: false): T;
    private convertArray<T>(value: T | T[], asArray: boolean): T[] | T;
    private convertArray<T>(value: T | T[], asArray: boolean): T[] | T {
        return asArray
            ? Array.isArray(value) ? value : [ value ]
            : Array.isArray(value) ? value[0] : value;
    }

    private normalizeMetadata(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]): SalesforceMetadata[] {
        return asArray(metadata).map(md => setObjectProperty(md, '$.xsi:type', type, { create: true }));
    }

    /**
     * Describes features of the metadata API.
     * @param version API version
     */
    public describe(version?: string): Promise<DescribeMetadataResult> {
        return this.invoke('describeMetadata', {
            asOfVersion: version
        }).then(r => r.result);
    }

    /**
     * Describe a complex value type
     * @param type name of the type to describe
     */
    public describeValueType(type: string): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace: ValueTypeNamespace ): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace: string): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace?: ValueTypeNamespace | string): Promise<DescribeValueTypeResult> {
        return this.invoke('describeValueType', {
            type: namespace ? `{${namespace}}${type}` : type
        }).then(r => r.result);
    }

    /**
     * Lists the available metadata components.
     * @param queries Queries used to filter
     * @param asOfVersion API version; optional
     * @returns
     */
    public list(queries: ListMetadataQuery<keyof MetadataTypes> | ListMetadataQuery<keyof MetadataTypes>[], asOfVersion?: string | number): Promise<FileProperties[]>;
    public list(queries: ListMetadataQuery | ListMetadataQuery[], asOfVersion?: string | number): Promise<FileProperties[]>
    public list(queries: ListMetadataQuery | ListMetadataQuery[], asOfVersion?: string | number): Promise<FileProperties[]> {
        return this.invoke('listMetadata', {
            queries, asOfVersion
        }).then(r => r.result ?? []);
    }

    /**
     * Renames a metadata entry synchronously.
     * @param type Metadata type
     * @param oldFullName Current full name
     * @param newFullName New full name
     * @returns
     */
    public rename(type: string, oldFullName: string, newFullName: string) {
        return this.invoke('renameMetadata', {
            type, oldFullName, newFullName
        }).then(r => r.result);
    }

    /**
     * Reads metadata entries synchronously.
     * @param type Metadata type name
     * @param fullNames list of metadata types
     */
    public read<K extends keyof MetadataTypes>(type: K, fullNames: string[]) : Promise<MetadataTypes[K][]>;
    public read<K extends keyof MetadataTypes>(type: K, fullNames: string) : Promise<MetadataTypes[K]>;

    public read<T extends SalesforceMetadata>(type: string, fullNames: string) : Promise<T>;
    public read<T extends SalesforceMetadata>(type: string, fullNames: string[]) : Promise<T[]>;
    public async read<T extends SalesforceMetadata>(type: string, fullNames: string | string[]) : Promise<T | T[]> {
        const records = await chunkAsyncParallel(asArray(fullNames), async chunk => {
            const readResponse = await this.invoke('readMetadata', {
                type, fullNames: chunk
            });
            if (!readResponse.result?.records) {
                throw new Error('readMetadata error; expected records to be set instead received undefined instead');
            }
            return readResponse.result?.records;
        }, 10, 2);
        // Normalize results to match schema
        const schema = Schemas[type];
        if (schema) {
            records.forEach(r => r && SoapClient.normalizeRequestResponse(schema, r));
        }
        // Convert to Array when input is an array otherwise return as single
        return this.convertArray(records as T[], Array.isArray(fullNames));
    }

    /**
     * Reads ALL metadata entries of a specific type synchronously and yields the results. 
     * @param type Metadata type name
     * @param fullNames list of metadata types
     */
    public async *readAll<K extends keyof MetadataTypes>(type: K) : AsyncGenerator<MetadataTypes[K], any, undefined> {
        const metadata = await this.list( { type } );
        const metadataNames = [...unique(metadata.map(md => md.fullName))];
        while(metadataNames.length > 0) {
            yield *filterUndefined(await this.read(type, metadataNames.splice(0, 10)));
        }
     }

    /**
     * Creates metadata entries synchronously.
     * @param type Metadata type name
     * @param metadata Metadata entry to create
     */
    public create<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K]) : Promise<SaveResult>;
    public create<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K][]) : Promise<SaveResult[]>;

    public create(type: string, metadata: SalesforceMetadata) : Promise<SaveResult>;
    public create(type: string, metadata: SalesforceMetadata[]) : Promise<SaveResult[]>;
    public create(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<SaveResult | SaveResult[]> {
        return this.invoke('createMetadata', {
            type, metadata: this.normalizeMetadata(type, metadata)
        }).then(r => this.convertArray(r.result ?? [], Array.isArray(metadata)))
    }

    /**
     * Updates metadata entries synchronously.
     * @param type Metadata type name
     * @param metadata Metadata entry to update
     */
    public update<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K]) : Promise<SaveResult>;
    public update<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K][]) : Promise<SaveResult[]>;

    public update(type: string, metadata: SalesforceMetadata) : Promise<SaveResult>;
    public update(type: string, metadata: SalesforceMetadata[]) : Promise<SaveResult[]>;
    public update(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<SaveResult | SaveResult[]> {
        return this.invoke('updateMetadata', {
            metadata: this.normalizeMetadata(type, metadata)
        }).then(r => this.convertArray(r.result ?? [], Array.isArray(metadata)))
    }

    /**
     * Updates or inserts metadata entries synchronously.
     * @param type Metadata type name
     * @param metadata Metadata entry to update insert
     */
    public upsert<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K]) : Promise<UpsertResult>;
    public upsert<K extends keyof MetadataTypes>(type: K, metadata: MetadataTypes[K][]) : Promise<UpsertResult[]>;

    public upsert(type: string, metadata: SalesforceMetadata) : Promise<UpsertResult>;
    public upsert(type: string, metadata: SalesforceMetadata[]) : Promise<UpsertResult[]>;
    public upsert(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<UpsertResult | UpsertResult[]> {
        return this.invoke('upsertMetadata', {
            metadata: this.normalizeMetadata(type, metadata)
        }).then(r => this.convertArray(r.result ?? [], Array.isArray(metadata)))
    }

    /**
     * Delete metadata entries synchronously.
     * @param type Metadata type name
     * @param fullNames Dull name of the metadata to delete
     */
    public delete(type: keyof MetadataTypes, fullNames: string) : Promise<DeleteResult>;
    public delete(type: keyof MetadataTypes, fullNames: string) : Promise<DeleteResult[]>;

    public delete(type: string, fullNames: string) : Promise<DeleteResult>;
    public delete(type: string, fullNames: string[]) : Promise<DeleteResult[]>;
    public delete(type: string, fullNames: string | string[]) : Promise<DeleteResult | DeleteResult[]>{
        return this.invoke('deleteMetadata', {
            type, fullNames
        }).then(r => this.convertArray(r.result ?? [], Array.isArray(fullNames)))
    }

    public retrieve(retrieveRequest: RetrieveRequest): Promise<string> {
        return this.invoke('retrieve', { retrieveRequest }).then(r => r.result.id);
    }

    public checkRetrieveStatus(id: string, includeZip?: boolean): Promise<RetrieveResult> {
        return this.invoke('checkRetrieveStatus', {
            asyncProcessId: id,
            includeZip: includeZip === true
        }).then(r => r.result)
    }

    public deploy(data: Stream | Buffer | string, deployOptions: DeployOptions): Promise<DeployResult> {
        return this.deployment.deploy(data, deployOptions);
    }

    public checkDeployStatus(id: string, includeDetails?: boolean): Promise<DeployResult> {
        return this.deployment.checkDeployStatus(id, includeDetails);
    }

    public cancelDeploy(id: string): Promise<DeployResult>{
        return this.deployment.cancelDeploy(id);
    }
}
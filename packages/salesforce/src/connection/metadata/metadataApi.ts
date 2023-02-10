import { beforeHook, decorate, getObjectProperty, streamToBuffer } from "@vlocode/util";
import { Metadata } from "jsforce";
import { Stream } from 'stream';

import { RestClient } from "../../restClient";
import { SoapClient } from "../../soapClient";
import { SalesforceConnection } from "../salesforceConnection";
import { DeployOptions, DeployResult, DescribeMetadataResult, DescribeValueTypeResult, FileProperties, RetrieveResult, SalesforceMetadata, SaveResult, UpsertResult } from "./types";
import { ListMetadataQuery } from "./types/metadataQuery";
import { RetrieveRequest } from "./types/retrieveRequest";

interface DeployRequest {
    id: string;
    validatedDeployRequestId: string | null;
    deployOptions: DeployOptions,
    deployResult: DeployResult
}

export enum ValueTypeNamespace {
    metadata = 'http://soap.sforce.com/2006/04/metadata',
    tooling = 'urn:metadata.tooling.soap.sforce.com'
}

/**
 * Metadata API implementation for Vlocode partially compatible with Metadata API class  from JSforce.
 * 
 * Key differences between the JSforce implementation:
 *  - Does not support async Metadata API calls as these are deprecated by Salesforce since API version 31.0
 *  - Support for both REST as well as SOAP Metadata API
 *  - Support deployment cancellation 
 *  - Support rename of metadata
 *  - Support describe value type
 *  - Does not support old nodejs callback style; all calls return an awaitable promise
 * 
 */
export class MetadataApi {

    private soap: SoapClient;
    private rest: RestClient;

    private get apiVersion(): string {
        return this.connection.version;
    }

    constructor(private connection: SalesforceConnection) {
        this.rest = new RestClient(this.connection,             
            `/services/data/v${this.apiVersion}/metadata`)
        this.soap = new SoapClient(this.connection, 
            `/services/Soap/m/${this.connection.version}`, 
            'http://soap.sforce.com/2006/04/metadata'
        );
    }

    private async invoke<T>(method: string, message: object, propertyPath?: string) : Promise<T> {
        const response = await this.soap.request(method, message);
        return (propertyPath ? getObjectProperty(response.body, propertyPath) : response) as T;
    }

    public describe(version?: string): Promise<DescribeMetadataResult> {
        return this.invoke('describeMetadata', {
            asOfVersion: version
        }, 'result');
    }

    public describeValueType(type: string): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace: ValueTypeNamespace ): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace: string): Promise<DescribeValueTypeResult>;
    public describeValueType(type: string, namespace?: ValueTypeNamespace | string): Promise<DescribeValueTypeResult> {
        return this.invoke('describeMetadata', {
            type: namespace ? `{${namespace}}${type}` : type
        }, 'result');
    }

    public list(queries: ListMetadataQuery | ListMetadataQuery[], asOfVersion?: string | number): Promise<FileProperties[]> {
        return this.invoke<FileProperties[]>('listMetadata', {
            queries, asOfVersion
        }, 'result');
    }

    public rename(type: string, oldFullName: string, newFullName: string) {
        return this.invoke<SaveResult>('renameMetadata', {
            type, oldFullName, newFullName
        });
    }

    public read<T extends SalesforceMetadata>(type: string, fullNames: string) : Promise<T>;
    public read<T extends SalesforceMetadata>(type: string, fullNames: string[]) : Promise<T[]>;
    public read<T extends SalesforceMetadata>(type: string, fullNames: string | string[]) : Promise<T | T[]> {
        return this.invoke('readMetadata', {
            type, fullNames
        }, 'records');
    }

    public create(type: string, metadata: SalesforceMetadata) : Promise<SaveResult>;
    public create(type: string, metadata: SalesforceMetadata[]) : Promise<SaveResult[]>;
    public create(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<SaveResult | SaveResult[]> {
        return this.invoke('createMetadata', { type, metadata }, 'result');
    }

    public update(type: string, metadata: SalesforceMetadata) : Promise<SaveResult>;
    public update(type: string, metadata: SalesforceMetadata[]) : Promise<SaveResult[]>;
    public update(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<SaveResult | SaveResult[]> {
        return this.invoke('updateMetadata', { type, metadata }, 'result');
    }
    
    public upsert(type: string, metadata: SalesforceMetadata) : Promise<UpsertResult>;
    public upsert(type: string, metadata: SalesforceMetadata[]) : Promise<UpsertResult[]>;
    public upsert(type: string, metadata: SalesforceMetadata | SalesforceMetadata[]) : Promise<UpsertResult | UpsertResult[]> {        
        return this.invoke('updateMetadata', { type, metadata }, 'result');
    }

    public delete(type: string, fullNames: string) : Promise<SaveResult>;
    public delete(type: string, fullNames: string[]) : Promise<SaveResult[]>;
    public delete(type: string, fullNames: string | string[]) : Promise<SaveResult | SaveResult[]>{
        return this.invoke<SaveResult[] | SaveResult>('delete', { type, fullNames }, 'result');
    }

    //@ts-ignore
    public async deploy(data: Stream | Buffer | string, deployOptions: DeployOptions) {
        return (await this.deployRest(data, deployOptions)).deployResult;
    }

    public async deployRest(data: Stream | Buffer | string, deployOptions: DeployOptions): Promise<DeployRequest> {
        const contentBody = Buffer.isBuffer(data) 
            ? data
            : typeof data !== 'string' 
            ? (await streamToBuffer(data))
            : data;
        
        const bodyParts = [ {
            headers: {
                'Content-Disposition': `form-data; name="json"`,
                'Content-Type': `application/json`
            },
            body: JSON.stringify({ deployOptions })
        }, {
            headers: {
                'Content-Disposition': `form-data; name="file"; filename="Deploy.zip"`,
                'Content-Type': `application/zip`,              
            },
            body: contentBody
        } ];

        return this.rest.post('deployRequest', bodyParts);
    }

    public checkDeployStatus(id: string, includeDetails?: boolean): Promise<DeployResult> {
        return this.invoke('checkDeployStatus', {
            asyncProcessId: id,
            includeDetails: includeDetails === true
        }, 'result');
    }

    public async checkDeployStatusRest(id: string, includeDetails?: boolean) {
        const result = await this.rest.get<DeployRequest>(`deployRequest/${id}?includeDetails=${!!includeDetails}`);
        return result.deployResult;
    }

    // @ts-ignore
    public async cancelDeploy(id: string) {
        const result = await this.rest.patch<DeployRequest>(
            `deployRequest/${id}`, 
            { deployResult: { status: 'Cancelling' } }); 
        return result.deployResult;
    }

    // Metadata.prototype.retrieve = function(request, callback) {
    //     var res = this._invoke("retrieve", { request: request });
    //     return new RetrieveResultLocator(this, res).thenCall(callback);
    //   };

    public retrieve(retrieveRequest: RetrieveRequest): Promise<string> {
        return this.invoke('retrieve', {
            retrieveRequest
        }, 'result.id');
    }

    public checkRetrieveStatus(id: string, includeZip?: boolean): Promise<RetrieveResult> {
        return this.invoke('checkDeployStatus', {
            asyncProcessId: id,
            includeZip: includeZip === true
        }, 'result');
    }

    protected [beforeHook](name: string | symbol, args: any[]): any {
        if (args.length && typeof args[args.length - 1] === 'function') {
            throw new Error('@vlocode/salesforce does not support the callback parameter for all metadata API related functions');
        }
    }

    // protected [afterHook](name: string | symbol, args: any[], returnValue: any | undefined): any {
    //     if (typeof returnValue === 'object' && typeof returnValue['_results']?.['then'] === 'function') {
    //         return new AsyncResultLocator(this, returnValue['_results'], returnValue['_isArray']);
    //     }
    //     return returnValue;
    // }
}
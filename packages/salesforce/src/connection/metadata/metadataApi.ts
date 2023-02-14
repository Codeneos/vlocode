import { beforeHook, getObjectProperty, streamToBuffer } from "@vlocode/util";
import { Stream } from 'stream';

import { RestClient } from "../../restClient";
import { SoapClient } from "../../soapClient";
import { SalesforceConnection } from "../salesforceConnection";
import { RestDeploymentApi } from "./restDeploymentApi";
import { DeployOptions, DeployResult, DescribeMetadataResult, DescribeValueTypeResult, FileProperties, RetrieveResult, SalesforceMetadata, SaveResult, UpsertResult } from "./types";
import { ListMetadataQuery } from "./types/metadataQuery";
import { RetrieveRequest } from "./types/retrieveRequest";

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
 *  - Support for both REST as well as SOAP Metadata API
 *  - Support deployment cancellation
 *  - Support rename of metadata
 *  - Support describe value type
 *  - Does not support old nodejs callback style; all calls return an awaitable promise
 */
export class MetadataApi implements DeploymentApi {

    
    private deploymentApiType = RestDeploymentApi;

    private soap: SoapClient;
    private deployment: DeploymentApi;

    constructor(private connection: SalesforceConnection) {
        this.deployment = new RestDeploymentApi(this.connection);
        this.soap = new SoapClient(this.connection,
            `/services/Soap/m/{apiVersion}`,
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




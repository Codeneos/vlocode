import { getObjectProperty, streamToBuffer } from "@vlocode/util";
import { Stream } from 'stream';
import { SoapClient } from '../../soapClient';
import { SalesforceConnection } from '../salesforceConnection';
import { DeploymentApi } from './metadataApi';
import { MetadataRequests, MetadataResponses } from './metadataOperations';
import { DeployOptions, DeployResult } from './types';

/**
 * SOAP based deployment API implementation that uses the File based SOAP APIs to create and update deployments.
 */
export class SoapDeploymentApi implements DeploymentApi {

    private soap: SoapClient;

    constructor(private connection: SalesforceConnection) {
        this.soap = new SoapClient(this.connection,
            `/services/Soap/m/{apiVersion}`,
            'http://soap.sforce.com/2006/04/metadata'
        );
    }

    public async deploy(data: Stream | Buffer | string, deployOptions: DeployOptions): Promise<DeployResult> {
        const contentBody = Buffer.isBuffer(data)
            ? data
            : typeof data !== 'string'
            ? (await streamToBuffer(data))
            : data;

        const response = await this.invoke('deploy', {
            zipFile: typeof contentBody === 'string' ? contentBody : contentBody.toString('base64'),
            deployOptions
        });
        return this.checkDeployStatus(response.result.id);
    }

    public checkDeployStatus(id: string, includeDetails?: boolean) {
        return this.invoke('checkDeployStatus', {
            asyncProcessId: id,
            includeDetails: includeDetails === true
        }).then(r => r.result);
    }

    public async cancelDeploy(id: string) {
        await this.invoke('cancelDeploy', { asyncProcessId: id });
        return this.checkDeployStatus(id);
    }

    public async deployRecentValidation(validationId: string) {
        const response = await this.invoke('deployRecentValidation', { validationId });
        return this.checkDeployStatus(response.result);
    }

    private invoke<K extends keyof MetadataResponses>(method: K, message: MetadataRequests[K], responsePath?: string) : Promise<MetadataResponses[K]>;
    private async invoke<T>(method: string, message: object, propertyPath?: string) : Promise<T> {
        const response = await this.soap.request(method, message);
        return (propertyPath ? getObjectProperty(response.body, propertyPath) : response) as T;
    }
}
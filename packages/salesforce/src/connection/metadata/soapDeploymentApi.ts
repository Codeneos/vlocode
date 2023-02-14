import { getObjectProperty, streamToBuffer } from "@vlocode/util";
import { Stream } from "stream";
import { SoapClient } from "../../soapClient";
import { SalesforceConnection } from "../salesforceConnection";
import { DeploymentApi } from "./metadataApi";
import { DeployOptions, DeployResult } from "./types";

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

        return this.invoke<DeployResult>('deploy', {
            zipFile: typeof contentBody === 'string' ? contentBody : contentBody.toString('base64'),
            deployOptions
        }, 'result');
    }

    public checkDeployStatus(id: string, includeDetails?: boolean) {
        return this.invoke<DeployResult>('checkDeployStatus', {
            asyncProcessId: id,
            includeDetails: includeDetails === true
        }, 'result');
    }

    public cancelDeploy(id: string) {
        return this.invoke<DeployResult>('cancelDeploy', { asyncProcessId: id }, 'result');
    }

    private async invoke<T>(method: string, message: object, propertyPath?: string) : Promise<T> {
        const response = await this.soap.request(method, message);
        return (propertyPath ? getObjectProperty(response.body, propertyPath) : response) as T;
    }
}
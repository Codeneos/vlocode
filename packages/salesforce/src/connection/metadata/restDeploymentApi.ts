import { streamToBuffer } from "@vlocode/util";
import { Stream } from 'stream';
import { RestClient } from '../../restClient';
import { SalesforceConnection } from '../salesforceConnection';
import { DeploymentApi } from './metadataApi';
import { DeployOptions, DeployResult } from './types';

interface DeployRequest {
    id: string;
    validatedDeployRequestId: string | null;
    deployOptions: DeployOptions,
    deployResult: DeployResult
}

/**
 * REST based deployment API implementation that uses the new restful resources to create and update deployments.
 */
export class RestDeploymentApi implements DeploymentApi {

    private rest: RestClient;

    constructor(private connection: SalesforceConnection) {
        this.rest = new RestClient(this.connection, `/services/data/v{apiVersion}/metadata`);
    }

    public async deploy(data: Stream | Buffer | string, deployOptions: DeployOptions): Promise<DeployResult> {
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

        const result = await this.rest.post<DeployRequest>(bodyParts, 'deployRequest');
        return result.deployResult;
    }

    public async checkDeployStatus(id: string, includeDetails?: boolean) {
        const result = await this.rest.get<DeployRequest>(`deployRequest/${id}?includeDetails=${!!includeDetails}`);
        return result.deployResult;
    }

    public async cancelDeploy(id: string) {
        const result = await this.rest.patch<DeployRequest>(
            { deployResult: { status: 'Canceling' } as DeployResult },
            `deployRequest/${id}`);
        return result.deployResult;
    }

    public async deployRecentValidation(validatedDeployRequestId: string) {
        const result = await this.rest.post<DeployRequest>(
            { validatedDeployRequestId },
            'deployRequest'
        );
        return result.deployResult;
    }
}
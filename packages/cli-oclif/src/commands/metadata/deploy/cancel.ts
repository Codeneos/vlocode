import * as fs from 'fs-extra';
import chalk from 'chalk';
import { Flags, Args } from '@oclif/core';

import { SalesforceCommand } from '../../../salesforceCommand';

export default class MetadataDeployCancel extends SalesforceCommand<typeof MetadataDeployCancel> {

    static description =
        'Cancel a pending or in-progress Salesforce metadata deployment by id. ' +
        'If no id is specified the id is read from the ".salesforce-deploy" status file.';

    static args = {
        id: Args.string({
            description: 'id of the Salesforce deployment to cancel',
            required: false,
        }),
    };

    static flags = {
        file: Flags.file({
            exists: true,
            multiple: false,
            default: '.salesforce-deploy',
            summary: 'JSON file containing the deployment id to cancel',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> -u my-org',
        '<%= config.bin %> <%= command.id %> 0Af3j0000004X2nCAE -u my-org',
    ];

    async run() {
        const deploymentId = this.args.id || (await this.getDeploymentIdFromFile());
        if (!deploymentId) {
            this.error('No deployment id specified');
        }

        this.info(`Cancelling deployment: ${chalk.bold(deploymentId)}`);
        await this.connection.metadata.cancelDeploy(deploymentId);
        this.info('Done');
    }

    private async getDeploymentIdFromFile() {
        this.info(`Reading deployment id from: ${chalk.bold(this.flags.file)}`);
        return (await fs.readJson(this.flags.file)).id;
    }
}

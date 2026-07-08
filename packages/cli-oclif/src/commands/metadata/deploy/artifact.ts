import fs from 'node:fs/promises';

import { Args, Flags } from '@oclif/core';
import logSymbols from 'log-symbols';

import { Timer } from '@vlocode/util';
import { SalesforcePackage } from '@vlocode/salesforce';

import { SalesforceCommand } from '../../../salesforceCommand';
import MetadataDeploy from '../deploy';
import { CliTestLevel, deployMetadata } from '../../../lib/metadataDeploy';

export default class MetadataDeployArtifact extends SalesforceCommand<typeof MetadataDeployArtifact> {

    static description =
        'Deploy or validate a previously built deployment package (zip) to a Salesforce org. ' +
        'Build packages with `metadata deploy --build-only --out <zip>`.';

    static args = {
        artifactPath: Args.file({
            exists: true,
            required: true,
            description: 'path to the deployment package zip file to deploy',
        }),
    };

    static flags = {
        'check-only': MetadataDeploy.flags['check-only'],
        'test-level': MetadataDeploy.flags['test-level'],
        'run-tests': MetadataDeploy.flags['run-tests'],
        'ignore-warnings': MetadataDeploy.flags['ignore-warnings'],
        'test-report': MetadataDeploy.flags['test-report'],
        'test-coverage-report': MetadataDeploy.flags['test-coverage-report'],
        'deploy-report': MetadataDeploy.flags['deploy-report'],
        revision: Flags.string({
            summary: 'git revision to record as deployed in the org settings after a successful deploy',
        }),
        branch: Flags.string({
            summary: 'git branch to record as deployed in the org settings after a successful deploy',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> package.zip -u my-org',
        '<%= config.bin %> <%= command.id %> package.zip --check-only -l RunLocalTests -u my-org',
    ];

    get operationType() {
        return this.flags['check-only'] ? 'Validation' : 'Deployment';
    }

    async run() {
        const timer = new Timer();
        const sfPackage = await SalesforcePackage.fromBuffer(await fs.readFile(this.args.artifactPath));

        const result = await deployMetadata({
            apiVersion: this.apiVersion,
            package: sfPackage,
            checkOnly: this.flags['check-only'],
            testLevel: this.flags["test-level"] as CliTestLevel | undefined,
            runTests: this.flags['run-tests'],
            ignoreWarnings: this.flags['ignore-warnings'],
            reports: {
                junit: this.flags['test-report'],
                coverage: this.flags['test-coverage-report'],
                deploy: this.flags['deploy-report'],
            },
        }, progress => this.info(`${this.operationType}: ${progress.deployed}/${progress.total} component(s)`), this.logger);

        if (!result) {
            this.info(`${logSymbols.success} ${this.operationType} completed in ${timer.toString('seconds')}`);
            return;
        }

        const cancelled = result.status === 'Canceling' || result.status === 'Canceled';
        if (result.success && !cancelled) {
            await this.recordDeployedRevision();
            this.info(`${logSymbols.success} ${this.operationType} succeeded in ${timer.toString('seconds')}`);
            return;
        }

        if (cancelled) {
            this.warn(`${logSymbols.warning} ${this.operationType} was cancelled in ${timer.toString('seconds')}`);
        } else {
            this.warn(`${logSymbols.error} ${this.operationType} failed (status: ${result.status ?? 'unknown'}) in ${timer.toString('seconds')}`);
        }
        this.exit(1);
    }

    private async recordDeployedRevision(): Promise<void> {
        if (this.flags['check-only'] || (!this.flags.revision && !this.flags.branch)) {
            return;
        }
        const store = this.getSettingsStore('sf');
        if (this.flags.revision) {
            await store.set('deployedRevision', this.flags.revision);
            this.info(`Recorded deployed revision ${this.flags.revision.slice(0, 12)}`);
        }
        if (this.flags.branch) {
            await store.set('deployedBranch', this.flags.branch);
        }
    }
}

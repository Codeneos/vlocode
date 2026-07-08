import path from 'node:path';

import { Args, Flags } from '@oclif/core';

import { SalesforceCommand } from '../../salesforceCommand';
import { loadPipeline } from '../../lib/pipeline/manifest';
import { PipelineRunner } from '../../lib/pipeline/pipelineRunner';

export default class DeployRun extends SalesforceCommand<typeof DeployRun> {

    static description = 'Run a multi-stage deployment pipeline that combines metadata, datapack and action stages';

    static args = {
        manifest: Args.file({
            exists: true,
            required: true,
            description: 'path to the deploy pipeline YAML manifest',
        }),
    };

    static flags = {
        'check-only': Flags.boolean({
            default: false,
            summary: 'force all metadata stages to validate-only (dry run)',
        }),
        stage: Flags.string({
            multiple: true,
            summary: 'run only the named stage(s)',
        }),
        from: Flags.string({
            summary: 'resume the pipeline from the named stage',
        }),
        'continue-on-error': Flags.boolean({
            exclusive: ['fail-fast'],
            summary: 'run all remaining stages on failure, then exit non-zero (overrides the manifest)',
        }),
        'fail-fast': Flags.boolean({
            exclusive: ['continue-on-error'],
            summary: 'stop at the first failed stage (overrides the manifest)',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> deploy-pipeline.yaml -u my-org',
        '<%= config.bin %> <%= command.id %> deploy-pipeline.yaml --check-only -u my-org',
        '<%= config.bin %> <%= command.id %> deploy-pipeline.yaml --stage "Apex & automation" -u my-org',
    ];

    async run() {
        const manifestPath = path.resolve(this.args.manifest);
        const pipeline = await loadPipeline(manifestPath);

        this.info(`Running pipeline${pipeline.name ? ` "${pipeline.name}"` : ''} with ${pipeline.stages.length} stage(s)`);

        const continueOnError = this.flags['continue-on-error'] ? true : this.flags['fail-fast'] ? false : undefined;

        await new PipelineRunner(this, pipeline, {
            manifestPath,
            checkOnly: this.flags['check-only'],
            continueOnError,
            stageNames: this.flags.stage,
            from: this.flags.from,
        }).run();
    }
}

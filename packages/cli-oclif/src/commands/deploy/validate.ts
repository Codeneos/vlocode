import path from 'node:path';

import { Args } from '@oclif/core';
import logSymbols from 'log-symbols';

import { BaseCommand } from '../../baseCommand';
import { loadPipeline } from '../../lib/pipeline/manifest';

export default class DeployValidate extends BaseCommand<typeof DeployValidate> {

    static description = 'Validate a deploy pipeline manifest (schema + variable interpolation) without connecting to an org';

    static args = {
        manifest: Args.file({
            exists: true,
            required: true,
            description: 'path to the deploy pipeline YAML manifest',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> deploy-pipeline.yaml',
    ];

    async run() {
        const pipeline = await loadPipeline(path.resolve(this.args.manifest));

        this.info(`${logSymbols.success} Manifest valid${pipeline.name ? `: "${pipeline.name}"` : ''} — ${pipeline.stages.length} stage(s)`);
        for (const [index, stage] of pipeline.stages.entries()) {
            const gating = stage.when?.orgType ? ` [when ${stage.when.orgType}]` : '';
            this.info(`  ${index + 1}. ${stage.name} (${stage.type})${gating}`);
        }
    }
}

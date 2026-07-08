import { readFile } from 'node:fs/promises';
import path from 'node:path';

import logSymbols from 'log-symbols';
import chalk from 'chalk';

import { container, LogManager } from '@vlocode/core';
import { asArray, getErrorMessage, Timer } from '@vlocode/util';
import { SalesforceDeployment, SalesforcePackage } from '@vlocode/salesforce';
import { DatapackDeployer, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';

import { SalesforceCommand } from '../../salesforceCommand';
import { CliTestLevel, deployMetadata } from '../metadataDeploy';
import { loadDatapacks } from '../datapackLoader';
import { detectInteractive, MultiStageProgress } from '../progress';
import { DeployPipeline, PipelineStage, StageWhenCondition } from './manifest';

export interface PipelineRunOptions {
    manifestPath: string;
    checkOnly?: boolean;
    /** Overrides the manifest's `continueOnError` when set. */
    continueOnError?: boolean;
    /** Run only these stage names. */
    stageNames?: string[];
    /** Resume the pipeline from this stage name. */
    from?: string;
}

export interface StageResult {
    name: string;
    type: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    timeMs: number;
}

function toArray(value: unknown): string[] | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    return (Array.isArray(value) ? value : [value]).map(String);
}

/**
 * Executes a {@link DeployPipeline} stage-by-stage, dispatching every stage type directly to the
 * native `@vlocode` services — the same engines the standalone commands use. Stages run
 * sequentially with `when` gating and per-stage/pipeline `continueOnError`.
 */
export class PipelineRunner {

    private readonly logger = LogManager.get('deploy:pipeline');

    constructor(
        private readonly command: SalesforceCommand,
        private readonly pipeline: DeployPipeline,
        private readonly options: PipelineRunOptions,
    ) {}

    public async run(): Promise<StageResult[]> {
        const stages = this.selectStages();
        const results: StageResult[] = [];
        const pipelineContinueOnError = this.options.continueOnError ?? this.pipeline.continueOnError ?? false;

        // Org details are required to evaluate any `when` conditions.
        if (stages.some(stage => stage.when)) {
            await this.command.getOrganizationDetails();
        }

        // Interactive terminals get a live task list (one entry per stage); in CI the runner's
        // own forward-printed stage lines below are the progress output, so no view is created.
        const view = detectInteractive()
            ? new MultiStageProgress<{ failed?: string }>({
                title: this.pipeline.name ? `Pipeline: ${this.pipeline.name}` : 'Deploy pipeline',
                stages: stages.map(stage => stage.name),
                postStagesBlock: [
                    { label: 'Failed stages', type: 'dynamic-key-value', get: data => data?.failed },
                ],
            })
            : undefined;
        // When the previous stage(s) were skipped, the next transition must mark them as such.
        let pendingSkip = false;

        for (const [index, stage] of stages.entries()) {
            const label = `[${index + 1}/${stages.length}] ${chalk.bold(stage.name)}`;

            if (!this.evaluateWhen(stage.when)) {
                this.logger.info(`${chalk.dim('◦')} ${label} — skipped (when condition not met)`);
                results.push({ name: stage.name, type: stage.type, status: 'skipped', timeMs: 0 });
                pendingSkip = true;
                continue;
            }

            if (view) {
                (pendingSkip ? view.skipTo.bind(view) : view.goto.bind(view))(stage.name);
            }
            pendingSkip = false;

            const timer = new Timer();
            this.logger.info(`${chalk.cyan('▶')} ${label} (${stage.type})`);
            try {
                await this.runStage(stage);
                results.push({ name: stage.name, type: stage.type, status: 'success', timeMs: timer.stop().elapsed });
                this.logger.info(`${logSymbols.success} ${label} completed in ${timer.toString('seconds')}`);
            } catch (err) {
                const message = getErrorMessage(err);
                results.push({ name: stage.name, type: stage.type, status: 'failed', error: message, timeMs: timer.stop().elapsed });
                this.logger.error(`${logSymbols.error} ${label} failed: ${message}`);

                const stageContinueOnError = stage.continueOnError ?? pipelineContinueOnError;
                if (!stageContinueOnError) {
                    view?.fail();
                    this.printSummary(results);
                    this.command.error(`Pipeline stopped at failed stage "${stage.name}"`);
                }
                view?.update({ failed: this.failedSummary(results) });
            }
        }

        const anyFailed = results.some(result => result.status === 'failed');
        if (view) {
            if (pendingSkip) {
                // Trailing skipped stage(s): jump the view to the last stage and end it as skipped.
                view.skipTo(stages[stages.length - 1].name);
            }
            if (anyFailed) {
                view.fail();
            } else {
                view.succeed(pendingSkip ? 'skipped' : undefined);
            }
        }

        this.printSummary(results);
        if (anyFailed) {
            this.command.error('Pipeline completed with one or more failed stages');
        }
        return results;
    }

    private failedSummary(results: StageResult[]): string | undefined {
        const failed = results.filter(result => result.status === 'failed');
        return failed.length ? `${failed.length} (${failed.map(result => result.name).join(', ')})` : undefined;
    }

    private selectStages(): PipelineStage[] {
        let stages = this.pipeline.stages;

        if (this.options.from) {
            const index = stages.findIndex(stage => stage.name === this.options.from);
            if (index === -1) {
                this.command.error(`--from stage "${this.options.from}" not found in the manifest`);
            }
            stages = stages.slice(index);
        }

        if (this.options.stageNames?.length) {
            const wanted = new Set(this.options.stageNames);
            stages = stages.filter(stage => wanted.has(stage.name));
            if (!stages.length) {
                this.command.error(`No stages matched --stage ${this.options.stageNames.join(', ')}`);
            }
        }

        return stages;
    }

    private async runStage(stage: PipelineStage): Promise<void> {
        switch (stage.type) {
            case 'metadata': return this.runMetadataStage(stage);
            case 'datapack': return this.runDatapackStage(stage);
            case 'apex': return this.runApexStage(stage);
            case 'batch': return this.runBatchStage(stage);
            case 'createRecords': return this.runCreateRecordsStage(stage);
            case 'deleteRecords': return this.runDeleteRecordsStage(stage);
            case 'destruct': return this.runDestructStage(stage);
            default: throw new Error(`unknown stage type "${stage.type}"`);
        }
    }

    private async runMetadataStage(stage: PipelineStage): Promise<void> {
        const coverageReport = stage.testCoverageReport as string | undefined;
        const result = await deployMetadata({
            apiVersion: this.command.apiVersion,
            sources: toArray(stage.sources) ?? ['src'],
            checkOnly: this.options.checkOnly || (stage.checkOnly as boolean | undefined),
            testLevel: stage.testLevel as CliTestLevel | undefined,
            runTests: toArray(stage.runTests),
            ignoreWarnings: (stage.ignoreWarnings as boolean | undefined) ?? true,
            delta: stage.delta as 'org' | 'git' | undefined,
            fromRevision: stage.fromRevision as string | undefined,
            tokens: this.pipeline.tokens,
            reports: {
                junit: stage.testReport as string | undefined,
                coverage: coverageReport,
                deploy: stage.deployReport as string | undefined,
            },
        }, undefined, this.logger);

        if (result && result.success !== true) {
            throw new Error(`metadata deployment ${result.status ?? 'failed'}`);
        }
    }

    private async runDatapackStage(stage: PipelineStage): Promise<void> {
        const sources = toArray(stage.sources);
        if (!sources?.length) {
            throw new Error('datapack stage requires "sources"');
        }
        const datapacks = await loadDatapacks(container.get(DatapackLoader), this.logger, sources);
        if (!datapacks.length) {
            return;
        }
        const deployment = await container.new(DatapackDeployer)
            .createDeployment(datapacks, (stage.options ?? {}) as DatapackDeploymentOptions);
        await deployment.start();

        const errors = deployment.getMessages().filter(({ type }) => type === 'error');
        if (errors.length) {
            throw new Error(`${errors.length} datapack error(s); first: ${errors[0].message}`);
        }
    }

    private async runApexStage(stage: PipelineStage): Promise<void> {
        const apex = stage.source as string | undefined
            ?? (stage.file ? await readFile(this.resolvePath(stage.file as string), 'utf8') : undefined);
        if (!apex) {
            throw new Error('apex stage requires "source" or "file"');
        }

        const result = await this.command.salesforce.executeAnonymous(apex, { updateNamespace: true });
        if (!result.compiled) {
            throw new Error(`Apex compile error: ${result.compileProblem}`);
        }
        if (!result.success) {
            throw new Error(`${result.exceptionMessage}\n${result.exceptionStackTrace}`);
        }
    }

    private async runBatchStage(stage: PipelineStage): Promise<void> {
        const className = stage.class as string | undefined;
        if (!className) {
            throw new Error('batch stage requires "class"');
        }
        const jobId = await this.command.salesforce.batch.executeBatch(className, {
            params: toArray(stage.parameters),
            batchSize: stage.size as number | undefined,
        });
        if (stage.async) {
            this.logger.info(`Scheduled batch ${className} (${jobId})`);
            return;
        }
        await this.command.salesforce.batch.awaitBatchJob(jobId);
    }

    private async runCreateRecordsStage(stage: PipelineStage): Promise<void> {
        const objectName = stage.object as string | undefined;
        if (!objectName) {
            throw new Error('createRecords stage requires "object"');
        }
        const rawRecords = asArray((stage.records ?? []) as Record<string, unknown> | Record<string, unknown>[]);
        if (!rawRecords.length) {
            throw new Error('createRecords stage requires "records"');
        }

        const records = rawRecords.map((values, index) => ({ ref: `${objectName}-${index + 1}`, values }));
        const results: any[] = [];
        for await (const result of this.command.salesforce.insert(objectName, records)) {
            results.push(result);
        }

        const failed = results.filter(result => !result.success);
        if (failed.length) {
            throw new Error(`Failed to create ${failed.length} ${objectName} record(s): ${failed[0].error?.message ?? failed[0].error}`);
        }
        this.logger.info(`Created ${results.length} ${objectName} record(s)`);
    }

    private async runDeleteRecordsStage(stage: PipelineStage): Promise<void> {
        const soql = stage.soql as string | undefined;
        if (!soql) {
            throw new Error('deleteRecords stage requires "soql"');
        }

        const records = await this.command.query<{ Id?: string; attributes?: { type?: string } }>(soql);
        if (!records.length) {
            this.logger.info('No records matched the delete query');
            return;
        }

        const objectName = (stage.object as string | undefined) ?? records[0].attributes?.type;
        if (!objectName) {
            throw new Error('Unable to infer the SObject type from the query results; specify "object" on the stage');
        }
        const ids = records.map(record => record.Id).filter((id): id is string => typeof id === 'string');

        const connection = this.command.getConnection();
        let deleted = 0;
        for (let index = 0; index < ids.length; index += 200) {
            const deleteResults = asArray(await connection.delete(objectName, ids.slice(index, index + 200)) as any);
            const failed = deleteResults.filter((result: any) => !result.success);
            if (failed.length) {
                throw new Error(`Failed to delete ${failed.length} record(s): ${JSON.stringify(failed[0]?.errors ?? failed[0])}`);
            }
            deleted += deleteResults.length;
        }
        this.logger.info(`Deleted ${deleted} ${objectName} record(s)`);
    }

    private async runDestructStage(stage: PipelineStage): Promise<void> {
        const components = asArray((stage.components ?? []) as (string | { type: string; name: string })[]);
        if (!components.length) {
            throw new Error('destruct stage requires "components"');
        }

        const sfPackage = new SalesforcePackage(this.command.apiVersion);
        for (const component of components) {
            if (typeof component === 'string') {
                const [type, ...name] = component.split('/');
                sfPackage.addDestructiveChange(type, name.join('/'));
            } else {
                sfPackage.addDestructiveChange(component.type, component.name);
            }
        }

        const deployment = new SalesforceDeployment(sfPackage);
        await deployment.start({ checkOnly: this.options.checkOnly });
        const result = await deployment.getResult();
        if (!result.success) {
            throw new Error(`destructive deployment ${result.status ?? 'failed'}`);
        }
    }

    /** Resolve a stage-relative path against the manifest's folder. */
    private resolvePath(file: string): string {
        return path.resolve(path.dirname(this.options.manifestPath), file);
    }

    private evaluateWhen(when?: StageWhenCondition): boolean {
        if (!when?.orgType) {
            return true;
        }
        if (when.orgType === 'Production') {
            return this.command.isProduction;
        }
        if (when.orgType === 'Sandbox' && this.command.isSandbox) {
            const names = toArray(when.sandboxName) ?? [];
            if (names.length) {
                return names.some(name => new RegExp(name.replace(/\*/g, '.*'), 'i').test(this.command.sandboxName ?? ''));
            }
            return true;
        }
        return false;
    }

    private printSummary(results: StageResult[]): void {
        this.logger.info(chalk.bold('\nPipeline summary:'));
        for (const result of results) {
            const icon = result.status === 'success' ? logSymbols.success
                : result.status === 'failed' ? logSymbols.error
                : logSymbols.info;
            const time = result.timeMs ? ` (${(result.timeMs / 1000).toFixed(1)}s)` : '';
            this.logger.info(`  ${icon} ${result.name} — ${result.status}${time}${result.error ? `: ${result.error}` : ''}`);
        }
    }
}

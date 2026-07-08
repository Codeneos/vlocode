import { Flags } from '@oclif/core';
import logSymbols from 'log-symbols';

import { asArray, Timer } from '@vlocode/util';
import * as fs from 'fs-extra';

import { SalesforceCommand } from '../../salesforceCommand';
import { CLI_TEST_LEVELS, CliTestLevel, deployMetadata, MetadataDeployProgress } from '../../lib/metadataDeploy';
import { MultiStageProgress } from '../../lib/progress';
import { git } from '../../lib/git';

/** Data rendered in the multi-stage view's info blocks. */
type DeployStageData = {
    id?: string;
    status?: string;
    components?: string;
};

const STAGE_PREPARING = 'Preparing';
const STAGE_WAITING = 'Waiting for the org to respond';
const STAGE_DEPLOYING = 'Deploying metadata';
const STAGE_TESTS = 'Running tests';
const STAGE_DONE = 'Done';

export default class MetadataDeploy extends SalesforceCommand<typeof MetadataDeploy> {

    static description = 'Deploy or validate a deployment of Salesforce metadata components to an org';

    static flags = {
        sources: Flags.string({
            char: 'd',
            summary: 'comma separated list of source files/folders to deploy (defaults to "src")',
        }),
        'check-only': Flags.boolean({
            default: false,
            summary: 'validate the deployment without making any changes (dry run)',
        }),
        'test-level': Flags.string({
            char: 'l',
            options: CLI_TEST_LEVELS,
            summary: 'which tests to run during deployment; RunRelevantTests resolves the tests covering the deployed Apex from the sources',
        }),
        'run-tests': Flags.string({
            multiple: true,
            summary: 'test classes to run (requires --test-level RunSpecifiedTests)',
        }),
        'ignore-warnings': Flags.boolean({
            default: true,
            allowNo: true,
            summary: 'ignore deployment warnings (use --no-ignore-warnings to treat warnings as errors)',
        }),
        delta: Flags.string({
            options: ['org', 'git'],
            summary: 'only deploy components changed vs the org ("org") or a git revision ("git")',
        }),
        'from-revision': Flags.string({
            char: 'f',
            summary: 'git revision to compare against for --delta git (defaults to the last deployed revision)',
        }),
        out: Flags.string({
            char: 'o',
            summary: 'save the deployment package zip to the specified path',
        }),
        'build-only': Flags.boolean({
            dependsOn: ['out'],
            summary: 'build the deployment package without deploying it (requires --out)',
        }),
        'test-report': Flags.string({
            char: 'r',
            summary: 'write a JUnit XML test report to the specified path',
        }),
        'test-coverage-report': Flags.string({
            summary: 'write a test coverage report (Jacoco XML) to the specified path',
        }),
        'deploy-report': Flags.string({
            summary: 'write a JSON deployment results report to the specified path',
        }),
        'env-file': Flags.file({
            exists: true,
            summary: 'JSON file with token replacements applied to the packaged sources',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> -d src -l RunLocalTests -u my-org',
        '<%= config.bin %> <%= command.id %> --check-only -d src -l RunAllTestsInOrg -u my-org',
        '<%= config.bin %> <%= command.id %> --delta org -u my-org',
        '<%= config.bin %> <%= command.id %> --build-only --out package.zip -d src',
    ];

    get operationType() {
        if (this.flags['build-only']) {
            return 'Build';
        }
        if (this.flags['check-only']) {
            return 'Validation';
        }
        return 'Deployment';
    }

    async run() {
        const timer = new Timer();
        const sources = this.flags.sources
            ? asArray(this.flags.sources.split(/[,;]/).map(source => source.trim()))
            : ['src'];

        this.stages = new MultiStageProgress<DeployStageData>({
            title: `${this.operationType} of v${this.apiVersion} metadata to ${this.targetOrg}`,
            stages: [STAGE_PREPARING, STAGE_WAITING, STAGE_DEPLOYING, ...(this.hasTests ? [STAGE_TESTS] : []), STAGE_DONE],
            postStagesBlock: [
                { label: 'Status', type: 'dynamic-key-value', get: data => data?.status },
                { label: 'Deploy ID', type: 'static-key-value', get: data => data?.id },
                { label: 'Target Org', type: 'static-key-value', get: () => this.targetOrg },
            ],
            stageSpecificBlock: [
                { stage: STAGE_DEPLOYING, label: 'Components', type: 'dynamic-key-value', get: data => data?.components },
            ],
        });
        this.stages.goto(STAGE_PREPARING);

        let result;
        try {
            result = await deployMetadata({
                apiVersion: this.apiVersion,
                sources,
                checkOnly: this.flags['check-only'],
                testLevel: this.flags['test-level'] as CliTestLevel | undefined,
                runTests: this.flags['run-tests'],
                ignoreWarnings: this.flags['ignore-warnings'],
                delta: this.flags.delta as 'org' | 'git' | undefined,
                fromRevision: this.flags.delta === 'git' ? await this.resolveFromRevision() : undefined,
                tokens: this.flags['env-file'] ? await fs.readJson(this.flags['env-file']) : undefined,
                out: this.flags.out,
                buildOnly: this.flags['build-only'],
                reports: {
                    junit: this.flags['test-report'],
                    coverage: this.flags['test-coverage-report'],
                    deploy: this.flags['deploy-report'],
                },
                onDeployStart: id => this.stages?.goto(STAGE_WAITING, { id }),
            }, progress => this.reportProgress(progress), this.logger);
        } catch (err) {
            // Restore the terminal before the error surfaces.
            this.stages.fail();
            throw err;
        }

        // Nothing was deployed (build-only, or the package was empty/up-to-date).
        if (!result) {
            this.stages.skipTo(STAGE_DONE);
            this.stages.succeed();
            this.info(`${logSymbols.success} ${this.operationType} completed in ${timer.toString('seconds')}`);
            return;
        }

        const cancelled = result.status === 'Canceling' || result.status === 'Canceled';
        if (result.success && !cancelled) {
            this.stages.goto(STAGE_DONE);
            this.stages.succeed();
            await this.recordDeployedRevision(sources);
            this.info(`${logSymbols.success} ${this.operationType} succeeded in ${timer.toString('seconds')}`);
            return;
        }

        this.stages.fail();
        this.printFailures(result);
        if (cancelled) {
            this.warn(`${logSymbols.warning} ${this.operationType} was cancelled in ${timer.toString('seconds')}`);
        } else {
            this.warn(`${logSymbols.error} ${this.operationType} failed (status: ${result.status ?? 'unknown'}) in ${timer.toString('seconds')}`);
        }
        this.exit(1);
    }

    private stages?: MultiStageProgress<DeployStageData>;

    private get hasTests(): boolean {
        return this.flags['test-level'] !== undefined && this.flags['test-level'] !== 'NoTestRun';
    }

    private get targetOrg(): string {
        return this.flags.user ?? this.connection.instanceUrl;
    }

    /**
     * Drive the multi-stage view from the deployment's progress events: components counter while
     * deploying, and — once all components are in and tests were requested — the test stage. The
     * renderer handles interactive (live task list) and CI (forward-printed lines) by itself.
     */
    private reportProgress(progress: MetadataDeployProgress) {
        const data: Partial<DeployStageData> = {
            status: progress.status,
            components: progress.total
                ? `${progress.deployed}/${progress.total}${progress.errors ? ` (${progress.errors} failed)` : ''}`
                : undefined,
        };
        const testsRunning = this.hasTests && progress.total > 0 && progress.deployed >= progress.total;
        this.stages?.goto(testsRunning ? STAGE_TESTS : STAGE_DEPLOYING, data);
    }

    private printFailures(result: { details?: { componentFailures?: unknown } | null }) {
        for (const failure of asArray((result.details?.componentFailures ?? []) as any[])) {
            this.logger.error(`${failure.componentType ?? ''} ${failure.fullName ?? ''}: ${failure.problem}`);
        }
    }

    /**
     * For git delta: the explicit `--from-revision`, falling back to the revision recorded in the
     * org settings by the previous successful deploy.
     */
    private async resolveFromRevision(): Promise<string | undefined> {
        if (this.flags['from-revision']) {
            return this.flags['from-revision'];
        }
        const stored = await this.getSettingsStore('sf').get('deployedRevision');
        if (stored) {
            this.info(`Using last deployed revision from org settings: ${stored.slice(0, 12)}`);
        }
        return stored;
    }

    /**
     * Record the deployed git revision/branch to the org settings so the next `--delta git` can
     * resume from it. Best effort — skipped when not deploying (check-only) or not in a git repo.
     */
    private async recordDeployedRevision(sources: string[]): Promise<void> {
        if (this.flags['check-only'] || this.flags['build-only']) {
            return;
        }
        try {
            const store = this.getSettingsStore('sf');
            await store.set('deployedRevision', await git.headRevision(sources));
            const branch = await git.branchName(sources);
            if (branch) {
                await store.set('deployedBranch', branch);
            }
        } catch (err) {
            this.logger.verbose(`Skipping deployed-revision tracking: ${err instanceof Error ? err.message : err}`);
        }
    }
}

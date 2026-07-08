import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as fs from 'fs-extra';

import { container, Logger, LogManager } from '@vlocode/core';
import { asArray } from '@vlocode/util';
import { TestIdentifier } from '@vlocode/apex';
import {
    DeployOptions,
    DeployResult,
    SalesforceDeployment,
    SalesforcePackage,
    SalesforcePackageBuilder,
    SalesforcePackageType,
} from '@vlocode/salesforce';

import { git } from './git';
import { JunitReport, JunitTestCase } from './reports/junitReport';
import { JacocoReport, SalesforceApexCodeCoverageRecord } from './reports/jacocoReport';

/** File the deployment id is written to so `metadata deploy cancel` can pick it up. */
export const DEPLOY_STATUS_FILE = '.salesforce-deploy';

export type MetadataTestLevel = NonNullable<DeployOptions['testLevel']>;

/**
 * Test levels accepted by the CLI: the native Metadata API levels plus `RunRelevantTests`, which
 * resolves the test classes covering the Apex components in the deployment (via `@vlocode/apex`
 * {@link TestIdentifier}) and deploys them as `RunSpecifiedTests`.
 */
export type CliTestLevel = MetadataTestLevel | 'RunRelevantTests';

export const CLI_TEST_LEVELS: CliTestLevel[] = [
    'NoTestRun', 'RunSpecifiedTests', 'RunRelevantTests', 'RunLocalTests', 'RunAllTestsInOrg',
];

export interface MetadataDeployRequest {
    apiVersion: string;
    /** Source folders/files to package; ignored when a prebuilt `package` is passed. */
    sources?: string[];
    /** Deploy a prebuilt package (artifact) instead of building one from sources. */
    package?: SalesforcePackage;
    checkOnly?: boolean;
    testLevel?: CliTestLevel;
    runTests?: string[];
    ignoreWarnings?: boolean;
    /** Only include components changed vs the org (`org`) or vs a git revision (`git`). */
    delta?: 'org' | 'git';
    fromRevision?: string;
    /** Token replacements applied to packaged sources (native TokenReplacementPlugin). */
    tokens?: Record<string, string>;
    /** Write the built package zip to this path. */
    out?: string;
    /** Build (and optionally write) the package without deploying. */
    buildOnly?: boolean;
    /** Report outputs written after the deployment completes. */
    reports?: {
        junit?: string;
        coverage?: string;
        deploy?: string;
    };
    /** Invoked once the deployment is queued on the org, with the Salesforce deployment id. */
    onDeployStart?: (deploymentId: string) => void;
}

export interface MetadataDeployProgress {
    status: string;
    deployed: number;
    total: number;
    errors: number;
}

/**
 * Build a deployable {@link SalesforcePackage} from source paths using the native
 * {@link SalesforcePackageBuilder}, applying token replacements and the requested delta strategy.
 */
export async function buildMetadataPackage(request: MetadataDeployRequest, logger: Logger): Promise<SalesforcePackage> {
    const builder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, request.apiVersion);

    for (const [token, replacement] of Object.entries(request.tokens ?? {})) {
        builder.addReplacement({ token, replacement });
    }

    let sources = request.sources ?? ['src'];
    if (request.delta === 'git') {
        sources = await changedSourceFiles(sources, requireRevision(request), logger);
        if (!sources.length) {
            return builder.build();
        }
    }

    await builder.addFiles(sources);

    if (request.delta === 'org') {
        // Native org-compare delta: retrieves the org state and drops unchanged components.
        const removed = await builder.removeUnchanged();
        logger.verbose(`Delta check removed ${removed.length} unchanged component(s)`);
    }

    return builder.build();
}

function requireRevision(request: MetadataDeployRequest): string {
    if (!request.fromRevision) {
        throw new Error('Git delta requires a revision to compare against (--from-revision)');
    }
    return request.fromRevision;
}

/**
 * Resolve the source files changed since `fromRevision` (added/modified; deletions are skipped).
 */
async function changedSourceFiles(sources: string[], fromRevision: string, logger: Logger): Promise<string[]> {
    const root = git.gitRoot(sources, true);
    const changes = await git.diff(sources, fromRevision);
    const files = changes
        .filter(change => change.type !== 'remove')
        .map(change => path.join(root, change.path))
        .filter(file => existsSync(file));
    logger.info(`Git delta vs ${fromRevision.slice(0, 12)}: ${files.length} changed file(s)`);
    return files;
}

/**
 * Deploy metadata to the connected org using the native {@link SalesforceDeployment}.
 *
 * Builds the package from `sources` (or uses the prebuilt `package`), optionally writes the zip to
 * `out`, streams progress through `onProgress`, records the deployment id to
 * {@link DEPLOY_STATUS_FILE} (so `metadata deploy cancel` works), and writes the requested reports
 * once the deployment completes. Returns `undefined` when there was nothing to deploy or
 * `buildOnly` was requested.
 */
export async function deployMetadata(
    request: MetadataDeployRequest,
    onProgress?: (progress: MetadataDeployProgress) => void,
    logger: Logger = LogManager.get('metadata:deploy'),
): Promise<DeployResult | undefined> {
    const sfPackage = request.package ?? await buildMetadataPackage(request, logger);

    if (sfPackage.isEmpty) {
        logger.info('Nothing to deploy; package is empty (all components up-to-date or no sources matched)');
        return undefined;
    }
    logger.info(`Packaged ${sfPackage.size()} component(s)`);

    if (request.out) {
        await fs.outputFile(request.out, await sfPackage.getBuffer());
        logger.info(`Package written to ${request.out}`);
    }
    if (request.buildOnly) {
        return undefined;
    }

    // Resolve the CLI-level RunRelevantTests into a native RunSpecifiedTests + test class list.
    let { testLevel, runTests } = request;
    if (testLevel === 'RunRelevantTests') {
        ({ testLevel, runTests } = await resolveRelevantTests(sfPackage, request.sources ?? [], logger));
    }

    const deployment = new SalesforceDeployment(sfPackage);
    deployment.on('progress', progress => onProgress?.(progress as MetadataDeployProgress));

    await deployment.start({
        checkOnly: request.checkOnly,
        testLevel: testLevel === 'NoTestRun' ? undefined : testLevel as MetadataTestLevel | undefined,
        runTests,
        ignoreWarnings: request.ignoreWarnings,
    });
    request.onDeployStart?.(deployment.id);
    await writeFile(DEPLOY_STATUS_FILE, JSON.stringify({ id: deployment.id }, null, 2)).catch(() => { /* best effort */ });

    const result = await deployment.getResult();
    await writeReports(result, request.reports, logger);
    return result;
}

/**
 * Resolve the test classes relevant to the Apex components in the deployment package.
 *
 * Builds a reference graph from the source folders using `@vlocode/apex`'s {@link TestIdentifier}
 * and collects the test classes covering each deployed class/trigger (one reference level deep),
 * plus any test classes that are themselves part of the deployment. Falls back to the org's
 * default test behaviour — with a warning — when nothing can be resolved.
 */
async function resolveRelevantTests(
    sfPackage: SalesforcePackage,
    sources: string[],
    logger: Logger,
): Promise<{ testLevel?: MetadataTestLevel; runTests?: string[] }> {
    const apexComponents = [...sfPackage.manifest.components()]
        .filter(({ componentType }) => componentType === 'ApexClass' || componentType === 'ApexTrigger')
        .map(({ componentName }) => componentName);

    if (!apexComponents.length) {
        logger.info('Deployment contains no Apex components; no relevant tests to run');
        return {};
    }
    if (!sources.length) {
        logger.warn('RunRelevantTests requires source folders to resolve test coverage; using the org default test behaviour');
        return {};
    }

    const identifier = container.new(TestIdentifier);
    await identifier.loadApexClasses(sources);

    const tests = new Set<string>(deployedTestClasses(sfPackage));
    for (const componentName of apexComponents) {
        identifier.getTestClasses(componentName, { depth: 1 })?.forEach(testClass => tests.add(testClass));
    }

    if (!tests.size) {
        logger.warn('No relevant test classes found for the deployed Apex components; using the org default test behaviour');
        return {};
    }

    logger.info(`Running ${tests.size} relevant test class(es): ${[...tests].join(', ')}`);
    return { testLevel: 'RunSpecifiedTests', runTests: [...tests] };
}

/** Test classes included in the deployment itself (they should always run with their change). */
function deployedTestClasses(sfPackage: SalesforcePackage): string[] {
    const tests: string[] = [];
    for (const { packagePath } of sfPackage.sourceFiles()) {
        if (!packagePath.endsWith('.cls')) {
            continue;
        }
        const body = sfPackage.getPackageData(packagePath)?.data?.toString() ?? '';
        if (/@isTest\b/i.test(body)) {
            tests.push(path.basename(packagePath, '.cls'));
        }
    }
    return tests;
}

/** Write junit/jacoco/deploy-result reports for a completed deployment. */
export async function writeReports(
    result: DeployResult,
    reports: MetadataDeployRequest['reports'],
    logger: Logger,
): Promise<void> {
    if (!reports) {
        return;
    }

    const testResult = result.details?.runTestResult;
    if (reports.junit && testResult) {
        const junit = new JunitReport('salesforce-deploy');
        for (const success of asArray(testResult.successes ?? [])) {
            junit.addTestCase(success.name, new JunitTestCase(success.methodName, success.name, Number(success.time)));
        }
        for (const failure of asArray(testResult.failures ?? [])) {
            const testCase = new JunitTestCase(failure.methodName, failure.name, Number(failure.time));
            testCase.setOutcome(false, failure.message);
            // The Metadata API returns a stack trace for failures; the typed interface omits it.
            testCase.setStacktrace((failure as any).stackTrace);
            junit.addTestCase(failure.name, testCase);
        }
        await fs.outputFile(reports.junit, junit.toXml());
        logger.info(`Test report written to ${reports.junit}`);
    }

    if (reports.coverage && testResult) {
        const jacoco = new JacocoReport('salesforce-deploy');
        jacoco.addCoverageRecords(asArray(testResult.codeCoverage ?? []).map(coverageRecord));
        await fs.outputFile(reports.coverage, jacoco.getReport());
        logger.info(`Coverage report written to ${reports.coverage}`);
    }

    if (reports.deploy) {
        await fs.outputJson(reports.deploy, result, { spaces: 4 });
        logger.info(`Deployment report written to ${reports.deploy}`);
    }
}

/**
 * Map a Salesforce {@link CodeCoverageResult} to the jacoco record shape. Salesforce only
 * enumerates *uncovered* locations, so covered line numbers are synthesized (lowest line numbers
 * not marked uncovered) — aggregate counts and the uncovered lines stay exact.
 */
function coverageRecord(coverage: any): SalesforceApexCodeCoverageRecord {
    const totalLines = Number(coverage.numLocations ?? 0);
    const uncovered = asArray(coverage.locationsNotCovered ?? []).map((location: any) => Number(location.line));
    const totalCovered = totalLines - uncovered.length;

    const lines: Record<string, 0 | 1> = {};
    for (const line of uncovered) {
        lines[line] = 0;
    }
    for (let line = 1, covered = 0; covered < totalCovered; line++) {
        if (lines[line] === undefined) {
            lines[line] = 1;
            covered++;
        }
    }

    return {
        id: coverage.id ?? coverage.name,
        name: coverage.name,
        totalLines,
        totalCovered,
        coveredPercent: totalLines ? Math.round((totalCovered / totalLines) * 10000) / 100 : 0,
        lines,
    };
}

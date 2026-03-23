import type { Container } from '@vlocode/core';
import {
    SalesforceDeployService,
    SalesforcePackageBuilder,
    SalesforcePackageType,
} from '@vlocode/salesforce';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const metadataTools: Tool[] = [
    {
        name: 'deploy_metadata',
        description:
            'Deploy Salesforce metadata (Apex classes, triggers, LWC components, etc.) ' +
            'from local source files or directories to the target Salesforce org. ' +
            'Accepts any files or folders that form a valid Salesforce metadata package.',
        inputSchema: {
            type: 'object',
            properties: {
                paths: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'List of absolute paths to metadata source files or directories to deploy. ' +
                        'Directories are scanned recursively. ' +
                        'Accepts standard Salesforce metadata layout (e.g. force-app/main/default).',
                    minItems: 1,
                },
                checkOnly: {
                    type: 'boolean',
                    description:
                        'Validate the deployment without committing changes (dry-run). Defaults to false.',
                    default: false,
                },
                ignoreWarnings: {
                    type: 'boolean',
                    description:
                        'Treat deployment warnings as non-fatal. Defaults to true.',
                    default: true,
                },
                rollbackOnError: {
                    type: 'boolean',
                    description:
                        'Roll back the entire deployment when any component fails. Defaults to false.',
                    default: false,
                },
                apiVersion: {
                    type: 'string',
                    description:
                        'Salesforce API version to use for the deployment (e.g. "59.0"). ' +
                        'Defaults to the connection\'s default API version.',
                },
            },
            required: ['paths'],
        },
    },
];

export async function executeMetadataTool(
    name: string,
    args: Record<string, unknown>,
    localContainer: Container
) {
    if (name === 'deploy_metadata') {
        return deployMetadata(args, localContainer);
    }
    throw new Error(`Unknown metadata tool: ${name}`);
}

async function deployMetadata(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const paths = args['paths'] as string[];
    const apiVersion = args['apiVersion'] as string | undefined;
    const checkOnly = (args['checkOnly'] as boolean) ?? false;
    const ignoreWarnings = (args['ignoreWarnings'] as boolean) ?? true;
    const rollbackOnError = (args['rollbackOnError'] as boolean) ?? false;

    // Build the metadata package
    const packageBuilder = localContainer.new(
        SalesforcePackageBuilder,
        SalesforcePackageType.deploy,
        apiVersion
    );
    await packageBuilder.addFiles(paths);

    const components = packageBuilder.getPackageComponents();
    if (components.length === 0) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `No deployable metadata components found in the specified paths: ${paths.join(', ')}`,
                },
            ],
        };
    }

    const sfPackage = await packageBuilder.build();
    const deployService = localContainer.get(SalesforceDeployService);

    const result = await deployService.deployPackage(sfPackage, {
        checkOnly,
        ignoreWarnings,
        rollbackOnError,
        allowMissingFiles: false,
        purgeOnDelete: true,
        singlePackage: true,
    });

    const lines: string[] = [
        `Deployment ${result.success ? 'SUCCEEDED' : 'FAILED'} [${result.status}]`,
        `  Components: ${result.numberComponentsDeployed ?? 0}/${result.numberComponentsTotal ?? components.length} deployed, ${result.numberComponentErrors ?? 0} errors`,
    ];

    if (result.details?.componentFailures) {
        const failures = Array.isArray(result.details.componentFailures)
            ? result.details.componentFailures
            : [result.details.componentFailures];
        for (const failure of failures) {
            lines.push(`  [ERROR] ${failure.fileName}: ${failure.problem}`);
        }
    }

    if (result.errorMessage) {
        lines.push(`  ${result.errorMessage}`);
    }

    return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        isError: !result.success,
    };
}

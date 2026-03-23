import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Container } from '@vlocode/core';
import {
    DatapackDeployer,
    DatapackDeploymentOptions,
    DatapackExporter,
    DatapackExportDefinitionStore,
} from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const datapackTools: Tool[] = [
    {
        name: 'deploy_datapacks',
        description:
            'Deploy one or more Vlocity datapacks from local folders to Salesforce. ' +
            'Provide a list of folder paths that contain datapack files (*_DataPack.json).',
        inputSchema: {
            type: 'object',
            properties: {
                paths: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'List of absolute or relative paths to folders containing datapack files.',
                    minItems: 1,
                },
                continueOnError: {
                    type: 'boolean',
                    description:
                        'Continue deploying even if some datapacks fail to load. Defaults to false.',
                    default: false,
                },
                strictOrder: {
                    type: 'boolean',
                    description:
                        'Enforce strict deployment order for dependent datapacks. Defaults to false.',
                    default: false,
                },
                deltaCheck: {
                    type: 'boolean',
                    description:
                        'Only deploy datapacks that differ from the target org. Defaults to false.',
                    default: false,
                },
            },
            required: ['paths'],
        },
    },
    {
        name: 'retrieve_datapacks',
        description:
            'Export/retrieve one or more Salesforce objects as Vlocity datapacks. ' +
            'Objects are identified by their Salesforce IDs or by a SOQL query. ' +
            'The datapacks are written to the specified output directory.',
        inputSchema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'List of Salesforce record IDs to export as datapacks.',
                },
                query: {
                    type: 'string',
                    description:
                        'SOQL query to identify the records to export. ' +
                        'Use this instead of `ids` when you need to filter records.',
                },
                outputDir: {
                    type: 'string',
                    description:
                        'Absolute or relative path to the directory where the exported datapack files will be written.',
                },
                expand: {
                    type: 'boolean',
                    description:
                        'Expand each datapack into separate files (one file per child record / resource). Defaults to true.',
                    default: true,
                },
                exportDefinitions: {
                    type: 'string',
                    description:
                        'Path to a YAML or JSON file containing custom export definitions. ' +
                        'When omitted, the built-in definitions are used.',
                },
            },
            required: ['outputDir'],
        },
    },
];

export async function executeDatapackTool(
    name: string,
    args: Record<string, unknown>,
    localContainer: Container
) {
    if (name === 'deploy_datapacks') {
        return deployDatapacks(args, localContainer);
    }
    if (name === 'retrieve_datapacks') {
        return retrieveDatapacks(args, localContainer);
    }
    throw new Error(`Unknown datapack tool: ${name}`);
}

async function deployDatapacks(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const paths = args['paths'] as string[];
    const options: DatapackDeploymentOptions = {
        continueOnError: (args['continueOnError'] as boolean) ?? false,
        strictOrder: (args['strictOrder'] as boolean) ?? false,
        deltaCheck: (args['deltaCheck'] as boolean) ?? false,
    };

    const loader = localContainer.new(DatapackLoader);
    const datapacks = (
        await Promise.all(paths.map((p) => loader.loadDatapacksFromFolder(p)))
    ).flat(1);

    if (datapacks.length === 0) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `No datapacks found in the specified folders: ${paths.join(', ')}`,
                },
            ],
        };
    }

    const deployer = localContainer.new(DatapackDeployer);
    const deployment = await deployer.deploy(datapacks, options);
    const status = deployment.getStatus();

    const succeeded = status.datapacks.filter((d) => d.status === 'success').length;
    const failed = status.datapacks.filter((d) => d.status === 'error').length;
    const partial = status.datapacks.filter((d) => d.status === 'partialSuccess').length;

    const lines: string[] = [
        `Deployment complete: ${succeeded} succeeded, ${failed} failed, ${partial} partial (${status.total} total)`,
    ];

    for (const d of status.datapacks) {
        if (d.status === 'error' || d.status === 'partialSuccess') {
            lines.push(`  [${d.status.toUpperCase()}] ${d.datapack}:`);
            for (const msg of d.messages) {
                lines.push(
                    `    ${msg.type === 'error' ? '[ERROR]' : '[WARN]'} ${msg.message}`
                );
            }
        }
    }

    return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        isError: failed > 0,
    };
}

async function retrieveDatapacks(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const outputDir = args['outputDir'] as string;
    const doExpand = (args['expand'] as boolean) ?? true;

    // Load custom export definitions when provided
    if (args['exportDefinitions']) {
        const { readFileSync } = await import('fs');
        const content = readFileSync(args['exportDefinitions'] as string, 'utf-8');
        let definitions: Record<string, unknown>;
        try {
            const yaml = await import('js-yaml');
            definitions = yaml.load(content) as Record<string, unknown>;
        } catch {
            definitions = JSON.parse(content) as Record<string, unknown>;
        }
        localContainer.get(DatapackExportDefinitionStore).load(
            definitions as Record<string, Partial<import('@vlocode/vlocity-deploy').DatapackExportDefinition>>
        );
    }

    // Resolve the list of IDs to export
    let ids: string[];
    if (args['query']) {
        const { SalesforceService } = await import('@vlocode/salesforce');
        const records = await localContainer
            .get(SalesforceService)
            .data.query(args['query'] as string);
        if (records.length === 0) {
            return {
                content: [
                    {
                        type: 'text' as const,
                        text: `No records found for the query: ${args['query']}`,
                    },
                ],
            };
        }
        ids = records.map((r) => r.Id as string);
    } else if (args['ids'] && Array.isArray(args['ids'])) {
        ids = args['ids'] as string[];
    } else {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: 'Either `ids` or `query` must be specified.',
                },
            ],
            isError: true,
        };
    }

    const exporter = localContainer.new(DatapackExporter);
    const written: string[] = [];
    await mkdir(outputDir, { recursive: true });

    for (const id of ids) {
        if (doExpand) {
            const expanded = await exporter.exportObjectAndExpand(id);
            const folderPath = join(outputDir, expanded.folder);
            await mkdir(folderPath, { recursive: true });

            for (const [fileName, fileData] of Object.entries(expanded.files)) {
                const filePath = join(folderPath, fileName);
                await writeFile(filePath, fileData);
                written.push(filePath);
            }
        } else {
            const result = await exporter.exportObject(id);
            const baseName = (result.datapack['Name'] as string | undefined) ?? id;
            const dpPath = join(outputDir, baseName + '_DataPack.json');
            const pkPath = join(outputDir, baseName + '_ParentKeys.json');
            await writeFile(dpPath, JSON.stringify(result.datapack, null, 4), 'utf-8');
            await writeFile(
                pkPath,
                JSON.stringify(result.parentKeys, null, 4),
                'utf-8'
            );
            written.push(dpPath, pkPath);
        }
    }

    return {
        content: [
            {
                type: 'text' as const,
                text: [
                    `Exported ${ids.length} datapack(s) to '${outputDir}'.`,
                    'Files written:',
                    ...written.map((f) => `  ${f}`),
                ].join('\n'),
            },
        ],
    };
}

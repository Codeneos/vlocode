import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import VlocityDatapackService from '../../lib/vlocity/vlocityDatapackService';
import { LogManager, Logger, injectable } from '@vlocode/core';
import * as yaml from 'js-yaml';

import VlocityJobFile from '../../lib/vlocity/vlocityJobFile';
import * as vlocity from 'vlocity';
import { filterUndefined, getErrorMessage } from '@vlocode/util';
import { TreeDataProvider } from '../treeDataProvider';
import VlocodeService from '../../lib/vlocodeService';
import { VlocodeCommand } from '../../constants';

@injectable()
export class JobDataProvider extends TreeDataProvider<JobNode> {

    private readonly jobCommandOptions = [
        {
            type: 'Export',
            icon: 'cloud-download',
            label: 'Run as Export',
            detail: 'retrieve and save Vlocity datapacks on your local machine'
        },
        {
            type: 'Deploy',
            icon: 'cloud-upload',
            label: 'Run as Deploy',
            detail: 'upload and deploy previously exported Vlocity datapacks'
        }
    ];

    constructor(service: VlocodeService) {
        super(service);
    }

    protected getCommands() {
        return {
            'vlocode.jobExplorer.run': async (node: JobNode) => this.runJob(node),
            'vlocode.jobExplorer.refresh': () => this.refresh()
        };
    }

    private async runJob(node: JobNode) {
        if (node.exportManifest) {
            await this.executeCommand(VlocodeCommand.runExportJob, node.jobFile);
            return;
        }
        const jobCommand = await vscode.window.showQuickPick(this.jobCommandOptions, {
            placeHolder: 'Select how to run this job',
            ignoreFocusOut: true
        });

        if (!jobCommand) {
            return;
        }

        try {
            await this.vlocode.withActivity({
                location: vscode.ProgressLocation.Notification,
                progressTitle: `${jobCommand.type}ing with ${path.basename(node.jobFile.fsPath)} ...`,
                cancellable: true
            }, (progress, token) => this.datapackService.runYamlJob(jobCommand.type as vlocity.actionType, node.jobFile.fsPath, token));
            void vscode.window.showInformationMessage(`Successfully ${jobCommand.type.toLowerCase()}ed with ${path.basename(node.jobFile.fsPath)}`);
        } catch {
            void vscode.window.showErrorMessage(`Running job file ${path.basename(node.jobFile.fsPath)} resulted in an error, see the log for details.`);
        }
    }

    private get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
    }

    private get logger() : Logger {
        return LogManager.get(JobDataProvider);
    }

    public toTreeItem(node: JobNode): vscode.TreeItem {
        return {
            label: node.label,
            resourceUri: node.jobFile,
            command: {
                title: 'Open',
                command: 'vscode.open',
                arguments: [ node.jobFile ]
            },
            contextValue: 'vlocode:jobYaml',
            tooltip: node.tooltip,
            description: node.description,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    private isVlocityJobFile(arg: unknown) : arg is VlocityJobFile {
        if (arg && typeof arg === 'object' && Array.isArray(arg['queries'])) {
            return arg['queries'].every(query => Object.prototype.hasOwnProperty.call(query, 'VlocityDataPackType'));
        }
        return false;
    }

    private isExportManifest(body: unknown): boolean {
        if (!body || typeof body !== 'object' || !body['export'] || typeof body['export'] !== 'object' || Array.isArray(body['export'])) {
            return false;
        }
        return Object.values(body['export']).every(queries =>
            typeof queries === 'string' || (Array.isArray(queries) && queries.every(query => typeof query === 'string')));
    }

    public async getChildren(): Promise<JobNode[]> {
        const yamlFiles = await vscode.workspace.findFiles('**/*.{yaml,yml,json}');
        const yamlFilesWithBody = await Promise.all(yamlFiles.map(async file => {
            try {
                return {
                    file,
                    body: yaml.load((await fs.readFile(file.fsPath)).toString('utf8'), { filename: file.fsPath })
                };
            } catch(err) {
                this.logger.error(`Unable to load YAML file ${file.fsPath} due to parsing error: ${getErrorMessage(err)}`);
            }
        }));

        // Remove non-job files
        this.logger.info(`Found ${yamlFilesWithBody.length} potential job files in workspace folders`);
        const validJobFiles = filterUndefined(yamlFilesWithBody).filter(file => this.isVlocityJobFile(file.body) || this.isExportManifest(file.body));
        this.logger.info(`Displaying ${validJobFiles.length} valid Job files in Job explorer`);

        return validJobFiles.map(({ file, body }) => new JobNode(file, this.isExportManifest(body)));
    }
}

class JobNode {
    constructor(
        public readonly jobFile: vscode.Uri,
        public readonly exportManifest = false
    ) { }

    public get label() : string {
        return path.basename(this.jobFile.fsPath);
    }

    public get tooltip() : string {
        return this.jobFile.fsPath;
    }

    public get description() : string {
        return vscode.workspace.asRelativePath(this.jobFile);
    }
}

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import VlocityDatapackService from '@lib/vlocity/vlocityDatapackService';
import { LogManager, Logger } from '@vlocode/core';
import * as yaml from 'js-yaml';

import VlocityJobFile from '@lib/vlocity/vlocityJobFile';
import * as vlocity from 'vlocity';
import { filterUndefined } from '@vlocode/util';
import BaseDataProvider from './baseDataProvider';

export default class JobDataProvider extends BaseDataProvider<JobNode> {

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

    protected getCommands() {
        return {
            'vlocode.jobExplorer.run': async (node: JobNode) => this.runJob(node),
            'vlocode.jobExplorer.refresh': () => this.refresh()
        };
    }

    private async runJob(node: JobNode) {
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
        } catch(err) {
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

    private isValidJob(job: VlocityJobFile) {
        if (job && Array.isArray(job.queries)) {
            return job.queries.every(query => !!query.VlocityDataPackType);
        }
        return false;
    }

    public async getChildren(): Promise<JobNode[]> {
        const yamlFiles = await vscode.workspace.findFiles('**/*.yaml');
        const yamlFilesWithBody = await Promise.all(yamlFiles.map(async file => {
            try {
                return {
                    file,
                    body: yaml.load((await fs.readFile(file.fsPath)).toString('utf8'), { filename: file.fsPath }) as any
                };
            } catch(err) {
                this.logger.error(`Unable to load YAML file ${file} due to parsing error: ${err.message || err}`);
            }
        }));

        // remote any non-job files
        this.logger.info(`Found ${yamlFilesWithBody.length} YAML files in workspace folders`);
        const validJobFiles = filterUndefined(yamlFilesWithBody).filter(file => this.isValidJob(file.body));
        this.logger.info(`Displaying ${validJobFiles.length} valid Job files in Job explorer`);

        return validJobFiles.map(({ file }) => new JobNode( file ));
    }
}

class JobNode {
    constructor(
        public readonly jobFile: vscode.Uri
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
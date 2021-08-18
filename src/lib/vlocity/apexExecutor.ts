import * as path from 'path';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';

import SalesforceService from 'lib/salesforce/salesforceService';
import { LogManager, Logger } from '@vlocode/core';
import { cache } from '@vlocode/util';
import { injectable } from '@vlocode/core';

@injectable()
export class ApexExecutor {

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger = LogManager.get(ApexExecutor)) {
    }

    public async execute(name: string) {
        const file = await this.resolveApexFile(name);
        const apex = await this.loadApex(file);

        const result = await this.salesforceService.executeAnonymous(apex);
        if (!result.compiled) {
            this.logger.error(`Unable to compile Anonymous APEX: ${result.compileProblem}`);
        } else if (!result.success) {
            this.logger.error(`Error during Anonymous APEX exection: ${result.exceptionMessage}`);
        }

        return !!result.success;
    }

    private async loadApex(file: string) {
        const basePath = path.dirname(file);
        let code = (await fs.readFile(file)).toString();

        // Resolve includes
        const includes = code.matchAll(/(\/\/|#)[ \t]*include (.*)$/i);
        for (const [ match, include ] of includes) {
            const includeFile = await this.resolveApexFile(include.trim(), basePath);
            const includeApex = await this.loadApex(includeFile);
            code = code.replace(match, includeApex);
        }

        return code;
    }

    @cache(-1)
    private async resolveApexFile(name: string, relativeFolder = '.') {
        const resolutionOrder = [
            path.join(relativeFolder, name),
            path.join(__dirname, name),
            path.join(__dirname, 'apex', name),
        ];

        for (const candidate of resolutionOrder) {
            if (fs.pathExistsSync(candidate)) {
                return candidate;
            }
        }

        const workspaceResult = await this.resolveApexFileFromWorkspace(name);
        if (workspaceResult) {
            return workspaceResult;
        }

        throw new Error(`Unable to resolve APEX file ${name}`);
    }

    private async resolveApexFileFromWorkspace(name: string) {
        const result = await vscode.workspace.findFiles(name, undefined, 1);
        return result.map(uri => uri.fsPath).pop();
    }
}
import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import VlocityDatapackService, { ManifestEntry } from '@lib/vlocity/vlocityDatapackService';
import { CommandBase } from '@root/lib/commandBase';
import { mapAsyncParallel } from '@vlocode/util';
import { getDatapackHeaders, getDatapackManifestKey, VlocityDatapack } from '@vlocode/vlocity-deploy';
import { SalesforceService } from '@vlocode/salesforce';

export abstract class DatapackCommand extends CommandBase {

    protected get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
    }

    protected get salesforce() : SalesforceService {
        return this.vlocode.salesforceService;
    }

    public async validate() : Promise<void> {
        const validationMessage = this.vlocode.validateWorkspaceFolder() ||
                                  await this.vlocode.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    protected async getDatapackHeaders(files: vscode.Uri[]) : Promise<vscode.Uri[]> {
        const headerFiles = await Promise.all(files.map(async fileUri => {
            const fileStat = await fs.lstat(fileUri.fsPath);
            return getDatapackHeaders(fileUri.fsPath, fileStat.isDirectory());
        }));
        return headerFiles.flat().map(header => vscode.Uri.file(header));
    }

    protected resolveManifestEntriesForFiles(files: vscode.Uri[]) : Promise<ManifestEntry[]> {
        return this.getDatapackHeaders(files).then(headerFiles =>
            Promise.all(headerFiles.map(header => getDatapackManifestKey(header.fsPath)))
        );
    }

    protected async loadDatapacks(files: vscode.Uri[], onProgress?: (loadedFile: vscode.Uri, progress?: number) => void) : Promise<VlocityDatapack[]> {
        let progressCounter = 0;
        const headerFiles = await this.getDatapackHeaders(files);
        return mapAsyncParallel(headerFiles, header => {
            if (onProgress) {
                onProgress(header, ++progressCounter / headerFiles.length);
            }
            return this.datapackService.loadDatapack(header);
        }, 4);
    }
}
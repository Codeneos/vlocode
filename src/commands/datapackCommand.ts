import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import VlocityDatapackService from 'services/vlocityDatapackService';
import { CommandBase } from "commands/commandBase";
import { mapAsync, mapAsyncParallel } from '../util';
import { ManifestEntry } from 'services/vlocityDatapackService';
import { VlocityDatapack } from 'models/datapack';
import { getDatapackHeaders, getDatapackManifestKey } from 'datapackUtil';

export abstract class DatapackCommand extends CommandBase {

    protected get datapackService() : VlocityDatapackService {
        return this.vloService.datapackService;
    }

    public async validate() : Promise<void> {
        const validationMessage = this.vloService.validateWorkspaceFolder() ||
                                  await this.vloService.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    protected async getDatapackHeaders(files: vscode.Uri[]) : Promise<vscode.Uri[]> {
        const headerFiles = await Promise.all(files.map(async (fileUri) => {
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
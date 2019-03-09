import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import VlocityDatapackService, * as vds from 'services/vlocityDatapackService';
import { CommandBase } from "commands/commandBase";
import { unique } from '../util';
import { ManifestEntry } from 'services/vlocityDatapackService';
import { VlocityDatapack } from 'models/datapack';
import { getDatapackHeaders, getDatapackManifestKey } from 'datapackUtil';

export abstract class DatapackCommand extends CommandBase {

    protected get datapackService() : VlocityDatapackService {
        return this.vloService.datapackService;
    }

    public async validate() : Promise<void> {
        const validaionMessage = this.vloService.validateWorkspaceFolder() ||
                                 await this.vloService.validateSalesforceConnectivity();
        if (validaionMessage) {
            throw validaionMessage;
        }
    }

    protected async getDatapackHeaders(files: vscode.Uri[], reportErrors: boolean = true) : Promise<vscode.Uri[]> {
        const headerFiles = await getDatapackHeaders(...files.map(f => f.fsPath));
        return headerFiles.map(header => vscode.Uri.file(header));
    }

    protected resolveManifestEntriesForFiles(files: vscode.Uri[]) : Promise<ManifestEntry[]> {
        return this.getDatapackHeaders(files).then(headerFiles => 
            Promise.all(headerFiles.map(header => getDatapackManifestKey(header.fsPath)))
        );
    }

    protected loadDatapacks(files: vscode.Uri[]) : Promise<VlocityDatapack[]> {
        return this.getDatapackHeaders(files).then(headerFiles => 
            Promise.all(headerFiles.map(header => this.datapackService.loadDatapack(header)))
        );
    }
}
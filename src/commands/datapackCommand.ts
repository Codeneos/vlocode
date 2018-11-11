import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import VlocityDatapackService, * as vds from 'services/vlocityDatapackService';
import { CommandBase } from "commands/commandBase";
import { unique } from '../util';
import { ManifestEntry } from 'services/vlocityDatapackService';
import { VlocityDatapack } from 'models/datapack';

export abstract class DatapackCommand extends CommandBase {

    protected get datapackService() : VlocityDatapackService {
        return this.vloService.datapackService;
    }

    protected async resolveDatapackHeaders(files: vscode.Uri[], reportErrors: boolean = true) : Promise<vscode.Uri[]> {
        const results = await Promise.all(files.map(async (file) => {
            return {
                file: file,
                header: await this.datapackService.resolveDatapackHeader(file)
            };
        }));

        // report any unresolved files back to the UI when not running in silent mode
        if (reportErrors) {
            let unresolvedFiles = results.filter(v => !v.header);
            if (unresolvedFiles.length > 0) {
                let errorMessageText = `${unresolvedFiles.length} of the selected files ${unresolvedFiles.length === 1 ? 'is' : 'are'} not part of a Vlocity datapack. \nSee the log for details.`;
                vscode.window.showWarningMessage(errorMessageText, { title: 'View log...' }).then(o => o && this.vloService.focusLog());
                unresolvedFiles.forEach(f => this.logger.warn(`Unabled to resolve datapack header for: ${f.file.fsPath}`));
            }
        }

        // only return unqiue data packs
        return unique(results.filter(v => !!v.header), v => v.header.fsPath).map(v => v.header);
    }

    protected resolveManifestEntriesForFiles(files: vscode.Uri[]) : Promise<ManifestEntry[]> {
        return this.resolveDatapackHeaders(files).then(h => 
            Promise.all(h.map(h => this.datapackService.getDatapackManifestKey(h)))
        );
    }

    protected resolveDatapacksForFiles(files: vscode.Uri[]) : Promise<VlocityDatapack[]> {
        return this.resolveDatapackHeaders(files).then(h => 
            Promise.all(h.map(h => this.datapackService.loadDatapackFromFile(h)))
        );
    }
}
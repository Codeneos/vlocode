import * as vscode from 'vscode';

import VlocodeService from '../services/vlocodeService';
import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import * as s from '../singleton';
import { isError } from 'util';
import * as path from 'path';
import { Command } from "./command";
import { fstatAsync, readdirAsync, unique } from '../util';

export abstract class DatapackCommand extends Command {

    protected get datapackService() : VlocityDatapackService {
        return s.get(VlocodeService).datapackService;
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
                vscode.window.showWarningMessage(errorMessageText, { title: 'View log...' }).then(o => o && s.get(VlocodeService).focusLog());
                unresolvedFiles.forEach(f => this.logger.warn(`Unabled to resolve datapack header for: ${f.file.fsPath}`));
            }
        }

        // only return unqiue data packs
        return unique(results.filter(v => !!v.header), v => v.header.fsPath).map(v => v.header);
    }

    protected resolveManifestEntriesForFiles(files: vscode.Uri[]) : Promise<vds.ManifestEntry[]> {
        return this.resolveDatapackHeaders(files).then(h => 
            Promise.all(h.map(h => this.datapackService.getDatapackManifestKey(h)))
        );
    }

    protected resolveDatapacksForFiles(files: vscode.Uri[]) : Promise<vds.VlocityDatapack[]> {
        return this.resolveDatapackHeaders(files).then(h => 
            Promise.all(h.map(h => this.datapackService.loadDatapackFromFile(h)))
        );
    }
}
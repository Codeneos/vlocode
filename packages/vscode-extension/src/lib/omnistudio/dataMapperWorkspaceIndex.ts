import * as vscode from 'vscode';
import path from 'path';

import { injectable } from '@vlocode/core';

@injectable()
export class DataMapperWorkspaceIndex {
    public async names(): Promise<string[]> {
        const files = await Promise.all([
            vscode.workspace.findFiles('**/omniDataTransforms/*.rpt-meta.xml', '**/{node_modules,.git}/**'),
            vscode.workspace.findFiles('**/{DataRaptor,OmniDataTransform}/*/*_DataPack.json', '**/{node_modules,.git}/**')
        ]);
        const names = new Set<string>();
        for (const uri of files.flat()) {
            const name = this.nameFromPath(uri.fsPath);
            if (name) {
                names.add(name);
            }
        }
        return [...names].sort((a, b) => a.localeCompare(b));
    }

    private nameFromPath(fileName: string): string | undefined {
        const baseName = path.basename(fileName);
        if (/\.rpt-meta\.xml$/i.test(baseName)) {
            return this.normalizeName(baseName.replace(/\.rpt-meta\.xml$/i, ''));
        }
        if (/_DataPack\.json$/i.test(baseName)) {
            return this.normalizeName(baseName.replace(/_DataPack\.json$/i, '') || path.basename(path.dirname(fileName)));
        }
    }

    private normalizeName(name: string): string {
        return name.replace(/_\d+$/i, '');
    }
}

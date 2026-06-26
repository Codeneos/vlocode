import * as vscode from 'vscode';
import path from 'path';

import { injectable } from '@vlocode/core';

@injectable()
export class DataMapperWorkspaceIndex {
    public async names(): Promise<string[]> {
        const files = await this.files();
        const names = new Set<string>();
        for (const uri of files) {
            const name = this.nameFromPath(uri.fsPath);
            if (name) {
                names.add(name);
            }
        }
        return [...names].sort((a, b) => a.localeCompare(b));
    }

    public async uriForName(name: string): Promise<vscode.Uri | undefined> {
        const candidateNames = new Set(this.referenceNames(name));
        if (!candidateNames.size) {
            return undefined;
        }
        const matches = (await this.files())
            .filter(uri => candidateNames.has(this.nameFromPath(uri.fsPath)?.toLowerCase() ?? ''))
            .sort((a, b) => a.fsPath.localeCompare(b.fsPath));
        return matches[0];
    }

    private async files(): Promise<vscode.Uri[]> {
        const files = await Promise.all([
            vscode.workspace.findFiles('**/omniDataTransforms/*.rpt-meta.xml', '**/{node_modules,.git}/**'),
            vscode.workspace.findFiles('**/{DataRaptor,OmniDataTransform}/*/*_DataPack.json', '**/{node_modules,.git}/**')
        ]);
        return files.flat();
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

    private referenceNames(name: string): string[] {
        const normalizedName = this.normalizeName(name.trim());
        const withoutNamespace = normalizedName.replace(/^%vlocity_namespace%__/i, '').replace(/^[A-Za-z]\w*__(?=.)/, '');
        return [...new Set([normalizedName, withoutNamespace].filter(Boolean).map(value => value.toLowerCase()))];
    }
}

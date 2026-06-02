import * as vscode from 'vscode';
import path from 'path';
import escapeStringRegexp from 'escape-string-regexp';

import { injectable } from '@vlocode/core';

interface ApexClassDeclaration {
    extendsName?: string;
    interfaceNames: string[];
    name: string;
}

@injectable()
export class ApexWorkspaceIndex {
    public async remoteActionClassNames(): Promise<string[]> {
        const files = await vscode.workspace.findFiles('**/classes/**/*.cls', '**/{node_modules,.git}/**');
        const declarations = (await Promise.all(files.map(uri => this.classDeclaration(uri))))
            .filter((declaration): declaration is ApexClassDeclaration => declaration !== undefined);
        const declarationsByName = new Map(declarations.map(declaration => [this.typeName(declaration.name), declaration]));
        return declarations
            .filter(declaration => this.isRemoteActionClass(declaration, declarationsByName))
            .map(declaration => declaration.name)
            .sort((a, b) => a.localeCompare(b));
    }

    private async classDeclaration(uri: vscode.Uri): Promise<ApexClassDeclaration | undefined> {
        const className = path.basename(uri.fsPath, '.cls');
        const source = this.stripComments(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8'));
        const declaration = new RegExp(`\\bclass\\s+${escapeStringRegexp(className)}\\b([\\s\\S]*?)\\{`, 'i').exec(source)?.[1];
        if (!declaration) {
            return undefined;
        }
        return {
            name: className,
            extendsName: declaration.match(/\bextends\s+([A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*)?)/i)?.[1]?.replace(/\s+/g, ''),
            interfaceNames: declaration.match(/\bimplements\b([\s\S]*)$/i)?.[1]?.split(',').map(reference => reference.trim()).filter(Boolean) ?? []
        };
    }

    private isRemoteActionClass(
        declaration: ApexClassDeclaration,
        declarationsByName: ReadonlyMap<string, ApexClassDeclaration>,
        visited = new Set<string>()
    ): boolean {
        const name = this.typeName(declaration.name);
        if (visited.has(name)) {
            return false;
        }
        visited.add(name);
        if (declaration.interfaceNames.some(reference => this.isRemoteActionInterface(reference))) {
            return true;
        }
        const parent = declaration.extendsName && declarationsByName.get(this.typeName(declaration.extendsName));
        return parent ? this.isRemoteActionClass(parent, declarationsByName, visited) : false;
    }

    private isRemoteActionInterface(reference: string): boolean {
        const name = this.typeName(reference);
        return name === 'callable' || name === 'vlocityopeninterface';
    }

    private typeName(reference: string): string {
        return reference.trim().replace(/\s+/g, '').split('.').pop()?.toLowerCase() ?? '';
    }

    private stripComments(source: string): string {
        return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    }
}

import path from 'path';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';

import { container } from '@vlocode/core';
import { DatapackLoader, getDatapackHeaders, VlocityDatapack, type VlocityDatapackSObject } from '@vlocode/vlocity';
import { DatapackExpander, DatapackExportDefinitionStore, MetadataConverter } from '@vlocode/vlocity-deploy';
import { normalizeName, pluralize } from '@vlocode/util';

import { VlocodeCommand } from '../../constants';
import { CommandBase } from '../../lib/commandBase';
import { vscodeCommand } from '../../lib/commandRouter';

interface ConversionResult {
    status: 'converted' | 'failed';
    from: string;
    to: string;
}

@vscodeCommand(VlocodeCommand.convertOmniStudioMetadata)
export default class ConvertOmniStudioMetadataCommand extends CommandBase {

    protected outputChannelName = 'Vlocity Datapacks';

    private readonly metadataConverter = container.get(MetadataConverter);
    private readonly datapackLoader = container.get(DatapackLoader);

    public async validate(): Promise<void> {
        const validationMessage = this.vlocode.validateWorkspaceFolder();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    public async execute(...args: any[]): Promise<void> {
        const selectedFiles = this.resolveSelectedFiles(args);
        if (!selectedFiles.length) {
            vscode.window.showWarningMessage('Select an OmniDataTransform, Integration Procedure metadata file, or datapack to convert.');
            return;
        }

        const results = await this.vlocode.withProgress('Converting OmniStudio metadata/datapacks', async progress => {
            const files = await this.resolveConversionFiles(selectedFiles);
            const results: ConversionResult[] = [];
            for (let i = 0; i < files.length; i++) {
                progress.report({ message: path.basename(files[i].fsPath), progress: i + 1, total: files.length });
                results.push(await this.convertFile(files[i]));
            }
            return results;
        });

        const converted = results.filter(result => result.status === 'converted');
        const failed = results.filter(result => result.status === 'failed');
        if (converted[0]?.to) {
            await vscode.window.showTextDocument(vscode.Uri.file(converted[0].to), { preview: false });
        }

        if (failed.length) {
            vscode.window.showWarningMessage(`Converted ${pluralize('file', converted)}, failed ${pluralize('file', failed)}.`);
        } else {
            vscode.window.showInformationMessage(`Converted ${pluralize('file', converted)}.`);
        }
        this.output.table(results, { focus: failed.length > 0 });
    }

    private resolveSelectedFiles(args: any[]): vscode.Uri[] {
        const selected = args[1] ?? args[0] ?? this.currentOpenDocument;
        return Array.isArray(selected) ? selected : selected ? [selected] : [];
    }

    private async resolveConversionFiles(files: vscode.Uri[]): Promise<vscode.Uri[]> {
        const metadataFiles = files.filter(file => this.isMetadataXml(file.fsPath));
        const datapackFiles = files.filter(file => !this.isMetadataXml(file.fsPath));
        if (!datapackFiles.length) {
            return metadataFiles;
        }

        const datapackHeaders = await Promise.all(datapackFiles.map(async file => {
            const stat = await fs.lstat(file.fsPath);
            return getDatapackHeaders(file.fsPath, stat.isDirectory());
        }));
        return [
            ...metadataFiles,
            ...[...new Set(datapackHeaders.flat())].map(header => vscode.Uri.file(header))
        ];
    }

    private async convertFile(file: vscode.Uri): Promise<ConversionResult> {
        try {
            if (this.isMetadataXml(file.fsPath)) {
                return await this.convertMetadataToDatapack(file);
            }
            return await this.convertDatapackToMetadata(file);
        } catch (error: any) {
            return {
                status: 'failed',
                from: file.fsPath,
                to: error?.message ?? String(error)
            };
        }
    }

    private async convertMetadataToDatapack(file: vscode.Uri): Promise<ConversionResult> {
        const xml = await this.vlocode.readWorkspaceFile(file);
        const datapack = this.metadataConverter.metadataXmlToDatapack(file.fsPath, xml);
        this.assertSupportedDatapack(datapack);

        const outputRoot = this.getWorkspaceRoot(file) ?? path.dirname(file.fsPath);
        const expander = container.get(DatapackExpander);
        const scope = container.get(DatapackExportDefinitionStore).getAvailableScopes(datapack)[0];
        const expanded = expander.expandDatapack(this.getRootSObject(datapack), { datapackType: datapack.datapackType, scope });
        const files = await expanded.writeToFilesystem(outputRoot);
        const header = files.find(outputFile => /_DataPack\.json$/i.test(outputFile)) ?? files[0];

        return {
            status: 'converted',
            from: file.fsPath,
            to: header
        };
    }

    private async convertDatapackToMetadata(file: vscode.Uri): Promise<ConversionResult> {
        const datapack = await this.datapackLoader.loadDatapack(file.fsPath);
        this.assertSupportedDatapack(datapack);

        const xml = this.metadataConverter.datapackToMetadataXml(datapack);
        const outputFile = await this.getMetadataOutputFile(file, datapack);
        await fs.outputFile(outputFile, xml.endsWith('\n') ? xml : `${xml}\n`);

        return {
            status: 'converted',
            from: file.fsPath,
            to: outputFile
        };
    }

    private async getMetadataOutputFile(source: vscode.Uri, datapack: VlocityDatapack): Promise<string> {
        const metadataRoot = await this.getMetadataRoot(source);
        const target = this.getMetadataTarget(datapack);
        return path.join(metadataRoot, target.folder, `${this.getMetadataFileName(datapack)}.${target.extension}`);
    }

    private async getMetadataRoot(source: vscode.Uri): Promise<string> {
        const workspaceRoot = this.getWorkspaceRoot(source);
        if (!workspaceRoot) {
            return path.dirname(source.fsPath);
        }

        const defaultSourceRoot = path.join(workspaceRoot, 'force-app', 'main', 'default');
        if (await fs.pathExists(defaultSourceRoot)) {
            return defaultSourceRoot;
        }
        return workspaceRoot;
    }

    private getWorkspaceRoot(file: vscode.Uri): string | undefined {
        return vscode.workspace.getWorkspaceFolder(file)?.uri.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }

    private getMetadataTarget(datapack: VlocityDatapack): { folder: string; extension: string } {
        if (datapack.sobjectType === 'OmniDataTransform') {
            return { folder: 'omniDataTransforms', extension: 'rpt-meta.xml' };
        }
        if (this.isIntegrationProcedure(datapack)) {
            return { folder: 'omniIntegrationProcedures', extension: 'ip-meta.xml' };
        }
        throw new Error(`Unsupported datapack metadata conversion for ${datapack.sobjectType}`);
    }

    private getMetadataFileName(datapack: VlocityDatapack): string {
        const fallback = [datapack.data.Type, datapack.data.SubType, datapack.data.Language].filter(Boolean).join('_');
        return normalizeName(String(datapack.name || fallback || 'OmniStudioMetadata'));
    }

    private assertSupportedDatapack(datapack: VlocityDatapack): void {
        if (datapack.sobjectType === 'OmniDataTransform' || this.isIntegrationProcedure(datapack)) {
            return;
        }
        throw new Error(`Only OmniDataTransform and Integration Procedure datapacks are supported; got ${datapack.sobjectType}`);
    }

    private getRootSObject(datapack: VlocityDatapack): VlocityDatapackSObject {
        const data = datapack.data;
        if (
            data.VlocityDataPackType !== 'SObject' ||
            typeof data.VlocityRecordSObjectType !== 'string' ||
            typeof data.VlocityRecordSourceKey !== 'string'
        ) {
            throw new Error(`Converted ${datapack.datapackType} metadata did not produce a valid datapack root record.`);
        }
        return data as VlocityDatapackSObject;
    }

    private isIntegrationProcedure(datapack: VlocityDatapack): boolean {
        return datapack.sobjectType === 'OmniProcess' &&
            (datapack.data.IsIntegrationProcedure === true || datapack.data.OmniProcessType === 'Integration Procedure');
    }

    private isMetadataXml(fileName: string): boolean {
        return /\.(rpt|ip)-meta\.xml$/i.test(fileName);
    }
}

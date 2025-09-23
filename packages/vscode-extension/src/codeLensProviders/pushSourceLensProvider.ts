import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, injectable } from '@vlocode/core';
import { VlocodeCommand } from '../constants';
import { ApexSourceStatus } from 'lib/salesforce/apexSourceStatus';


@injectable()
/**
 * Provides CodeLens actions for Apex class files in VSCode, enabling users to quickly identify and synchronize
 * local source files with their corresponding Salesforce org versions. Displays context-aware actions such as
 * "Push to Org" or "Source in-sync" based on CRC comparison between the local file and the org version.
 *
 * Registers itself as a CodeLens provider for Apex class files (`*.cls`) and documents with the `apex` language.
 * Utilizes a regular expression to extract the class name from the document and checks for synchronization
 * status using CRC32 checksums.
 *
 * @remarks
 * - Integrates with the VlocodeService and SalesforceService to fetch org metadata and perform deployments.
 * - Uses a cache decorator to optimize repeated org metadata lookups.
 * - Intended for use within the Vlocode VSCode extension.
 *
 * @example
 * PushSourceLensProvider.register(vlocodeServiceInstance);
 */
export class PushSourceLensProvider implements vscode.CodeLensProvider<PushSourceCodeLens> {

    private readonly documentFilter : Array<vscode.DocumentFilter> = [
        { pattern: '**/*.{cls}' },
        { language: 'apex' }
    ];

    private get sourceStatus() {
        return container.get(ApexSourceStatus);
    }

    constructor(private readonly vlocode: VlocodeService) {
    }

    public static register(service: VlocodeService) {
        const lens = container.get(PushSourceLensProvider);
        service.registerDisposable(
            vscode.languages.registerCodeLensProvider(lens.documentFilter, lens)
        );
    }

    public async isSynced(document: vscode.TextDocument) {
        return (await this.sourceStatus.classStatus(document)) === 'synced';
    }

    public provideCodeLenses(document: vscode.TextDocument) {
        const details = this.sourceStatus.classNameFromDocument(document);
        if (!details) {
            return;
        }
        return [
            new PushSourceCodeLens(details.range, details.className, VlocodeCommand.diffMetadata, document),
            new PushSourceCodeLens(details.range, details.className, VlocodeCommand.deployMetadata, document)
        ];
    }

    public async resolveCodeLens(codeLens: PushSourceCodeLens) {
        if (!codeLens.document) {
            return undefined;
        }

        const isSynced = await this.isSynced(codeLens.document);

        if (codeLens.vloCommand === VlocodeCommand.diffMetadata) {
            return isSynced ? undefined : codeLens.resolve({
                title: 'Diff with Org',
                command: VlocodeCommand.diffMetadata,
                arguments: [codeLens.document.uri]
            });
        }

        if (codeLens.vloCommand === VlocodeCommand.deployMetadata) {
            return codeLens.resolve({
                title: isSynced ? 'Source in-sync' : 'Push to Org',
                command: VlocodeCommand.deployMetadata,
                arguments: [codeLens.document.uri]
            });
        }   
    }
}

class PushSourceCodeLens extends vscode.CodeLens {
    constructor(
        range: vscode.Range,
        public className: string,
        public vloCommand: VlocodeCommand,
        public document: vscode.TextDocument | undefined
    ) {
        super(range);
    }

    public resolve(command: vscode.Command) {
        this.command = command;
        this.document = undefined; 
        return this;
    }
}
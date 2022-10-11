import { EventHandlerBase } from '@events/eventHandlerBase';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { getDocumentBodyAsString, XML } from '@vlocode/util';

export default class extends EventHandlerBase<vscode.Uri> {

    public get enabled() : boolean {
        const manageMetadata = this.vloService.config?.salesforce?.enabled && this.vloService.config.salesforce.manageMetaXmlFiles;
        const orgSelected = !!this.vloService.config?.sfdxUsername;
        return !!manageMetadata && orgSelected;
    }

    protected async handleEvent(document: vscode.Uri): Promise<void> {
        if (!this.enabled) {
            return;
        }

        // Auto create the metadata file
        await this.createMetadataFileFor(document);

        // Is the file empty?
        const documentBody = (await getDocumentBodyAsString(document.fsPath)).trim();
        if (documentBody) {
            // File not empty skip creation
            return;
        }

        // Update file body?
        const triggerName = path.basename(document.path, '.trigger');
        const triggerBody = `trigger ${triggerName} on SObject (after insert) {\n\n\n}`;
        await fs.writeFile(document.fsPath, triggerBody);
    }

    protected async createMetadataFileFor(document: vscode.Uri): Promise<void> {
        const metaXml = XML.stringify({
            ApexTrigger: {
                $: { xmlns : 'http://soap.sforce.com/2006/04/metadata' },
                status: 'Active',
                apiVersion: this.vloService.config.salesforce?.apiVersion
            }
        }, 4);

        try {
            await fs.writeFile(`${document.fsPath}-meta.xml`, metaXml, { flag: 'wx' });
        } catch(e) {
            // Ignore error; this fails if the meta file already exists
        }
    }
}

import * as path from 'path';
import { EventHandlerBase } from '@events/eventHandlerBase';
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
        const className = path.basename(document.path, '.cls');
        const classBody = this.getClassBody(className);
        await fs.writeFile(document.fsPath, classBody);
    }

    protected getClassBody(className: string) : string {
        if (/^I[A-Z]{1}/.test(className)) {
            return `public interface ${className} {\n\n\n}`;
        }
        if (/Test$/i.test(className)) {
            return `@isTest\nclass ${className} {\n\n    @isTest\n    static void test() {\n    }\n}`;
        }
        return `public class ${className} {\n\n\n}`;
    }

    protected async createMetadataFileFor(document: vscode.Uri): Promise<void> {
        const metaXml = XML.stringify({
            ApexClass: {
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

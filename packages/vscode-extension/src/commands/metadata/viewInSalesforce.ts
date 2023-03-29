
import * as vscode from 'vscode';
import * as open from 'open';
import MetadataCommand from './metadataCommand';
import { MetadataType } from '@vlocode/salesforce';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

@vscodeCommand(VlocodeCommand.viewInSalesforce)
export default class ViewInSalesforceCommand extends MetadataCommand {

    public async execute(args) {
        return this.openFileInSalesforce(args[0] || this.currentOpenDocument);
    }

    /* eslint-disable no-template-curly-in-string */
    protected getUrlFormat(metadataType: MetadataType) {
        if (metadataType.xmlName == 'CustomObject') {
            return '/lightning/setup/ObjectManager/page?address=/${Id}';
        }
        return '/lightning/setup/one/page?address=/${Id}';
    }

    protected async openFileInSalesforce(selectedFile: vscode.Uri) {
        const setupUrl = await this.salesforce.getMetadataSetupUrl(selectedFile.fsPath);
        if (!setupUrl) {
            throw `The selected file (${selectedFile.fsPath}) is not a known Salesforce metadata type`;
        }

        this.logger.info(`Opening URL: ${setupUrl}`);
        void open(await this.vlocode.salesforceService.getPageUrl(setupUrl, { useFrontdoor: true }));
    }
}
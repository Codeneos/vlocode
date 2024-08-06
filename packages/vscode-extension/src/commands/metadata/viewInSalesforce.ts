
import * as vscode from 'vscode';
import open from 'open';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

@vscodeCommand(VlocodeCommand.viewInSalesforce)
export default class ViewInSalesforceCommand extends MetadataCommand {

    public async execute(...args: any[]) {
        return this.openFileInSalesforce(args[0] || this.currentOpenDocument);
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
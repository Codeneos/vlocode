
import * as vscode from 'vscode';
import { formatString } from 'lib/util/string';
import * as open from 'open';
import { MetadataType } from 'lib/salesforce/metadataRegistry';
import MetadataCommand from './metadataCommand';

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
        const metadataInfo = await this.salesforce.getMetadataInfo(selectedFile);
        if (!metadataInfo) {
            throw 'The selected file is not a known Salesforce metadata component';
        }

        const metadataType = this.salesforce.getMetadataType(metadataInfo?.componentType)!;
        const objectData = await this.salesforce.describeComponent(metadataInfo?.componentType, metadataInfo?.fullName);
        const urlFormat = this.getUrlFormat(metadataType);
        if (!urlFormat || !metadataInfo) {
            throw 'Cannot open the specified file in Salesforce; url format not defined.';
        }

        const salesforcePath = formatString(urlFormat, {...metadataInfo, ...objectData});
        this.logger.info(`Opening URL: ${salesforcePath}`);
        void open(await this.vlocode.salesforceService.getPageUrl(salesforcePath, { useFrontdoor: true }));
    }
}
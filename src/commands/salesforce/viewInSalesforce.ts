import * as vscode from 'vscode';
import { evalExpr, formatString } from 'lib/util/string';
import * as open from 'open';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import MetadataCommand from './metadataCommand';

export default class ViewInSalesforceCommand extends MetadataCommand {

    private readonly urlFormats = [
        { filePattern: /\.page$/i, type: 'ApexPage', url: '/apex/${Name}' },
        { filePattern: /\.object$/i, url: '/lightning/setup/ObjectManager/${Name}/Details/view' },
        { filePattern: /\.layout$/i, url: '/lightning/setup/ObjectManager/${object}/PageLayouts/${id}/view' }
    ];

    public async execute(args) {
        return this.openFileInSalesforce(args[0] || this.currentOpenDocument);
    }

    protected getUrlFormat(selectedFile: vscode.Uri) {
        for (const format of this.urlFormats) {
            if (format.filePattern.test(selectedFile.fsPath)) {
                return format.url;
            }
        }
        return '/${Id}';
    }

    protected async openFileInSalesforce(selectedFile: vscode.Uri) {
        const metadataInfo = await this.salesforce.getMetadataInfo(selectedFile);
        if (!metadataInfo) {
            throw 'The selected file is not a known Salesforce metadata component';
        }

        const objectData = await this.salesforce.describeComponent(metadataInfo?.componentType, metadataInfo?.fullName);
        const urlFormat = this.getUrlFormat(selectedFile);
        if (!urlFormat || !metadataInfo) {
            throw 'Cannot open the specified file in Salesforce; url format not defined.';
        }

        const salesforcePath = formatString(urlFormat, {...metadataInfo, ...objectData});
        this.logger.info(`Opening URL: ${salesforcePath}`);
        open(await this.vlocode.salesforceService.getPageUrl(salesforcePath, { useFrontdoor: true }));
    }
}
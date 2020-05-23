import * as vscode from 'vscode';
import { evalExpr } from 'lib/util/string';
import MetadataCommand from './metadataCommand';

export default class ViewInSalesforceCommand extends MetadataCommand {

    private readonly urlFormats = [
        { filePattern: /\.page$/i, type: 'ApexPage', url: '{instanceUrl}/apex/{name}' },
        { filePattern: /\.object$/i, url: '{instanceUrl}/lightning/setup/ObjectManager/{name}/Details/view' }
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
        return null;
    }

    protected async openFileInSalesforce(selectedFile: vscode.Uri) {
        // Resolve datapack        
        const manifestFileInfo = Object.values((await this.salesforce.deploy.buildManifest([selectedFile])).files).shift();
        const urlFormat = this.getUrlFormat(selectedFile);
        if (!urlFormat || !manifestFileInfo) {
            throw 'Cannot open the specified file in Salesforce; url format not defined.';
        }

        const connection = await this.salesforce.getJsForceConnection();
        const salesforcePath = evalExpr(urlFormat, {
            instanceUrl: connection.instanceUrl,
            name: manifestFileInfo.name,
            type: manifestFileInfo.type
        });

        const url = await this.vlocode.salesforceService.getPageUrl(salesforcePath, { useFrontdoor: true });
        this.logger.info(`Opening URL: ${salesforcePath}`);
        void vscode.env.openExternal(vscode.Uri.parse(url));
    }
}
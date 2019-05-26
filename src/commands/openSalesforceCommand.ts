import * as vscode from 'vscode';

import { DatapackCommand } from './datapackCommand';
import SalesforceService from 'services/salesforceService';
import { isString } from 'util';
import * as childProcess from 'child_process';
import { evalExpr } from '../util';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { ObjectEntry } from 'services/vlocityDatapackService';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';

export default class OpenSalesforceCommand extends DatapackCommand {

    private readonly namespaceResolver = {
        'vlocity': () => this.datapackService.vlocityNamespace
    };

    constructor(name : string) {
        super(name, args => this.openInSalesforce(args[0] || this.currentOpenDocument));
    }

    protected async openInSalesforce(input: vscode.Uri | ObjectEntry) {     
        if (input instanceof vscode.Uri){
            return this.openFileInSalesforce(input);
        }
        return this.openObjectInSalesforce(input);
    }

    protected async openFileInSalesforce(selectedFile: vscode.Uri) {     
        // Resolve datapack
        const datapack = (await this.loadDatapacks([ selectedFile ])).pop();
        if (!datapack) {
            throw new Error(`${selectedFile.fsPath} not part of datapack`);
        }
        
        const salesforceId = (await this.datapackService.getSalesforceIds([ datapack ])).pop();        
        return this.openIdInSalesforce(salesforceId, datapack.datapackType);
    }

    protected async openObjectInSalesforce(obj: ObjectEntry) {  
        const salesforceId = obj.id || (await this.datapackService.getSalesforceIds([ obj ])).pop();        
        return this.openIdInSalesforce(salesforceId, obj.datapackType);
    }

    protected async openIdInSalesforce(objectId: string, datapackType: string) {    
        // Build URL
        const queryDefinitions = await this.datapackService.getQueryDefinitions();
        let salesforceUrl = queryDefinitions[datapackType].salesforceUrl || `'${objectId}'`;
        salesforceUrl = isString(salesforceUrl) ? { path: salesforceUrl } : salesforceUrl;

        const namespace = this.resolveNamespace(salesforceUrl.namespace);
        const salesforcePath = evalExpr(salesforceUrl.path, { id: objectId, type: datapackType, namespace: namespace });

        const url = await this.vloService.salesforceService.getPageUrl(salesforcePath);
        this.logger.info(`Opening URL: ${salesforcePath}`);
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    protected resolveNamespace(namespace: string) : string | undefined {
        if (namespace && this.namespaceResolver[namespace.toLowerCase()]) {
            return this.namespaceResolver[namespace.toLowerCase()]();
        } else if(namespace) {
            return namespace;
        }
    }
}
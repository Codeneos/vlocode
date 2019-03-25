import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import VlocityDatapackService, * as vds from 'services/vlocityDatapackService';
import { CommandBase } from "commands/commandBase";
import { unique } from '../util';
import { ManifestEntry } from 'services/vlocityDatapackService';
import { VlocityDatapack } from 'models/datapack';
import { getDatapackHeaders, getDatapackManifestKey } from 'datapackUtil';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';

export default class AnonApexCommand extends CommandBase {

    constructor(name : string, private anonApex : string) {
        super(name);        
    }

    protected get datapackService() : VlocityDatapackService {
        return this.vloService.datapackService;
    }

    protected get connectionProvider() : JsForceConnectionProvider {
        return this.vloService.datapackService;
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    public async execute(... args: any[]) : Promise<void> {
        console.debug('lala');
        let progress = await this.startProgress(`Running ${name}...`);
        try {
            let connection = await this.connectionProvider.getJsForceConnection();
            let result = await connection.tooling.executeAnonymous(this.anonApex);
            if (!result.compiled) {
                throw new Error(`${result.compileProblem} at ${result.line}:${result.column}`);
            }
            if (!result.success) {
                throw new Error(`${result.exceptionMessage}\n${result.exceptionStackTrace}`);
            }
        } finally {
            progress.complete();
        }
    }
}

import * as vscode from 'vscode';

import VlocodeService from '../services/vlocodeService';
import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import * as s from '../singleton';
import { isError } from 'util';
import { Command } from "./command";

export abstract class DatapackCommand extends Command {

    protected get datapackService() : VlocityDatapackService {
        return s.get(VlocodeService).datapackService;
    }    

    protected async callCommandForFiles<T>(command : (objects: vds.ObjectEntry[]) => Promise<T>, files: vscode.Uri[]) : Promise<T> | undefined {
        let datapacks = await Promise.all(files.map(f => this.datapackService.readDatapackFile(f)));    
        let objectEntries = datapacks.map(dp => { 
            return <vds.ObjectEntry>{ 
                sobjectType: dp.sobjectType,
                globalKey: dp.globalKey,
                name: dp.name
            }
        });    
        try {
            return await command.call(this.datapackService, objectEntries);
        } catch (err) {
            if (isError(err)) {
                throw err;
            }
            return Promise.resolve(<T>err);
        }
    }
}
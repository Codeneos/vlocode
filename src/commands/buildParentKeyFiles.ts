import * as vscode from 'vscode';
import * as path from 'path';

import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel, mapAsync } from '../util';
import * as DatapackUtil from 'datapackUtil';
import { VlocityDatapack } from 'models/datapack';

export default class BuildParentKeyFilesCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.buildParentKeyFiles(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async buildParentKeyFiles(selectedFiles: vscode.Uri[]) : Promise<void> {

        // call
        const progressToken = await this.startProgress('Building parent keys');
        try {
            // load all datapacks in the workspace
            progressToken.report('reading workspace');
            const datapackHeaders = await DatapackUtil.getDatapackHeadersInWorkspace();
            const datapacks = await this.loadDatapacks(datapackHeaders, file => progressToken.report(`loaded ${path.basename(file.fsPath)}`));

            // create parent key to datapack map
            progressToken.report('resolving keys');
            const datapackProvidedKeyMap : { [key: string] : VlocityDatapack } = datapacks.reduce((keyMap, dp) => {
                return dp.getProvidedRecordKeys().reduce((keyMap, key) => Object.assign(keyMap, { [key]: dp }), keyMap);
            }, {});

            // resolve parent keys
            const parentKeyMap = datapacks.reduce((parentKeyMap, dp) => { 
                const parentKeys = dp.getParentRecordKeys();
                const resolvedKeys = parentKeys.map(parentKey => datapackProvidedKeyMap[parentKey]).filter(key => !!key);
                this.logger.info(`Resolved keys for ${dp.key} -> ${JSON.stringify(resolvedKeys.map(dp => dp.key))}`);
                return Object.assign(resolvedKeys, {
                    [dp.headerFile]: resolvedKeys.map(dp => dp.key)
                });
            }, {});

            /*const datapacks = await this.loadDatapacks(selectedFiles);
            await Promise.all(datapacks.map(async dp => {
                await Promise.all(dp.getParentRecordKeys().map(async key => {
                    let headerFile = await DatapackUtil.getDatapackHeaderByMatchingKey(key);
                    this.logger.info(`Resolved ${key} -> ${headerFile ? path.basename(headerFile) : '<UNRESOLVED>'}`);
                }));
            }));*/
            
        } finally {
            progressToken.complete();
        }
    }
}


import { LogManager, Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import Timer from 'lib/util/timer';
import * as jsforce from 'jsforce';
import chalk = require('chalk');
import { dependency } from 'lib/core/inject';
import * as constants from '@constants';

@dependency()
export class VlocityNamespaceService {

    constructor(
        private vlocityNamespace: string | null = null,
        private readonly logger: Logger = LogManager.get(VlocityNamespaceService) ) {
    }

    /**
     * Get the vlocity namespace for the specified 
     */
    public getNamespace() {
        return this.vlocityNamespace;
    }

    /**
     * Update the text replacing all namespace placeholders
     * @param name text to update
     */
    public updateNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        }
        return name.replace(constants.NAMESPACE_PLACEHOLDER, '').replace(/^__/, '');
    }

    public async initialize(connectionProvider: JsForceConnectionProvider): Promise<this> {
        const connection = await connectionProvider.getJsForceConnection();
        this.vlocityNamespace = await this.getConnectionNamespace(connection);
        return this;
    }

    private async getConnectionNamespace(connection: jsforce.Connection) {
        // Init namespace by query a Vlocity class similar as to what is done in the build tools
        const timer = new Timer();
        const results = await connection.query<{ NamespacePrefix: string }>('select NamespacePrefix from ApexClass where name = \'DRDataPackService\' limit 1');
        const namespace = results.records[0]?.NamespacePrefix || null;

        if (results.totalSize == 0) {
            // This usually happens when there is no Vlocity package installed
            this.logger.warn('Unable to detect Vlocity Managed Package on target org, is Vlocity installed?');
        } else {
            this.logger.info(`Initialized Vlocity namespace to ${chalk.bold(namespace)} [${timer.stop()}]`);
        }

        return namespace;
    }
}
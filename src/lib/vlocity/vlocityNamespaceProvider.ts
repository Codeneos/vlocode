import { LogManager, Logger } from '@logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import Timer from 'lib/util/timer';
import * as jsforce from 'jsforce';
import chalk = require('chalk');
import { dependency } from 'lib/core/inject';

@dependency()
export class VlocityNamespaceProvider {

    private vlocityNamespace: string;
    private readonly namespaceSymbol = Symbol('vlocityNamespace');

    constructor(
        public readonly connectionProvider: JsForceConnectionProvider,
        private readonly logger: Logger = LogManager.get(VlocityNamespaceProvider) ) {
    }

    /**
     * Get the vlocity namespace for the specified 
     */
    public getNamespace() {
        return this.vlocityNamespace;
    }

    public async initialize(): Promise<this> {
        const connection = await this.connectionProvider.getJsForceConnection();
        this.vlocityNamespace = await this.getConnectionNamespace(connection);
        return this;
    }

    private async getConnectionNamespace(connection: jsforce.Connection) {
        if (connection[this.namespaceSymbol] != undefined) {
            // Namespace is already initialized directly return our connection
            return connection[this.namespaceSymbol];
        }

        // Init namespace by query a Vlocity class similair as to what is done in the build tools
        const timer = new Timer();
        const results = await connection.query<{ NamespacePrefix: string }>('select NamespacePrefix from ApexClass where name = \'DRDataPackService\' limit 1');
        const namespace = results.records[0]?.NamespacePrefix || null;

        // Define a readonly property that cannot be overwritten or changed using
        // a unique symbol only known to this class instance
        Object.defineProperty(connection, this.namespaceSymbol, {
            value: namespace,
            writable: false,
            configurable: false
        });

        if (results.totalSize == 0) {
            // This usually happens when there is no VLocity package installed
            this.logger.warn('Unable to detect Vlocity Managed Package on target org, is Vlocity installed?');
        } else {
            this.logger.info(`Initialized Vlocity namespace to ${chalk.bold(namespace)} [${timer.stop()}]`);
        }

        return namespace;
    }
}


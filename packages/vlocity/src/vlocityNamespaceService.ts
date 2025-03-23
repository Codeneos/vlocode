import { Logger , injectable } from '@vlocode/core';
import { SalesforceConnectionProvider, NamespaceService, SalesforceConnection } from '@vlocode/salesforce';
import { mapGetOrCreate, Timer } from '@vlocode/util';
import chalk from 'chalk';
import * as constants from './constants';

@injectable.singleton({ provides: [NamespaceService, VlocityNamespaceService] })
export class VlocityNamespaceService extends NamespaceService {

    @injectable.property private readonly logger: Logger
    private readonly vlocityNamespaceCache = new Map<string, Promise<string> | string>();

    constructor(private vlocityNamespace: string | null = null) {
        super();
    }

    /**
     * Get the vlocity namespace for the specified 
     */
    public getNamespace() {
        return this.vlocityNamespace ?? 'c';
    }

    /**
     * Replace the name space with a placeholder string
     * @param name text to update
     */
    public replaceNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name.replace(new RegExp(`${this.vlocityNamespace}`, 'gi'), constants.NAMESPACE_PLACEHOLDER);
        }
        return name;
    }

    /**
     * Update the text replacing all namespace placeholders
     * @param name text to update
     */
    public updateNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name.replace(constants.NAMESPACE_PLACEHOLDER_PATTERN, this.vlocityNamespace);
        }
        return name.replace(constants.NAMESPACE_PLACEHOLDER_PATTERN, '').replace(/^__/, '');
    }

    /**
     * Get the namespace of the current connection
     * @param connectionProvider Connection provider to use to initialize the namespace
     */
    public async initialize(connectionProvider: SalesforceConnectionProvider): Promise<this> {
        const connection = await connectionProvider.getJsForceConnection();
        this.vlocityNamespace = await mapGetOrCreate(this.vlocityNamespaceCache, connection.instanceUrl, () => this.getConnectionNamespace(connection));
        return this;
    }

    private async getConnectionNamespace(connection: SalesforceConnection) {
        // Init namespace by query a Vlocity class similar as to what is done in the build tools
        const timer = new Timer();
        const results = await connection.query<{ NamespacePrefix: string }>('select NamespacePrefix from ApexClass where name = \'DRDataPackService\' limit 1');
        const namespace = results.records[0]?.NamespacePrefix ?? null;

        if (results.totalSize == 0) {
            // This usually happens when there is no Vlocity package installed
            this.logger.warn('Unable to detect Vlocity Managed Package on target org, is Vlocity installed?');
        } else {
            this.logger.info(`Initialized Vlocity namespace to ${chalk.bold(namespace)} [${timer.stop()}]`);
        }

        return namespace;
    }
}
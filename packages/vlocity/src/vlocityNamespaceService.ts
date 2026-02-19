import { Logger , injectable, inject } from '@vlocode/core';
import { SalesforceConnectionProvider, NamespaceService, SalesforceConnection } from '@vlocode/salesforce';
import { mapGetOrCreate, Timer } from '@vlocode/util';
import chalk from 'chalk';
import * as constants from './constants';

@injectable.singleton({ priority: 10 })
export class VlocityNamespaceService extends NamespaceService {

    @inject() private readonly logger: Logger
    private readonly vlocityNamespaceCache = new Map<string, Promise<string | null> | string | null>();
    private isInitialized = false;

    constructor(private vlocityNamespace: string | null = null) {
        super();
    }

    /**
     * Get the vlocity namespace for the specified 
     */
    public getNamespace() {
        this.checkInitialized();
        return this.vlocityNamespace ?? 'c';
    }

    /**
     * Replace the name space with a placeholder string
     * @param name text to update
     */
    public replaceNamespace(name: string) {
        this.checkInitialized();
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
        const cachedVersion = this.vlocityNamespaceCache.get(connection.instanceUrl);
        this.vlocityNamespace = await mapGetOrCreate(this.vlocityNamespaceCache, connection.instanceUrl, () => this.getConnectionNamespace(connection));
        return this;
    }

    private async getConnectionNamespace(connection: SalesforceConnection) {
        // Init namespace by query a Vlocity class similar as to what is done in the build tools
        const timer = new Timer();
        const results = await connection.tooling.query<{ SubscriberPackage: { NamespacePrefix: string, Name: string } }>('SELECT SubscriberPackage.NamespacePrefix, SubscriberPackage.Name FROM InstalledSubscriberPackage');
        
        const packages = results.records.map(record => record.SubscriberPackage);
        const vlocityNamespace = packages.find(pkg => /vlocity/ig.test(pkg.Name))?.NamespacePrefix ?? null;
        const omnistudioNamespace = packages.find(pkg => /omnistudio/ig.test(pkg.Name))?.NamespacePrefix ?? null;
        const namespace = vlocityNamespace ?? omnistudioNamespace ?? null;

        if (!namespace) {
            // This usually happens when there is no Vlocity package installed
            this.logger.warn('Unable to detect Industries or Omnistudio Managed Package on target org, install either package to enable Omnistudio features');
        } else {
            this.logger.info(`Initialized Omnistudio namespace to ${chalk.bold(namespace)} [${timer.stop()}]`);
        }

        this.isInitialized = true;
        return namespace;
    }

    private checkInitialized() {
        if (!this.isInitialized) {
            this.logger.warn('VlocityNamespaceService is not initialized yet, using default namespace placeholder');
        }
    }
}
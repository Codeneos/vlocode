
import { cache } from '@vlocode/util';
import { Connection } from 'jsforce';
import { SalesforceConnection, SalesforceConnectionOptions } from '../salesforceConnection';
import { SalesforceConnectionProvider } from './salesforceConnectionProvider';

/**
 * Minimal properties of a JSForce connection instance
 */
 export interface JsforceConnectionProperties {
    loginUrl: string,
    instanceUrl: string,
    accessToken: string,
    refreshToken?: string,
    version?: string,
    signedRequest?: object,
    userInfo?: object,
    oauth2: object,
    _sessionType?: unknown,
}

/**
 * Salesforce connection options
 */
export interface SalesforceOAuthDetails {
    loginUrl: string,
    instanceUrl: string,
    accessToken: string,
    refreshToken: string,
    clientId: string,
    clientSecret?: string,
    version?: any,
}

/**
 * Basic JSforce connection provider Impl that ensures the connection is of the right prototype.
 */
export class JsForceConnectionProvider extends SalesforceConnectionProvider {
    #jsConnection: SalesforceConnection;
    #version: string = '55.0';

    /**
     * The client ID used in the request headers
     */
    public clientConnectionId = `sfdx toolbelt:${process.env.VLOCODE_SET_CLIENT_IDS ?? 'vlocode'}`;

    /**
     * Creates a new JSForce connection provide from an existing connection ensuring the connection returned. JSForce as part
     * of vlocode is patched to resolve various issues with JSForce. This ensures that JSForce is always of version 1.11.0 with the appropriate
     * patches.
     * @param connection JS force connection
     * @returns
     */
    constructor(connection: JsforceConnectionProperties | SalesforceOAuthDetails | Connection, private readonly options?: SalesforceConnectionOptions) {
        super();
        if (!options) {
            this.options = {};
        }
        if (Object.getPrototypeOf(connection) === Connection.prototype) {
            this.#jsConnection = this.initConnection(connection as Connection);
        } else if (Object.getPrototypeOf(connection) === SalesforceConnection.prototype) {
            this.#jsConnection = connection as any as SalesforceConnection;
        } else if (typeof connection['oauth2'] === 'object') {
            this.#jsConnection = this.cloneConnection(connection as JsforceConnectionProperties);
        } else {
            this.#jsConnection = this.newConnection(connection as SalesforceOAuthDetails);
        }
    }

    private newConnection(options: SalesforceOAuthDetails) {
        return this.initConnection(new Connection({
            version: options.version ?? this.#version,
            ...options
        }));
    }

    private cloneConnection(jsConnection: JsforceConnectionProperties) {
        return this.initConnection(Object.assign(new Connection({
            loginUrl: jsConnection.loginUrl,
            instanceUrl: jsConnection.instanceUrl,
            accessToken: jsConnection.accessToken,
            refreshToken: jsConnection.refreshToken,
            signedRequest: jsConnection.signedRequest,
            // @ts-expect-error userInfo is not a public property in the jsforce typings
            userInfo: jsConnection.userInfo,
            oauth2: jsConnection.oauth2,
            version: jsConnection.version ?? this.#version
        }), {
            _sessionType: (jsConnection as any)._sessionType
        }));
    }

    private initConnection(connection: Connection) {
        const sfConnection: SalesforceConnection = SalesforceConnection.create(connection, this.options);
        sfConnection.version = this.#version;
        return sfConnection;
    }

    public getJsForceConnection() : Promise<SalesforceConnection> {
        return Promise.resolve(this.#jsConnection);
    }

    @cache({ unwrapPromise: true })
    public async isProductionOrg() : Promise<boolean> {
        const connection = await this.getJsForceConnection();
        const results = await connection.query<{ IsSandbox: boolean }>('SELECT IsSandbox FROM Organization');
        return !results.records[0].IsSandbox;
    }

    public getApiVersion() : string {
        if (this.#jsConnection) {
            return this.#jsConnection.version;
        }
        return this.#version;
    }

    public setApiVersion(version: string) {
        if (this.#jsConnection) {
            this.#jsConnection.version = version;
        }
        this.#version = version;
    }
}
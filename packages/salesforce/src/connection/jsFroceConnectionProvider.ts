
import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { cache } from '@vlocode/util';
import { Connection } from 'jsforce';
import { SalesforceConnection } from './salesforceConnection';
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
    #jsConnection: Connection;
    #version: string = '55.0';

    /**
     * The client ID used in the request headers 
     */
    public clientConnectionId = `sfdx toolbelt:${process.env.VLOCODE_SET_CLIENT_IDS ?? 'vlocode'}`;

    /**
     * Creates a new JSForce connection provide from an existing connection ensuring the connection returned. JSForce as part 
     * of vlocode is patched to resolve various issues with JSForce. This ensures that JSForce is always of version 1.11.0 with the appropriate
     * patches.
     * @param jsConnection JS force connection
     * @returns 
     */
    constructor(options: JsforceConnectionProperties | SalesforceOAuthDetails | Connection) {
        super();
        if (Object.getPrototypeOf(options) === Connection.prototype) {
            this.#jsConnection = this.initConnection(options as Connection);            
        } else if (Object.getPrototypeOf(options) === SalesforceConnection.prototype) {
            this.#jsConnection = options as SalesforceConnection;            
        } else if (typeof options['oauth2'] === 'object') {
            this.#jsConnection = this.cloneConnection(options as JsforceConnectionProperties);
        } else {
            this.#jsConnection = this.initConnection(new Connection(options));
        }
    }

    private cloneConnection(jsConnection: JsforceConnectionProperties) {
        return this.initConnection(Object.assign(new Connection({
            loginUrl: jsConnection.loginUrl,
            instanceUrl: jsConnection.instanceUrl,
            accessToken: jsConnection.accessToken,
            refreshToken: jsConnection.refreshToken,
            signedRequest: jsConnection.signedRequest,
            userInfo: jsConnection.userInfo,
            oauth2: jsConnection.oauth2,
            version: jsConnection.version ?? this.#version
        }), {
            _sessionType: (jsConnection as any)._sessionType
        }));
    }

    private initConnection(connection: Connection) {
        const sfConnection: SalesforceConnection = Object.setPrototypeOf(connection, SalesforceConnection.prototype);
        sfConnection.setLogger(LogManager.get('JsForce'));
        sfConnection.version = this.#version;   
        return sfConnection;
    }

    public getJsForceConnection() : Promise<Connection> {
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
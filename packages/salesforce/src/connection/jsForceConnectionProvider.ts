import { cache } from '@vlocode/util';
import { Connection } from 'jsforce';

/**
 * Minimal properties of a JSForce connection instance
 */
export interface JsforceConnectionProperties {
    loginUrl?: string,
    instanceUrl?: string,
    accessToken?: string,
    refreshToken?: string,
    signedRequest?: any,
    userInfo?: any,
    oauth2?: any,
    version?: any,
}

/**
 * This interface describes objects that can provide JSForce connections, it provides 
 * some abstraction from whom the class that providing the connection which is usefull
 */
export abstract class JsForceConnectionProvider {

    /**
     * Creates a new JSForce connection provide from an existing connection ensuring the connection returned. JSForce as part 
     * of vlocode is patched to resolve various issues with JSForce. This ensures that JSForce is always of version 1.11.0 with the appropriate
     * patches.
     * @param jsConnection JS force connection
     * @returns 
     */
    public static create(jsConnection: JsforceConnectionProperties) {
        return new JsForceConnectionProviderImpl(jsConnection);
    }

    public abstract getJsForceConnection(): Promise<Connection>;
    public abstract isProductionOrg(): Promise<boolean>;
    public abstract getApiVersion(): string;
}

/**
 * Basic JSforce connection provider Impl that ensures the connection is of the right prototype.
 */
class JsForceConnectionProviderImpl extends JsForceConnectionProvider {
    #jsConnection: Connection;

    constructor(jsConnection: JsforceConnectionProperties) {
        super();
        if (Object.getPrototypeOf(jsConnection) === Connection.prototype) {
            this.#jsConnection = jsConnection as Connection;
            
        } else {
            // Clone using same auth base
            this.#jsConnection = Object.assign(new Connection({
                loginUrl: jsConnection.loginUrl,
                instanceUrl: jsConnection.instanceUrl,
                accessToken: jsConnection.accessToken,
                refreshToken: jsConnection.refreshToken,
                signedRequest: jsConnection.signedRequest,
                userInfo: jsConnection.userInfo,
                oauth2: jsConnection.oauth2,
                version: jsConnection.version
            }), {
                _sessionType: (jsConnection as any)._sessionType
            });
        }
    }

    public getJsForceConnection() : Promise<Connection> {
        return Promise.resolve(this.#jsConnection);
    }

    @cache({ unwrapPromise: true })
    public async isProductionOrg() : Promise<boolean> {
        const connection = await this.getJsForceConnection();
        const results = await connection.query<{ IsSandbox: boolean }>('SELECT IsSandbox FROM Organization');
        return results.records[0].IsSandbox;
    }

    public getApiVersion() {
        return this.#jsConnection.version;
    }
}
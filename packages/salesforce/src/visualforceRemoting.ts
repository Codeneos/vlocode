
import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { stringEquals, substringAfterLast } from '@vlocode/util';
import { URL } from 'url';
import { HttpTransport, SalesforceConnection, SalesforceConnectionProvider } from './connection';

interface VisualforceRemoteMethod {
    csrf: string;
    authorization: string;
    /**
     * Number of remoting parameters.
     */
    len: number;
    /**
     * Name of the call
     */
    name: string;
    /**
     * Namespace
     */
    ns: string;
    /**
     * API version
     */
    ver: number;
}

interface VisualforceRemotingInfo {
    actions: {
        [remoteClass: string]: {
            ms: VisualforceRemoteMethod[];
            prm: number;
        };
    };
    service: string;
    vf: {
        vid: string;
        tm: number;
    };
}

export interface VisualforceRemotingResponse {
    statusCode: number;
    message?: string;
    type: string; // Usually RPC
    tid: number;
    ref: boolean;
    action: string;
    method: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}

export interface RemoteMethodSignature {
    class: string;
    name: string;
    namespace?: string;
}

@injectable( { lifecycle: LifecyclePolicy.transient } )
export class VisualforceRemoting {
    private requestIdCounter = 1;
    private remotingInfo: VisualforceRemotingInfo;
    private remotingUrl: URL;
    private initialized: boolean;
    private visualForceTransport: HttpTransport;
    private connection: SalesforceConnection;

    constructor(
        private readonly connector: SalesforceConnectionProvider, 
        private readonly logger: Logger,
    ) {
    }

    /**
     * Get the list of methods available
     */
    public getAvailableMethods(): RemoteMethodSignature[] {
        if (!this.initialized) {
            throw new Error('Cannot list available methods before Visualforce remoting is initialized');
        }
        const actions = Object.entries(this.remotingInfo.actions).map(([action, value]) =>
            value.ms.map(info => ({ class: action, name: info.name })),
        );
        return actions.flat();
    }

    /**
     * Initializes the APEX remote call manager for the specified page; makes available all calls from the specified APEX remote page
     * @param apexPage APEX remote page to initialize the remoting manager for
     * @param namespace Namespace of the APEX page
     */
    public async initialize(apexPage?: string, namespace = 'c'): Promise<this> {
        if (this.initialized) {
            throw new Error('Visualforce remoting is already initialized');
        }

        this.connection = await this.connector.getJsForceConnection();
        this.visualForceTransport = new HttpTransport({
            useGzipEncoding: false,
            handleCookies: true,
            instanceUrl: this.connection.instanceUrl,
            baseUrl: this.connection._baseUrl(),
        });

        this.logger.info(`Initializing Visualforce remoting for ${apexPage}...`);
        await this.loadPageActions(this.getVisualForceUrl(namespace, apexPage || ''));
        this.initialized = true;
        return this;
    }

    private async loadPageActions(remotingUrl: string, redirectCount = 0) {
        // Request remoting info
        const response = await this.connection.request({
            url: remotingUrl,
            method: 'GET',
        });

        // Parse remoting details
        const remotingRegex = /Visualforce\.remoting\.Manager\.add\(new \$VFRM\.RemotingProviderImpl\((.*)\)\);$/im;
        const matches = response.toString().match(remotingRegex);
        if (!matches?.length) {
            const redirectUrl = this.getRedirectUrl(response.toString());
            if (redirectUrl) {
                if (redirectCount > 2) {
                    throw new Error(`Too many redirects (${redirectCount}): ${remotingUrl}\n${response.toString()}`);
                }
                this.logger.verbose(`Redirected from ${remotingUrl} -> ${redirectUrl}`);
                return this.loadPageActions(redirectUrl, ++redirectCount);
            }
            throw new Error(`Unable to find visualforce remoting manager details on page: ${remotingUrl}\n${response.toString()}`);
        }

        this.remotingUrl = new URL(remotingUrl);
        this.remotingInfo = <VisualforceRemotingInfo>JSON.parse(matches[1]);

        // Get tokens
        for (const [action, info] of Object.entries(this.remotingInfo.actions)) {
            this.logger.verbose(`Found action ${action} with ${info.ms.length} methods`);
        }
        this.logger.info(`Successfully initialized VF-Remoting`);

        return this;
    }

    private getRedirectUrl(response: string) {
        if (response.includes('function redirectOnLoad')) {
            const redirectRegex = /window\.location\.replace\('(.*)'\);$/im;
            const matches = response.match(redirectRegex);
            if (!matches?.length) {
                throw new Error(`Unable to find redirect URL details on page: ${response.toString()}`);
            }
            const redirectUrl = new URL(matches[1]);
            const startURL = new URL(redirectUrl.searchParams.get('startURL')!, redirectUrl.origin);
            return startURL.searchParams.get('url');
        }
    }

    /**
     * Get the visual-force page URL
     * @param namespace Page namespace
     * @param urlPath URL path parts
     */
    private getVisualForceUrl(namespace: string | null, ...urlPath: string[]) {
        const path = urlPath
            .map(p => p.split('/'))
            .flat()
            .filter(p => !!p?.trim());
        if (path.length && namespace && namespace !== 'c') {
            path.push(`${namespace}__${path.pop()}`);
        }
        const relativePage = path.length ? `/${path.join('/')}` : '';
        if (this.remotingUrl) {
            return this.remotingUrl.origin + relativePage;
        }
        return this.connection.instanceUrl + relativePage;
    }

    /**
     * Executes the specified remote APEX method using an APEX remoting call.
     * @param method Remote method signature or string describing the class and method (e.g. 'Class.method' or 'ns.Class.method')
     * @param params Optional list of params to pass to the call
     */
    public async invoke(method: RemoteMethodSignature | string, params?: unknown[]): Promise<VisualforceRemotingResponse> {
        if (!this.initialized) {
            throw new Error('Cannot invoke methods before Visualforce remoting is initialized');
        }

        // This is the default VF remote call we use to make generic Invokes
        const methodInfo = this.getRemoteCallInfo(this.parseRemoteMethod(method));
        const apexRemotingEndPoint = this.getVisualForceUrl(null, 'apexremote');

        // Headers passed
        const headers = {
            Origin: this.remotingUrl.origin,
            Referer: this.remotingUrl.href,
            'Content-Type': 'application/json',
            'X-User-Agent': 'Visualforce-Remoting',
            'X-Requested-With': 'XMLHttpRequest',
        };

        // Request body for a VF remoting call
        const body = {
            action: methodInfo.action,
            method: methodInfo.name,
            data: params,
            type: 'rpc',
            tid: ++this.requestIdCounter,
            ctx: {
                csrf: methodInfo.csrf,
                vid: this.remotingInfo.vf.vid,
                ns: methodInfo.ns,
                ver: methodInfo.ver,
                authorization: methodInfo.authorization,
            },
        };

        const stringBody = JSON.stringify(body);
        this.logger.verbose(`Invoking Remote APEX ${methodInfo.action}.${methodInfo.name} (size: ${stringBody.length})`);
        const [result] = <VisualforceRemotingResponse[]>await this.connection.request(
            {
                headers: headers,
                url: apexRemotingEndPoint,
                method: 'POST',
                body: stringBody,
            },
            {
                transport: this.visualForceTransport,
            },
        );

        if (result.statusCode !== 200) {
            throw new Error(`Visualforce call failed; got status ${result.statusCode} expected 200 -- ${result.message}`);
        }

        return result;
    }

    private parseRemoteMethod(method: RemoteMethodSignature | string): RemoteMethodSignature {
        if (typeof method === 'string') {
            const parts = method.split('.');
            if (parts.length === 2) {
                return {
                    class: parts[0],
                    name: parts[1],
                };
            } else if (parts.length === 3) {
                return {
                    namespace: parts[0],
                    class: parts[1],
                    name: parts[2],
                };
            }
            throw new Error(`Invalid remote method signature, expected format: ({namespace}).{class}.{method}, got: ${method}`);
        }
        return method;
    }

    private getRemoteCallInfo(method: RemoteMethodSignature): VisualforceRemoteMethod & { action: string } {
        const action = Object.keys(this.remotingInfo.actions).find(a => stringEquals(substringAfterLast(a, '.'), method.class, { caseInsensitive: false }));
        const info = action && this.remotingInfo.actions[action]?.ms.find(m => m.name === method.name);
        if (!info) {
            throw new Error(`No such action (${action}) or method (${method.name}) found in remoting table`);
        }
        return { action: action, ...info };
    }
}

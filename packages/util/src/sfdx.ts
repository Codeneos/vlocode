import * as path from 'path';
import * as jsforce from 'jsforce';
import * as open from 'open';
import * as salesforce from '@salesforce/core';
import { CancellationToken } from './cancellationToken';

export interface SalesforceAuthResult {
    orgId: string;
    accessToken?: string;
    instanceUrl?: string;
    loginUrl?: string;
    username: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
}

export interface FullSalesforceOrgDetails extends SalesforceAuthResult {
    connectedStatus?: string;
    lastUsed?: string;
    alias?: string;
    isDefaultDevHubUsername? : boolean;
    isDefaultUsername?: boolean;
}

export interface SalesforceOrgInfo extends SalesforceAuthResult {
    alias?: string;
}

/**
 * A shim for accessing SFDX functionality
 */
export namespace sfdx {

    export const logger: {
        error(...args: any[]): any;
        warn(...args: any[]): any;
        info(...args: any[]): any;
    } = console;

    export async function webLogin(options: { instanceUrl?: string; alias?: string }, cancelToken?: CancellationToken) : Promise<SalesforceAuthResult> {
        const oauthServer = await salesforce.WebOAuthServer.create({
            oauthConfig: {
                loginUrl: options.instanceUrl ?? 'https://test.salesforce.com'
            }
        });

        await oauthServer.start();
        cancelToken?.isCancellationRequested || await open(oauthServer.getAuthorizationUrl(), { wait: false });
        const result = oauthServer.authorizeAndSave().then(authInfo => authInfo.getFields(true) as SalesforceAuthResult);

        if (cancelToken) {
            if (cancelToken.isCancellationRequested) {
                // @ts-ignore oauthServer.webServer is private but we need to read it in order to close
                // the server if the oath request is cancelled
                oauthServer.webServer.close();
                throw 'Operation cancelled';
            }

            cancelToken.onCancellationRequested(() => {
                // @ts-ignore oauthServer.webServer is private but we need to read it in order to close
                // the server if the oath request is cancelled
                oauthServer.webServer.close();
            });

            const caneledPromise = new Promise<SalesforceAuthResult>((_, reject) => cancelToken.onCancellationRequested(() => reject('Operation cancelled')));

            // return race between cancel token
            return Promise.race([ caneledPromise, result ]);
        }

        return result;
    }

    export async function refreshOAuthTokens(usernameOrAlias: string, cancelToken?: CancellationToken) : Promise<SalesforceAuthResult> {
        const username = await resolveAlias(usernameOrAlias) || usernameOrAlias;
        const authInfo = await salesforce.AuthInfo.create({ username });
        return webLogin(authInfo.getFields(false), cancelToken);
    }

    export async function getAllKnownOrgDetails() : Promise<SalesforceOrgInfo[]> {
        const configs: SalesforceOrgInfo[] = [];
        for await (const config of getAllValidatedConfigs()) {
            configs.push(config);
        }
        return configs;
    }

    export async function *getAllValidatedConfigs() : AsyncGenerator<SalesforceOrgInfo> {
        try {
            // Wrap in try catch as both AuthInfo and Aliases can throw exceptions when SFDX is not initialized
            // this avoid that and returns an yields an empty array instead
            const authFiles = await salesforce.AuthInfo.listAllAuthFiles();
            const aliases = await salesforce.Aliases.create(salesforce.Aliases.getDefaultOptions());
            for (const authFile of authFiles) {
                try {
                    const authInfo = await salesforce.AuthInfo.create( { username: path.parse(authFile).name });
                    const authFields = authInfo.getFields();

                    if (!authFields.orgId || !authFields.username) {
                        logger.warn(`Skip authfile '${authFile}'; required fields missing`);
                        continue;
                    }

                    yield {
                        orgId: authFields.orgId,
                        accessToken: authFields.accessToken,
                        instanceUrl: authFields.instanceUrl,
                        loginUrl: authFields.loginUrl,
                        username: authFields.username,
                        clientId: authFields.clientId,
                        refreshToken: authFields.refreshToken,
                        alias: aliases?.getKeysByValue(authFields.username)[0]
                    };
                } catch(err) {
                    logger.warn(`Error while parsing SFDX authinfo: ${err.message || err}`);
                }
            }
        } catch(err) {
            logger.warn(`Error while listing SFDX info: ${err.message || err}`);
        }
    }

    export async function getOrg(usernameOrAlias?: string) : Promise<salesforce.Org> {
        const username = await resolveAlias(usernameOrAlias) || usernameOrAlias;
        const org = await salesforce.Org.create({
            connection: await salesforce.Connection.create({
                authInfo: await salesforce.AuthInfo.create({ username })
            })
        });
        await org.refreshAuth();
        return org;
    }

    async function resolveAlias(alias?: string) : Promise<string | undefined> {
        return alias ? salesforce.Aliases.fetch(alias) : undefined;
    }

    export async function getSfdxAlias(userName: string) : Promise<string | undefined> {
        const aliases = await salesforce.Aliases.create(salesforce.Aliases.getDefaultOptions());
        return aliases.getKeysByValue(userName).shift() ?? userName;
    }

    export async function setSfdxAlias(alias: string, userName: string) : Promise<void> {
        const aliases = await salesforce.Aliases.create(salesforce.Aliases.getDefaultOptions());
        aliases.getKeysByValue(userName)?.forEach(key => aliases.unset(key));
        aliases.set(alias, userName);
        await aliases.write();
    }

    export async function getJsForceConnection(username?: string) : Promise<jsforce.Connection> {
        const org = await getOrg(username);
        const connection = org.getConnection() as unknown;
        return connection as jsforce.Connection;
    }
}
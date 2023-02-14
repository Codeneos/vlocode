import * as open from 'open';
import * as salesforce from '@salesforce/core';
import { CancellationToken } from './cancellationToken';

export interface SalesforceAuthResult {
    orgId: string;
    accessToken: string;
    instanceUrl: string;
    loginUrl: string;
    username: string;
    clientId: string;
    clientSecret?: string;
    refreshToken: string;
}

export interface SalesforceOrgInfo extends SalesforceAuthResult {
    alias?: string;
}

/**
 * Force SFDX to log to memory; we don't want to access or update
 * the SFDX log file in vlocode libraries as it can causes locks when the SFDX CLI or 
 * any of the standard SF extensions is used in parallel
 */
try {
    salesforce.envVars.setString('SF_DISABLE_LOG_FILE', 'true');
    salesforce.Logger.root().then(logger => {
        logger.useMemoryLogging();
    });
} catch(err) {
    // Ignore errors while updating SFDX logger
}


/**
 * A shim for accessing SFDX functionality
 */
export namespace sfdx {

    export const logger: {
        debug(...args: any[]): any;
        error(...args: any[]): any;
        warn(...args: any[]): any;
        info(...args: any[]): any;
    } = console;

    export async function webLogin(options: { instanceUrl?: string; alias?: string, loginHint?: string }, cancelToken?: CancellationToken) : Promise<SalesforceAuthResult> {
        const oauthServer = await salesforce.WebOAuthServer.create({
            oauthConfig: {
                loginUrl: options.instanceUrl ?? 'https://test.salesforce.com'
            }
        });

        await oauthServer.start();
        const authUrl = `${oauthServer.getAuthorizationUrl()}${options.loginHint ? `&login_hint=${encodeURIComponent(options.loginHint)}` : ''}`;
        cancelToken?.isCancellationRequested || await open(authUrl, { wait: false });
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

            const canceledPromise = new Promise<SalesforceAuthResult>((_, reject) => cancelToken.onCancellationRequested(() => reject('Operation cancelled')));

            // return race between cancel token
            return Promise.race([ canceledPromise, result ]);
        }

        return result;
    }

    export async function refreshOAuthTokens(usernameOrAlias: string, cancelToken?: CancellationToken) : Promise<SalesforceAuthResult> {
        const orgDetails = await getOrgDetails(usernameOrAlias);
        if (!orgDetails) {
            throw new Error(`(sfdx.refreshOAuthTokens) No such org with username or alias ${usernameOrAlias}`);
        }

        return webLogin({
            instanceUrl: orgDetails.instanceUrl,
            alias: orgDetails.alias ?? orgDetails.username,
            loginHint: orgDetails.username
        }, cancelToken);
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
            const stateAggregator = await salesforce.StateAggregator.getInstance();
            const authFiles = await stateAggregator.orgs.readAll(true);

            for (const authFields of authFiles) {
                try {
                    if (!authFields.orgId || !authFields.username) {
                        continue;
                    }

                    if (!authFields.accessToken || !authFields.refreshToken) {
                        logger.debug(`Skipping SFDX org ${authFields.username} due to missing accessToken or refreshToken token`);
                        continue;
                    }

                    if (!authFields.instanceUrl) {
                        logger.debug(`Skipping SFDX org ${authFields.username} due to missing instance url`);
                        continue;
                    }

                    yield {
                        orgId: authFields.orgId,
                        accessToken: authFields.accessToken,
                        instanceUrl: authFields.instanceUrl,
                        loginUrl: authFields.loginUrl ?? authFields.instanceUrl,
                        username: authFields.username,
                        clientId: authFields.clientId!,
                        clientSecret: authFields.clientSecret,
                        refreshToken: authFields.refreshToken!,
                        alias: stateAggregator.aliases.get(authFields.username) || undefined
                    };
                } catch(err) {
                    logger.warn(`Error while parsing SFDX authinfo: ${err.message || err}`);
                }
            }
        } catch(err) {
            logger.warn(`Error while listing SFDX info: ${err.message || err}`);
        }
    }

    export async function getOrgDetails(usernameOrAlias: string) : Promise<SalesforceOrgInfo | undefined> {
        for await (const config of getAllValidatedConfigs()) {
            if (config.username?.toLowerCase() === usernameOrAlias?.toLowerCase() || 
                config.alias?.toLowerCase() === usernameOrAlias?.toLowerCase()) {
                return config;
            }
        }
    }

    /**
     * Update the currently stored access token for a username in the local SFDX configuration store
     * @param usernameOrAlias Salesforce username or SFDX alias
     * @param accessToken New access token to store for the specified username
     */
    export async function updateAccessToken(usernameOrAlias: string, accessToken: string) : Promise<void> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        const username = stateAggregator.aliases.getUsername(usernameOrAlias) || usernameOrAlias;
        stateAggregator.orgs.update(username, { accessToken });
        await stateAggregator.orgs.write(username);
    }

    /**
     * Resolves the username for an SFDX alias, if the specified {@link alias} cannot be mapped back to a valid Salesforce username returns `undefined`.
     * @param alias SFDX Alias to resolve to a Salesforce username
     */
    export async function resolveUsername(alias: string) : Promise<string | undefined> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        return stateAggregator.aliases.getUsername(alias) || undefined;
    }

    /**
     * Returns the alias for a username, if no alias is set returns the username.
     * @param userName username to resolve the alias for
     */
    export async function resolveAlias(userName: string) : Promise<string> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        return stateAggregator.aliases.resolveAlias(userName) ?? userName;
    }

    export async function updateAlias(alias: string, userName: string) : Promise<void> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        stateAggregator.aliases.set(alias, userName);
        await stateAggregator.aliases.write();
    }

    /**
     * @deprecated Use the appropriate Salesforce connection provider instead
     * @param usernameOrAlias Username or SFDX alias for the username
     */
    export async function getSfdxForceConnection(username: string) : Promise<salesforce.Connection> {
        const org = await getOrg(username);
        const connection = org.getConnection() as any;
        if (typeof connection.useLatestApiVersion === 'function') {
            await connection.useLatestApiVersion();
        }
        return connection as salesforce.Connection;
    }

    /**
     * @deprecated Use the appropriate Salesforce connection provider instead
     * @param usernameOrAlias Username or SFDX alias for the username
     */
    export async function getOrg(usernameOrAlias: string) : Promise<salesforce.Org> {
        const username = await resolveUsername(usernameOrAlias) ?? usernameOrAlias;

        try {
            const authInfo = await salesforce.AuthInfo.create({ username });
            const connection = await salesforce.Connection.create({ authInfo });
            const org = await salesforce.Org.create({ connection });
            return org;
        } catch (err) {
            if (err.name == 'NamedOrgNotFound') {
                throw new Error(`The specified alias "${usernameOrAlias}" does not exists; resolve this error by register the alias using SFDX or try connecting using the username instead`)
            }
            throw err;
        }
    }
}

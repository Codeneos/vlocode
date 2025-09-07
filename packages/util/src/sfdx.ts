import open from 'open';
import * as fs from 'node:fs/promises';
import * as salesforce from '@salesforce/core';
import { CancellationToken } from './cancellationToken';
import { deepClone, deepCompare, merge } from './object';

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
    isSandbox: boolean;
    lastAccessed?: Date;
    orgName: string;
    alias?: string;
    aliases: string[];
}

interface FileSystem {
    readFile(path: string): Promise<Buffer>;
    writeFile(path: string, data: Buffer): Promise<void>;
}

/**\
 * SFDX project configuration interface.
 */
export interface SfdxProjectConfig {
    name?: string;
    namespace?: string;
    sfdcLoginUrl?: string;
    sourceApiVersion?: string;
    sourceBehaviorOptions?: string[];
    packageDirectories?: {
        path: string;
        default?: boolean;
    }[];
}

/**
 * Deprecated sfdx-config interface.
 */
export interface SfdxConfig {
    defaultusername?: string;
}

/** Salesforce CLI config */
export interface SalesforceConfig extends Record<string, object | string | number | boolean | undefined> {
    ['target-org']?: string;
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
} catch {
    // Ignore errors while updating SFDX logger
}

export interface SalesforceOAuth2LoginOptions {
    /**
     * Login URL to use for the login request, defaults to {@link defaultLoginUrl} when not specified.
     */
    instanceUrl?: string;
    /**
     * When specified the alias is used to store the org details in the SFDX configuration store. Otherwise the new login is only
     * stored under the username in the SFDX configuration store.
     */
    alias?: string;
    /**
     * OAuth2 client ID to use for the login request, defaults to the SFDX default client ID when not specified.
     */
    clientId?: string;
}

export interface DeviceLoginFlow {
    /**
     * User code to display to the user that must be entered on the device login page ({@link verificationUrl}) to approve the login request.
     * The device login page {@link verificationUrl} can be opened automatically by setting the `openVerificationUrl` option to `true` when calling {@link awaitDeviceApproval}.
     * @readonly
     */
    readonly userCode: string;
    /**
     * URL to open in the browser to approve the device login request.
     * @readonly
     */
    readonly verificationUrl: string;
    /**
     * Optional the verification URL with the user code appended as query parameter.
     * @readonly
     */
    readonly verificationUrlWithCode?: string;
    /**
     * Await the user to approve the device login request.
     * @param options Options for the device login flow
     * @param options.openVerificationUrl Open the verification URL in the default browser; defaults to `true` when not specified
     * @param cancelToken Cancellation token to cancel the login flow
     * @returns A promise that resolves when the user has approved the device login request
     */
    awaitDeviceApproval(options?: { openVerificationUrl?: boolean }, cancelToken?: CancellationToken): Promise<SalesforceAuthResult>;
}

/**
 * A shim for accessing SFDX functionality
 */
export namespace sfdx {

    /**
     * Default path to the SFDX config file relative to the workspace root folder.
     */
    export const defaultConfigPath = `.sfdx/sfdx-config.json`;

    /**
     * Default path to the SF config file relative to the workspace root folder.
     */
    export const sfConfigPath = `.sf/config.json`;

    /**
     * Default login URL to use when no login URL is specified.
     * Defaults to the test login URL used to login to sandboxes.
     */
    export const defaultLoginUrl = 'https://test.salesforce.com';

    export const logger: {
        debug(...args: any[]): any;
        error(...args: any[]): any;
        warn(...args: any[]): any;
        info(...args: any[]): any;
    } = console;

    /**
     * Login to Salesforce using the OAuth2 Device Flow. In this flow a user code is
     * displayed to the user that must be entered on the device login page.
     *
     * If o options are specified the default login URL is used {@link defaultLoginUrl}.
     *
     * @param options Options for the login flow
     * @returns The authentication result
     * @example
     * ```typescript
     * const loginFlow = await sfdx.deviceLogin();
     * console.log(`Please login to Salesforce using the code ${loginFlow.userCode} on ${loginFlow.verificationUrl}`);
     * // Ser the openVerificationUrl option to false to prevent opening the verification URL in the browser
     * const authResult = await loginFlow.awaitDeviceApproval({ openVerificationUrl: true });
     * console.log(`Successfully logged in to Salesforce as ${authResult.username}`);
     * ```
     */
    export async function deviceLogin(options?: SalesforceOAuth2LoginOptions) : Promise<DeviceLoginFlow> {
        return SalesforceDeviceLoginFlow.start(options);
    }

    /**
     * Login to Salesforce using the OAuth2 Authentication Code flow.
     * @param options Options for the login flow
     * @param cancelToken Cancellation token to cancel the login flow
     * @returns The authentication result
     */
    export async function webLogin(options: SalesforceOAuth2LoginOptions & { loginHint?: string }, cancelToken?: CancellationToken) : Promise<SalesforceAuthResult> {
        const oauthServer = await salesforce.WebOAuthServer.create({
            oauthConfig: {
                loginUrl: options.instanceUrl ?? defaultLoginUrl,
                clientId: options.clientId,
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

            return new Promise<SalesforceAuthResult>((resolve, reject) => {
                cancelToken.onCancellationRequested(() => {
                    // @ts-ignore oauthServer.webServer is private but we need to read it in order to close
                    // the server if the oath request is cancelled
                    oauthServer.webServer.close();
                    reject('Operation cancelled');
                });
                result.then(details =>
                        saveOrg(details).then(() => resolve(details))
                    ).catch(reject);
            });
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
            const authFiles = await stateAggregator.orgs.list()

            for (const username of authFiles.map(f => f.replace(/\.json$/i, ''))) {
                try {
                    const authFields = await stateAggregator.orgs.read(username, true, true);

                    if (!authFields) {
                        continue;
                    }

                    if (!authFields.username) {
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

                    const allAliases = stateAggregator.aliases.getAll(authFields.username);

                    // Find org name from instance URL
                    const orgNameFromUrl = authFields.instanceUrl
                        .replace(/^https?:\/\//i, '')
                        .replace(/(\.sandbox)?(\.my)?.salesforce\.com$/i, '');
                    const isSandbox = /\.sandbox\./i.test(authFields.instanceUrl) || /test\.salesforce\.com/i.test(authFields.loginUrl ?? '');
                    const lastAccessed = authFields.instanceApiVersionLastRetrieved ? new Date(authFields.instanceApiVersionLastRetrieved) : undefined;

                    yield {
                        orgId: authFields.accessToken.split('!').shift()!,
                        orgName: orgNameFromUrl,
                        isSandbox,
                        lastAccessed,
                        accessToken: authFields.accessToken,
                        instanceUrl: authFields.instanceUrl,
                        loginUrl: authFields.loginUrl ?? authFields.instanceUrl,
                        username: authFields.username,
                        clientId: authFields.clientId!,
                        clientSecret: authFields.clientSecret,
                        refreshToken: authFields.refreshToken!,
                        alias: allAliases[0] || undefined,
                        aliases: allAliases
                    };
                } catch (err) {
                    logger.warn(`Error while reading SFDX auth for "${username}"`, err);
                }
            }
        } catch (err: any) {
            logger.warn(`Error while listing SFDX info: ${err?.message || err}`);
        }
    }

    export async function getOrgDetails(usernameOrAlias: string) : Promise<SalesforceOrgInfo | undefined> {
        if (!usernameOrAlias) {
            throw new Error('No username or alias specified');
        }
        const username = usernameOrAlias.toLowerCase().trim();
        for await (const config of getAllValidatedConfigs()) {
            if (config.username?.toLowerCase() === username || 
                config.aliases.some(alias => alias.toLowerCase() === username)
            ) {
                return config;
            }
        }
    }

    /**
     * Update the currently stored access token for a username in the local SFDX configuration store
     * @param usernameOrAlias Salesforce username or SFDX alias
     * @param accessToken New access token to store for the specified username
     */
    export async function updateTokens(usernameOrAlias: string, tokens: { accessToken?: string, refreshToken?: string }): Promise<void> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        const username = stateAggregator.aliases.getUsername(usernameOrAlias) || usernameOrAlias;
        const authFields = await stateAggregator.orgs.read(username, true, true);

        if (!authFields) {
            throw new Error(`No SFDX credentials found for alias or user: ${usernameOrAlias}`)
        }

        stateAggregator.orgs.update(username, {
            refreshToken: tokens.refreshToken ?? authFields.refreshToken,
            accessToken: tokens.accessToken ?? authFields.accessToken,
        });
        await stateAggregator.orgs.write(username);
    }

    /**
     * Save the specified org details to the local SFDX configuration store.
     * 
     * If the specified {@link details} contains a username that is already known to SFDX the details will be merged.
     * 
     * @param details details to save
     * @param options additional options
     */
    export async function saveOrg(details: SalesforceAuthResult, options?: { alias?: string | string[] }): Promise<void> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        const authFields = await stateAggregator.orgs.read(details.username, true, true) ?? undefined;

        if (authFields) {
            stateAggregator.orgs.update(details.username, { ...authFields, ...details });
        } else {
            stateAggregator.orgs.set(details.username, details);
        }

        if (options?.alias) {
            const aliases = Array.isArray(options?.alias) ? options?.alias : [ options?.alias ];
            aliases.forEach(alias => stateAggregator.aliases.set(alias, details.username));
        }

        await stateAggregator.orgs.write(details.username);
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
    export async function resolveAlias(username: string) : Promise<string> {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        return stateAggregator.aliases.resolveAlias(username) ?? username;
    }

    /**
     * Set one or more aliases for the specified username
     * @param username Username to update the alias for
     * @param alias Alias to set for the username
     */
    export async function setAlias(username: string, alias: string | string[]) : Promise<void> {
        Array.isArray(alias) || (alias = [ alias ]);
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        alias.forEach(alias => stateAggregator.aliases.set(alias, username));
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
        } catch (err: any) {
            if (err?.name == 'NamedOrgNotFound') {
                throw new Error(`The specified alias "${usernameOrAlias}" does not exists; resolve this error by register the alias using SFDX or try connecting using the username instead`)
            }
            throw err;
        }
    }

    /**
     * Get the SFDX config data for the specified folder path by traversing down the folder tree until an SFDX config 
     * file is found that contains a default username. Returns the default username and the path to the config file.
     * 
     * By default the search is limited to 2 levels down from the initial folder path specified, this can be changed by
     * specifying a different limit in the options.
     * 
     * Returns `undefined` if no config file with a default username is found.
     * 
     * @param folderPath Folder path to start the search from
     * @param options Options for the search
     * @returns The default username and the path to the config file from which it was loaded
     */
    export async function getConfig<T extends object = SfdxConfig>(folderPath: string, options: { fs: FileSystem, limit?: number } = { fs: fs, limit: 2 })
        : Promise<{ config: T, path: string } | undefined>
    {
        let config: T | undefined;
        let configPath: string | undefined;
        let limit = options.limit ?? 2;

        if (folderPath.endsWith(defaultConfigPath)) { 
            folderPath = folderPath.substring(0, -defaultConfigPath.length);
        }

        while(limit-- > 0) {
            try {
                configPath = `${folderPath}/${defaultConfigPath}`
                config = JSON.parse((await options.fs.readFile(configPath)).toString('utf8'));
            } catch (err: any) {
                if (err?.code !== 'ENOENT') {
                    throw err;
                }
            }

            if (config) {
                return { config, path: configPath! };
            } else if (folderPath.lastIndexOf('/')) {
                folderPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
            }
        }
    }

    /**
     * Update the SFDX configuration for the specified folder path or in the specified config file.
     *
     * If no config file is specified the default config file name `.sfdx/sfdx-config.json` is used.
     *
     * @param config Update configuration with the username to set and the config file to update
     * @param options Options to set the FS implementation to use
     * @returns Promise that resolves when the default username is updated
     */
    export async function setConfig<T extends object>(
        folderPath: string, 
        config: Partial<T>, 
        options: { fs: FileSystem, replace?: boolean } = { fs: fs }
    ) : Promise<boolean> {
        const currentConfig = await getConfig(folderPath, { fs: options.fs });
        const newConfig = (!currentConfig?.config || options.replace) ? config 
            : merge(deepClone(currentConfig?.config ?? {}), config);

        if (currentConfig?.config && deepCompare(currentConfig?.config, newConfig)) {
            return false;
        }

        const configPath = currentConfig?.path ?? `${folderPath}/${defaultConfigPath}`;
        await options.fs.writeFile(configPath, Buffer.from(JSON.stringify(newConfig, undefined, 2)));
        return true
    }

    export async function removeOrg(username: string) {
        const stateAggregator = await salesforce.StateAggregator.getInstance();
        stateAggregator.aliases.unsetAll(username);
        await stateAggregator.orgs.remove(username);
        await stateAggregator.aliases.write();
    }

    /**
     * Default implementation of the {@link DeviceLoginFlow} that wraps
     * the {@link salesforce.DeviceOauthService} and {@link salesforce.DeviceCodeResponse}.
     */
    class SalesforceDeviceLoginFlow implements DeviceLoginFlow {
        public get userCode() : string {
            return this.loginData.user_code;
        }

        public get verificationUrl() : string {
            return this.loginData.verification_uri;
        }

        public get verificationUrlWithCode() : string {
            const hasQueryParams = this.loginData.verification_uri.includes('?');
            return `${this.loginData.verification_uri}${hasQueryParams ? '&' : '?'}${
                `user_code=${encodeURIComponent(this.userCode)}`
            }`;
        }

        private constructor(
            private readonly oauthService: salesforce.DeviceOauthService,
            private readonly loginData: salesforce.DeviceCodeResponse,
            private readonly options?: SalesforceOAuth2LoginOptions
        ) { }

        /**
         * Start a new device login flow. Requests a new device code from Salesforce and returns a new {@link SalesforceDeviceLoginFlow} instance
         * which can be used to await the user to approve the login request.
         * @param options Options for the device login flow
         * @returns A promise that resolves when the user has approved the device login request
         */
        static async start(options?: SalesforceOAuth2LoginOptions): Promise<SalesforceDeviceLoginFlow> {
            const deviceOauthService = await salesforce.DeviceOauthService.create({
                loginUrl: options?.instanceUrl ?? sfdx.defaultLoginUrl,
                clientId: options?.clientId
            });
            const loginData = await deviceOauthService.requestDeviceLogin();
            return new SalesforceDeviceLoginFlow(deviceOauthService, loginData, options);
        }

        public async awaitDeviceApproval(options?: { openVerificationUrl?: boolean }, token?: CancellationToken): Promise<SalesforceAuthResult> {
            if (options?.openVerificationUrl ?? true) {
                await open(this.verificationUrlWithCode, { wait: false });
            }
            const approval = await Promise.race([
                this.oauthService.awaitDeviceApproval(this.loginData),
                new Promise<undefined>((resolve) => token?.onCancellationRequested(() => resolve(undefined)))
            ]);

            if (!approval) {
                throw new Error('User did not approve the device login request within the specified timeout');
            }

            const authInfo = await this.oauthService.authorizeAndSave(approval);
            const authResult = authInfo.getFields(true) as SalesforceAuthResult;
            await sfdx.saveOrg(authResult, { alias: this.options?.alias });
            return authResult;
        }
    }
}

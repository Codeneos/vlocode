import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import chalk from 'chalk';

import { Logger, injectable, container, Container, LifecyclePolicy } from '@vlocode/core';
import { observeArray, ObservableArray, observeObject, Observable, sfdx, isPromise, intersect, singleFlight, filterAsyncParallel } from '@vlocode/util';
import { SalesforceService } from '@vlocode/salesforce';
import { MatchingKeyService } from '@vlocode/vlocity-deploy';

import { CONFIG_SECTION, CONTEXT_PREFIX, VlocodeCommand } from '../constants';
import { Activity as ActivityTask, ActivityOptions, CancellableActivity, NoncancellableActivity as NonCancellableActivity, VlocodeActivity, VlocodeActivityStatus, ActivityProgressData } from '../lib/vlocodeActivity';
import VlocodeConfiguration from './vlocodeConfiguration';
import VlocityDatapackService from './vlocity/vlocityDatapackService';
import { ConfigurationManager } from './config';
import CommandRouter from './commandRouter';
import { SfdxConfigManager } from './sfdxConfigManager';
import { getWorkspaceFileCandidates } from './workspaceFiles';
import { createOrgServices, OrgSession, OrgSessionIdentity } from './orgSession';
import { OrgSessionManager } from './orgSessionManager';

@injectable({ lifecycle: LifecyclePolicy.singleton })
/**
 * Core service class for the Vlocode extension, responsible for managing Salesforce connections,
 * datapack services, and extension state.
 *
 * This service:
 * - Manages connections to Salesforce orgs
 * - Initializes and provides access to Vlocity datapack services
 * - Manages status bar items for displaying connection status and other information
 * - Handles activity tracking and progress reporting for long-running tasks
 * - Provides utilities for validating the workspace and Salesforce connectivity
 * - Manages OAuth token refresh when credentials expire
 *
 * @implements {vscode.Disposable}
 */
export default class VlocodeService implements vscode.Disposable {

    // Privates
    private disposables: { dispose() : any }[] = [];
    private statusItems: { [id: string] : vscode.StatusBarItem } = {};
    private readonly sessionManager = new OrgSessionManager(identity => this.createOrgSession(identity));
    private offlineServices?: Container;
    private selectionVersion = 0;
    private pendingUsername?: string;
    private configUpdate = Promise.resolve();
    private sfUsername?: string;
    private initializePromise?: Promise<void>;
    private refreshOAuthTokensPromise?: Promise<boolean>;
    private readonly credentialRefreshes = new Map<string | undefined, Promise<void>>();

    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};
    private readonly events = {
        activitiesChanged: new vscode.EventEmitter<VlocodeActivity[]>(),
        usernameChanged: new vscode.EventEmitter<string | undefined>(),
    }

    // Publics
    public readonly activities: ObservableArray<Observable<VlocodeActivity>> = observeArray([]);

    // Properties
    /**
     * Gets the session captured by the current operation, or the selected session outside an operation.
     */
    public get session(): OrgSession | undefined {
        return this.sessionManager.session;
    }

    /**
     * Gets services belonging to the current operation's org.
     *
     * Without an org session, editors use a disconnected child container for bundled definitions.
     * Keeping those instances out of the root prevents later org sessions from inheriting their caches.
     */
    public get services(): Container {
        return this.session?.services ?? (this.offlineServices ??= createOrgServices(container, {
            getJsForceConnection: async () => { throw new Error('Select a Salesforce org to connect'); },
            isProductionOrg: async () => { throw new Error('Select a Salesforce org to connect'); },
            getApiVersion: () => this.config.salesforce.apiVersion
        }));
    }

    /**
     * Gets the session currently selected in the UI, even when the caller is running for an older org.
     */
    public get selectedSession(): OrgSession | undefined {
        return this.sessionManager.current;
    }

    /**
     * Keeps a callback's service lookups on the same org and retains that session until the callback settles.
     * If no session is available and no override is supplied, the callback can select an org during startup.
     *
     * @param task - The asynchronous operation to run.
     * @param options - An explicit session override; `{ session: undefined }` captures offline state.
     * @returns The callback's result.
     */
    public withSession<T>(task: () => Promise<T>, options?: { session: OrgSession | undefined }): Promise<T> {
        return this.sessionManager.run(task, options);
    }

    public get datapackService(): VlocityDatapackService {
        if (!this.session) {
            throw new Error('Vlocode datapack services are not initialized');
        }
        return this.session.datapacks;
    }

    public get isVlocityAvailable(): boolean {
        return this.session?.isVlocityAvailable ?? false;
    }

    public get isNativeOmniStudioAvailable(): boolean {
        return this.session?.isNativeOmniStudioAvailable ?? false;
    }

    public get isManagedOmniStudioAvailable(): boolean {
        return this.session?.isManagedOmniStudioAvailable ?? false;
    }

    public get isOmniStudioAvailable(): boolean {
        return this.isNativeOmniStudioAvailable || this.isManagedOmniStudioAvailable;
    }

    public get salesforceService(): SalesforceService {
        if (!this.session) {
            throw new Error('Vlocode is yet not initialized...');
        }
        return this.session.salesforce;
    }

    public get sfdxUsername(): string | undefined {
        return this.session?.identity.username ?? this.pendingUsername ?? this.sfUsername;
    }

    public get isInitialized() {
        return this.session !== undefined;
    }

    public get commands() : CommandRouter {
        return this.commandRouter;
    }

    public get apiVersion() {
        return this.session?.identity.apiVersion ?? this.config.salesforce.apiVersion;
    }

    public get onActivitiesChanged() {
        return this.events.activitiesChanged.event;
    }

    public get onUsernameChanged() {
        return this.events.usernameChanged.event;
    }

    // Ctor + Methods
    constructor(
        public readonly config: VlocodeConfiguration,
        private readonly sfdxConfig: SfdxConfigManager,
        private readonly commandRouter: CommandRouter,
        private readonly logger: Logger
    ) {        
        this.updateExtensionStatus();
        this.showApiVersionStatusItem();
        this.initConfigWatcher();
    }

    public dispose() {
        this.selectionVersion++;
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        this.sessionManager.dispose();
        this.offlineServices?.dispose();
    }

    public setUsername(username: string | undefined): Promise<void> {
        if (this.pendingUsername === username && this.initializePromise) {
            return this.initializePromise;
        }
        if (this.sfUsername === username && this.sessionManager.current && !this.initializePromise) {
            return Promise.resolve();
        }
        return this.startConnection(username);
    }

    public initializeConnection(): Promise<void> {
        return this.initializePromise ?? this.startConnection(this.pendingUsername ?? this.sfUsername);
    }

    private startConnection(username: string | undefined): Promise<void> {
        const version = ++this.selectionVersion;
        this.pendingUsername = username;
        const attempt = this.selectSession(username, version).finally(() => {
            if (this.initializePromise === attempt) {
                this.initializePromise = undefined;
                this.pendingUsername = undefined;
            }
        });
        this.initializePromise = attempt;
        return attempt;
    }

    private async selectSession(username: string | undefined, version: number): Promise<void> {
        try {
            this.showStatus('$(sync~spin) Connecting to Salesforce...');
            const publish = async (session: OrgSession | undefined) => {
                if (version !== this.selectionVersion) {
                    return;
                }
                // Finish earlier config writes before persisting this selection. Recheck the version
                // after waiting so an org selected in the meantime keeps ownership of the UI state.
                this.configUpdate = this.configUpdate.catch(() => undefined).then(async () => {
                    if (version === this.selectionVersion) {
                        await this.sfdxConfig.update({ defaultusername: username });
                    }
                });
                await this.configUpdate;
                if (version !== this.selectionVersion) {
                    return;
                }
                this.sessionManager.activate(session);
                this.sfUsername = username;
                this.updateExtensionStatus();
                await this.sessionManager.run(async () => this.events.usernameChanged.fire(username), { session });
            };
            if (username) {
                this.logger.info(`Connecting to Salesforce as: ${username}`);
                const auth = await sfdx.getOrgDetails(username);
                // Authentication can finish after a newer selection or disposal. Check before
                // creating a session so obsolete lookups cannot repopulate the session cache.
                if (version !== this.selectionVersion) {
                    return;
                }
                if (!auth) {
                    throw new Error('NamedOrgNotFound');
                }
                await this.sessionManager.use({
                    orgId: auth.orgId,
                    username: auth.username,
                    apiVersion: `${Number(this.config.salesforce.apiVersion)}.0`
                }, publish);
            } else {
                await publish(undefined);
            }
        } catch (err: any) {
            if (version !== this.selectionVersion) {
                return;
            }
            this.logger.error(err);
            if (err?.message === 'NamedOrgNotFound' || err?.message === 'The org cannot be found') {
                this.showStatus(`$(error) Unknown Salesforce user - ${username}`, VlocodeCommand.selectOrg);
            } else if (this.isTokenExpiredError(err)) {
                await this.promptRefreshOAuthToken(username);
            } else if (err?.code === 'ENOTFOUND') {
                this.showStatus('$(cloud-offline) Unable to reach Salesforce', VlocodeCommand.selectOrg);
            } else {
                this.showStatus('$(alert) Could not connect to Salesforce', VlocodeCommand.selectOrg);
            }
        }
    }

    private async createOrgSession(identity: OrgSessionIdentity): Promise<OrgSession> {
        const session = new OrgSession(identity, container);
        try {
            await this.applyMatchingKeyFiles(session);
            await session.initialize();
            if (!session.isVlocityAvailable) {
                vscode.window.showWarningMessage('Vlocity managed package not found on the target org; compatibility deployment mode is not available. Direct datapack deployment remains available.');
                this.logger.warn('Salesforce Industries Managed package not found on the target org; compatibility deployment mode is not available. Direct datapack deployment remains available.');
            }
            const connection = await session.connector.getJsForceConnection();
            connection.on('error', err => {
                if (this.sessionManager.current === session) {
                    void this.withSession(async () => this.handleConnectionError(err), { session });
                }
            });
            return session;
        } catch (error) {
            session.dispose();
            throw error;
        }
    }

    public getDiagnostics(name : string): vscode.DiagnosticCollection {
        if (this.diagnostics[name]) {
            return this.diagnostics[name];
        }
        return this.registerDisposable(this.diagnostics[name] = vscode.languages.createDiagnosticCollection(name));
    }

    public showStatus(text: string, command?: VlocodeCommand) : void {
        this.createUpdateStatusBarItem(
            'connection', {
                text, command,
                tooltip: command ? 'Salesforce org for Vlocode' : undefined
            }
        );
    }

    private showApiVersionStatusItem() : void {
        this.createUpdateStatusBarItem(
            'apiVersion', {
                text: this.config.salesforce.apiVersion ?? 'Vlocode Salesforce API Version',
                tooltip: `Using SF API ${this.config.salesforce.apiVersion}`,
                command: VlocodeCommand.selectApiVersion
            }
        );
    }

    public getStatusText() : string {
        return this.statusItems['connection']?.text;
    }

    public hideAllStatusBarItems() : void {
        for (const statusItem of Object.values(this.statusItems)) {
            statusItem.hide();
        }
    }

    public createUpdateStatusBarItem(localName: string, options: Partial<vscode.StatusBarItem>) : vscode.StatusBarItem {
        if (!this.statusItems[localName]) {
            const priority = 30 - Object.keys(this.statusItems).length;
            this.statusItems[localName] = this.registerDisposable(vscode.window.createStatusBarItem(`${CONFIG_SECTION}.${localName}`, vscode.StatusBarAlignment.Left, priority));
        }
        for (const key of intersect(Object.keys(options), ['text', 'tooltip', 'command'])) {
            this.statusItems[localName][key] = options[key];
        }
        this.statusItems[localName].show();
        return this.statusItems[localName];
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `false`.
     * @param title Title of the task
     * @param task task to run
     */
    public withProgress<T>(title: string, task: NonCancellableActivity<T> | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: false,
            hidden: true,
            location: vscode.ProgressLocation.Notification
        }, task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `true`.
     * @param title Title of the task
     * @param task task to run
     */
    public withCancelableProgress<T>(title: string, task: CancellableActivity<T> | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: true,
            hidden: true,
            location: vscode.ProgressLocation.Notification
        }, task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Window` and cancellable `false`.
     * @param title Title of the task
     * @param task task to run
     */
    public withStatusBarProgress<T>(title: string, task: NonCancellableActivity<T> | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: false,
            hidden: true,
            location: vscode.ProgressLocation.Window
        }, typeof task === 'function' ? task : () => task);
    }

    /**
     * Wrapper around `vscode.window.withProgress` that registers the task as an activity visible in the activity explorer if used.
     * @param title Title of the task to run as it will appear on the progress and UI
     * @param task Task to run
     */
    public withActivity<T>(title: string, task: ActivityTask<T> | Promise<T>) : Promise<T>;
    /**
     * Wrapper around `vscode.window.withProgress` that registers the task as an activity visible in the activity explorer if used.
     * @param options Activity options
     * @param task Task to run
     */
    public withActivity<T>(options: ActivityOptions, task: ActivityTask<T> | Promise<T>) : Promise<T>;
    public withActivity<T>(input: ActivityOptions | string, task: ActivityTask<T> | Promise<T>) {
        // Create activity record to track activity progress
        const isFn = typeof task === 'function';
        const options: ActivityOptions = typeof input == 'string' ? {
            activityTitle: input,
            progressTitle: input,
            propagateExceptions: true,
            cancellable: isFn && task.length == 2,
            location: vscode.ProgressLocation.Notification
        } : input;

        const cancelTokenSource = options.cancellable ? new vscode.CancellationTokenSource() : undefined;
        const onCompleteEmitter = new vscode.EventEmitter<VlocodeActivity>();
        const activityRecord = observeObject({
            startTime: Date.now(),
            endTime: -1,
            executionTime: -1,
            hidden: options.hidden === true,
            cancellable: options.cancellable === true,
            title: options.activityTitle || options.progressTitle,
            status: VlocodeActivityStatus.Pending,
            progess: 0,
            normalizedProgress: 0,
            total: 100,
            onComplete: onCompleteEmitter.event,
            cancel() {
                cancelTokenSource?.cancel();
            },
            dispose() {
                cancelTokenSource?.dispose();
                onCompleteEmitter.dispose();
            }
        });

        const progressInterceptor = (vscodeProgress: vscode.Progress<{ message?: string; increment?: number }>) => {
            return {
                report(state: ActivityProgressData) {
                    const total = state.total ?? 100;
                    let relativeIncrement: number | undefined = undefined;

                    if ('progress' in state && state.progress !== undefined) {
                        const currentRelativeProgress = state.progress / total;

                        const normalizedProgress = Math.max(0, Math.min(100, Math.floor(currentRelativeProgress * 100)));
                        relativeIncrement = normalizedProgress - activityRecord.normalizedProgress;
                        if (relativeIncrement < 0) {
                            vscodeProgress.report( { increment: -activityRecord.normalizedProgress } );
                            activityRecord.normalizedProgress = 0;
                            relativeIncrement = normalizedProgress;
                        }

                        activityRecord.progess = state.progress;
                        activityRecord.total = total;
                    } else if ('increment' in state && state.increment !== undefined) {
                        activityRecord.progess += state.increment;
                        activityRecord.total = total;
                        const currentRelativeProgress = activityRecord.progess / total;
                        const normalizedProgress = Math.max(0, Math.min(100, Math.floor(currentRelativeProgress * 100)));
                        relativeIncrement = normalizedProgress - activityRecord.normalizedProgress;
                    }

                    vscodeProgress.report( { message: state.message, increment: relativeIncrement } );

                    if (state.status !== undefined) {
                        activityRecord.status = state.status;
                    }

                    if (relativeIncrement) {
                        activityRecord.normalizedProgress += relativeIncrement;
                    }
                }
            };
        };

        // anon-function that is going to run our task
        const taskRunner = async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token?.onCancellationRequested(() => !cancelTokenSource?.token.isCancellationRequested && cancelTokenSource?.cancel());
            activityRecord.status = VlocodeActivityStatus.InProgress;
            try {
                const result = await (isFn ? task(progressInterceptor(progress), cancelTokenSource?.token!) : task);
                if (activityRecord.status == VlocodeActivityStatus.InProgress) {
                    activityRecord.status = VlocodeActivityStatus.Completed;
                }
                return result;
            } catch(e) {
                if (activityRecord.status == VlocodeActivityStatus.InProgress) {
                    activityRecord.status = VlocodeActivityStatus.Failed;
                }
                if (options.propagateExceptions !== false) {
                    this.logger.debug(e);
                    throw e;
                }
                this.logger.error(e);
            } finally {
                if (cancelTokenSource?.token.isCancellationRequested) {
                    activityRecord.status = VlocodeActivityStatus.Cancelled;
                }
                activityRecord.endTime = Date.now();
                activityRecord.executionTime = activityRecord.endTime - activityRecord.startTime;
                onCompleteEmitter.fire(activityRecord);
            }
        };

        this.activities.push(activityRecord);
        this.registerDisposable(activityRecord);

        return this.withSession(async () => vscode.window.withProgress({
            title: options.progressTitle || options.activityTitle,
            cancellable: options.cancellable === true,
            location: options.location ?? vscode.ProgressLocation.Notification
        }, taskRunner)) as Promise<T>;
    }

    public getJsForceConnection() {
        return this.getConnector().getJsForceConnection();
    }

    private handleConnectionError(err: Error | undefined) {
        if (err === undefined) {
            return;
        }

        if (this.isTokenExpiredError(err)) {
            return this.handleAuthTokenExpiredError();
        }
    }

    private isTokenExpiredError(err: Error | undefined) {
        return err?.name === 'invalid_grant' || err?.message === 'RefreshTokenAuthError';
    }

    @singleFlight('refreshOAuthTokensPromise')
    private async handleAuthTokenExpiredError() {
        const refreshed = await this.promptRefreshOAuthToken();

        if (!refreshed) {
            void vscode.window.showErrorMessage(
                `Unable to connect to Salesforce, the refresh token for ${this.sfdxUsername} expired`
            );
            this.logger.error(`Authorization token expired for ${this.sfdxUsername} -- select a different org or re-authenticate with the target org`);
            this.showStatus(`$(key) Authorization expired - ${this.sfdxUsername}`, VlocodeCommand.selectOrg);
        }

        return refreshed;
    }

    public isProductionOrg() {
        return this.getConnector().isProductionOrg();
    }

    public getApiVersion() {
        return this.session?.identity.apiVersion ?? this.config.salesforce.apiVersion;
    }

    public getNamespace() {
        return this.session?.namespace.getNamespace();
    }

    private getConnector() {
        if (!this.session) {
            throw new Error('Cannot connect to Salesforce; no org session is initialized');
        }
        return this.session.connector;
    }

    private async promptRefreshOAuthToken(username = this.sfdxUsername): Promise<boolean> {
        const version = this.selectionVersion;
        const action = await vscode.window.showWarningMessage(
            `Authorization for ${username} has expired. Do you want to refresh it?`,
            { title: 'Refresh', refresh: true },
            { title: 'Cancel', refresh: false }
        );

        if (action?.refresh) {
            try {
                await this.refreshOrgConnection(username, version);
                return true;
            } catch (err) {
                this.logger.error(err);
            }
        }

        return false;
    }

    /**
     * Refreshes a user's credentials and reconnects if no newer org selection has been made.
     * Concurrent requests for the same user share only the credential refresh, so a failed
     * reconnection can prompt for another refresh without waiting on itself.
     */
    public refreshOAuthTokens(username = this.sfdxUsername) : Promise<void> {
        return this.refreshOrgConnection(username, this.selectionVersion);
    }

    private async refreshOrgConnection(username: string | undefined, version: number): Promise<void> {
        await this.refreshOrgCredentials(username);
        // A prompt may have opened before the user selected another org. Its credential
        // refresh can still finish, but it must not restore the prompt's original selection.
        if (version === this.selectionVersion) {
            await this.startConnection(username);
        }
    }

    private refreshOrgCredentials(username: string | undefined): Promise<void> {
        const pending = this.credentialRefreshes.get(username);
        if (pending) {
            return pending;
        }
        const refresh = this.withActivity({
            progressTitle: `Refreshing ${username} org credentials...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true
        }, async (_, cancelationToken) => {
            await sfdx.refreshOAuthTokens(username!, cancelationToken);
            this.sessionManager.invalidate(username);
            vscode.window.showInformationMessage(`Successfully refreshed ${username} org credentials`);
        }).finally(() => this.credentialRefreshes.delete(username));
        this.credentialRefreshes.set(username, refresh);
        return refresh;
    }

    /**
     * Get the body of a document as string
     * @param file file name
     */
    public async readWorkspaceFile(uri: vscode.Uri) : Promise<string> {
        const doc = vscode.workspace.textDocuments.find(doc => doc.uri.path == uri.path);
        if (doc) {
            return doc.getText();
        }
        return (await vscode.workspace.fs.readFile(uri)).toString();
    }

    private updateExtensionStatus() {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            this.setExtensionContext('orgSelected', false);
            return this.hideAllStatusBarItems();
        }

        if (!this.sfUsername) {
            this.setExtensionContext('orgSelected', false);
            return this.showStatus('$(gear) Select Salesforce org', VlocodeCommand.selectOrg);
        }

        this.setExtensionContext('orgSelected', true);
        this.showStatus(`$(cloud-upload) Vlocode ${this.sfUsername}`, VlocodeCommand.selectOrg);
        const username = this.sfUsername;
        void sfdx.resolveAlias(username).then(userAliasOrName => {
            if (this.getStatusText() !== `$(cloud-upload) Vlocode ${username}`) {
                // Avoid overwriting more up to date status bar text during extension start-up
                return;
            }
            this.showStatus(`$(cloud-upload) Vlocode ${userAliasOrName}`, VlocodeCommand.selectOrg)
        }).catch(err => {
            this.logger.warn(`Failed to resolve SFDX alias for ${this.sfUsername}:`, err);
        });
    }

    private setExtensionContext(key: string, value: any) {
        void vscode.commands.executeCommand('setContext', `${CONTEXT_PREFIX}.${key}`, value);
    }

    public registerDisposable<T extends {dispose() : any}>(disposable: T) : T
    public registerDisposable<T extends {dispose() : any}>(disposable: Promise<T>) : Promise<T>
    public registerDisposable<T extends {dispose() : any}>(disposable: T | Promise<T>) : T | Promise<T> {
        if (isPromise(disposable)) {
            return disposable.then(result => this.registerDisposable(result)).catch(err => {
                this.logger.error(err);
                throw err;
            });
        }
        this.disposables.push(disposable);
        return disposable;
    }

    private initConfigWatcher() {
        this.disposables.push(
            this.sfdxConfig.onChange(e => 'defaultusername' in e.changes && this.setUsername(e.changes.defaultusername)),
            ConfigurationManager.onConfigChange(this.config, [ 'projectPath', 'customJobOptionsYaml' ], this.processConfigurationChange.bind(this)),
            ConfigurationManager.onConfigChange(this.config, 'matchingKeyFiles', () => this.applyMatchingKeyFiles(), { initial: true }),
            ConfigurationManager.onConfigChange(this.config.salesforce, [ 'apiVersion' ], this.processConfigurationChange.bind(this))
        );
    }

    /**
     * Register the default and configured (`matchingKeyFiles` setting) matching key files on the
     * {@link MatchingKeyService}; relative paths are resolved against the workspace folders.
     *
     * @param session - A newly created session to configure, or omitted to update every retained session.
     */
    private async applyMatchingKeyFiles(session?: OrgSession) {
        const configuredFiles = (this.config.matchingKeyFiles ?? []).filter(file => typeof file === 'string' && file.trim());
        const files = new Array<string>();
        for (const file of [ ...MatchingKeyService.defaultMatchingKeyFiles, ...configuredFiles ]) {
            const existing = await filterAsyncParallel(getWorkspaceFileCandidates(file), candidate => fs.pathExists(candidate));
            if (existing.length) {
                files.push(...existing);
            } else if (configuredFiles.includes(file)) {
                // Only the default matching key files are optional
                this.logger.warn(`Configured matching key file does not exist: ${file}`);
            }
        }
        const sessions = session ? [session] : this.sessionManager.retainedSessions;
        for (const target of sessions) {
            target.services.get(MatchingKeyService).setMatchingKeyFiles(...files);
        }
    }

    private async processConfigurationChange() {
        this.showStatus('$(sync~spin) Processing config changes...', VlocodeCommand.selectOrg);
        this.showApiVersionStatusItem();
        const username = this.pendingUsername ?? this.sfUsername;
        this.sessionManager.clear();
        await this.startConnection(username);
    }

    @singleFlight()
    public async validateSalesforceConnectivity() : Promise<string | undefined> {
        if (!this.sfdxUsername) {
            const message = 'Select a Salesforce instance for this workspace to use Vlocode';
            const selectedAction = await vscode.window.showInformationMessage(message, 'Connect to Salesforce');
            if (selectedAction) {
                await this.commands.execute(VlocodeCommand.selectOrg);
                if (!this.sfdxUsername) {
                    return 'Salesforce org selection cancelled';
                }
            } else {
                return message;
            }
        }

        if (!this.isInitialized) {
            // Await service initialization
            await vscode.window.withProgress({
                title: 'Vlocode: Initializing...',
                location: vscode.ProgressLocation.Window
            }, async () => this.initializeConnection());
        }

        if (!this.isInitialized) {
            return 'Vlocode failed to initialize within the given time; check the debug console for possible errors';
        }
    }

    public validateWorkspaceFolder() : string | undefined {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            return 'No workspace folders detected. Open at least one folder in the current workspace to use Vlocode.';
        }
    }

    public async validateAll(throwException: boolean) : Promise<string | void> {
        const validationResult = this.validateWorkspaceFolder() || await this.validateSalesforceConnectivity();
        if (validationResult) {
            if (throwException) {
                throw Error(validationResult);
            }
            this.logger.error(validationResult);
            return validationResult;
        }
    }

    public enableSalesforceSupport(support: boolean) {
        if (this.config.salesforce.enabled !== support) {
            this.config.salesforce.enabled = support;
        }
        void vscode.commands.executeCommand('setContext', 'vlocodeSalesforceSupport', support);
        this.logger.info(`Salesforce support ${support ? chalk.green('enabled') : chalk.red('disabled')}`);
    }

    public enableDeveloperLogsPanel(enabled: boolean) {
        if (this.config.salesforce.developerLogsVisible !== enabled) {
            this.config.salesforce.developerLogsVisible = enabled;
        }
        void vscode.commands.executeCommand('setContext', 'vlocodeSalesforceDeveloperLogs', enabled);
        this.logger.info(`Salesforce developer logs view ${enabled ? chalk.green('enabled') : chalk.red('disabled')}`);
    }

    public updateApiVersion(apiVersion: string | number) {
        if (typeof apiVersion === 'string') {
            return this.updateApiVersion(parseInt(apiVersion, 10));
        }
        this.logger.verbose(`Using Salesforce API version: ${apiVersion}`);
        this.config.salesforce.apiVersion = `${apiVersion}.0`;
    }

    /**
     * Replaces the current user's sessions so subsequent operations load fresh org data.
     * Other users' cached sessions remain available, and active operations can finish on the old session.
     */
    public flushCaches() {
        if (!this.isInitialized) {
            return;
        }
        const username = this.sfdxUsername;
        this.sessionManager.invalidate(username);
        return this.startConnection(username);
    }
}

/**
 * Display a scode progress indicator while executing a command
 * @param options Command options
 * @returns decorator factory fn
 */
export function withProgress(options: { location: vscode.ProgressLocation, title: string }) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function(...args: any[]) {
            return container.get(VlocodeService).withActivity({
                progressTitle: options.title,
                ...options
            }, () => originalMethod.apply(this, args));
        };
        return descriptor;
    }
}

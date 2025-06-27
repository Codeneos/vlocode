import * as path from "path";
import * as constants from '../constants';
import * as vscode from 'vscode';
import { Logger, injectable, LifecyclePolicy } from '@vlocode/core';
import { Timer } from '@vlocode/util';
import * as child_process from 'child_process';

// Types expected from the forked detection process
interface SingleDetectorUpdateMessage {
    type: 'singleDetectorUpdate';
    detectorName: string; // e.g., "datapack", "salesforceMetadata"
    path: string;         // The root path that was scanned/watched
    files: string[];
}

interface ReadyMessage {
    type: 'ready';
}

interface ErrorMessage {
    type: 'error';
    message: string;
    stack?: string;
}

type ChildMessage =
    | SingleDetectorUpdateMessage
    | ReadyMessage
    | ErrorMessage
    | { type: 'pong' };

// WorkspaceContextDetectorType is no longer needed as we'll use detectorName directly.
// export type WorkspaceContextDetectorType = 'datapack' | 'salesforceMetadata';


/**
 * Monitors workspaces using a forked process for Datapack and Salesforce metadata detection
 * and updates VS Code context variables.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class WorkspaceContextDetector implements vscode.Disposable {

    // Static members to manage the shared child process
    private static child: child_process.ChildProcess | undefined;
    private static childReady = false;
    private static childRestartAttempts = 0;
    private static readonly MAX_CHILD_RESTART_ATTEMPTS = 5;
    private static instances = new Set<WorkspaceContextDetector>();
    private static extensionContext: vscode.ExtensionContext; // Required for path to detectionProcess.js

    /**
     * Global initialization for the shared detection process.
     * Must be called once when the extension activates.
     * @param context VS Code Extension Context.
     * @param logger Logger instance.
     */
    public static globalInitialize(context: vscode.ExtensionContext, logger: Logger) {
        WorkspaceContextDetector.extensionContext = context;
        WorkspaceContextDetector.logger = logger; // Assuming a static logger or passed around
        WorkspaceContextDetector.forkDetectionProcess();

        // Monitor workspace folder changes at a global level
        vscode.workspace.onDidChangeWorkspaceFolders(async e => {
            if (!WorkspaceContextDetector.child || !WorkspaceContextDetector.childReady) {
                WorkspaceContextDetector.logger?.warn('Detection process not ready, skipping workspace folder change processing.');
                return;
            }
            for (const removed of e.removed) {
                WorkspaceContextDetector.child.send({ type: 'stop_watch', path: removed.uri.fsPath });
                // Also update local caches of instances
                for (const instance of WorkspaceContextDetector.instances) {
                    instance.clearFilesForPath(removed.uri.fsPath);
                }
            }
            for (const added of e.added) {
                WorkspaceContextDetector.child.send({ type: 'watch', paths: [added.uri.fsPath] });
                // Initial scan for new folders will be triggered by the child's 'watch' logic
            }
        });
    }

    private static logger: Logger; // Static logger, set during globalInitialize

    private static forkDetectionProcess() {
        if (WorkspaceContextDetector.child) {
            WorkspaceContextDetector.logger?.warn('Detection process already exists.');
            return;
        }
        if (!WorkspaceContextDetector.extensionContext) {
            WorkspaceContextDetector.logger?.error('Extension context not available for forking detection process.');
            return;
        }

        const scriptPath = vscode.Uri.joinPath(WorkspaceContextDetector.extensionContext.extensionUri, 'out', 'detectionProcess.js').fsPath;
        WorkspaceContextDetector.logger?.info(`Forking detection process: ${scriptPath}`);

        WorkspaceContextDetector.child = child_process.fork(scriptPath, [], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'] // IPC channel
        });

        WorkspaceContextDetector.child.on('message', (message: ChildMessage) => {
            // WorkspaceContextDetector.logger?.debug(`Received message from child: ${message.type}`);
            switch (message.type) {
                case 'ready':
                    WorkspaceContextDetector.childReady = true;
                    WorkspaceContextDetector.childRestartAttempts = 0; // Reset on successful start
                    WorkspaceContextDetector.logger?.info('Detection process ready.');
                    const workspaceFolders = vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [];
                    if (workspaceFolders.length > 0 && WorkspaceContextDetector.child) {
                        WorkspaceContextDetector.child.send({ type: 'watch', paths: workspaceFolders });
                    }
                    break;
                case 'singleDetectorUpdate':
                    for (const instance of WorkspaceContextDetector.instances) {
                        if (instance.associatedDetectorName === message.detectorName) {
                            instance.handleDetectedFiles(message.path, message.files);
                        }
                    }
                    break;
                case 'error':
                    WorkspaceContextDetector.logger?.error(`Detection process error: ${message.message}`, message.stack);
                    break;
                // 'log' case removed
                case 'pong':
                    // WorkspaceContextDetector.logger?.debug('Received pong from detection process.');
                    break;
            }
        });

        WorkspaceContextDetector.child.on('error', (err) => {
            WorkspaceContextDetector.logger?.error('Detection process failed to start or crashed:', err);
            WorkspaceContextDetector.childReady = false;
            WorkspaceContextDetector.child = undefined;
            WorkspaceContextDetector.attemptRestart();
        });

        WorkspaceContextDetector.child.on('exit', (code, signal) => {
            WorkspaceContextDetector.logger?.warn(`Detection process exited with code ${code}, signal ${signal}`);
            WorkspaceContextDetector.childReady = false;
            WorkspaceContextDetector.child = undefined;
            if (code !== 0 && signal !== 'SIGTERM') { // Don't restart if exited cleanly or killed by us
                WorkspaceContextDetector.attemptRestart();
            }
        });

        // Pipe stdout/stderr from child to main logger
        // Reverting STDOUT to .info for better visibility of ConsoleLogger output from child
        WorkspaceContextDetector.child.stdout?.on('data', data => WorkspaceContextDetector.logger?.info(`[DetectorProc STDOUT]: ${data.toString().trim()}`));
        WorkspaceContextDetector.child.stderr?.on('data', data => WorkspaceContextDetector.logger?.error(`[DetectorProc STDERR]: ${data.toString().trim()}`));
    }

    private static attemptRestart() {
        if (WorkspaceContextDetector.childRestartAttempts < WorkspaceContextDetector.MAX_CHILD_RESTART_ATTEMPTS) {
            WorkspaceContextDetector.childRestartAttempts++;
            WorkspaceContextDetector.logger?.info(`Attempting to restart detection process (attempt ${WorkspaceContextDetector.childRestartAttempts})...`);
            setTimeout(() => WorkspaceContextDetector.forkDetectionProcess(), 5000 * WorkspaceContextDetector.childRestartAttempts); // Exponential backoff
        } else {
            WorkspaceContextDetector.logger?.error('Max restart attempts reached for detection process. It will remain inactive.');
        }
    }

    public static globalDispose() {
        if (WorkspaceContextDetector.child) {
            WorkspaceContextDetector.logger?.info('Terminating detection process...');
            WorkspaceContextDetector.child.kill('SIGTERM');
            WorkspaceContextDetector.child = undefined;
            WorkspaceContextDetector.childReady = false;
        }
        WorkspaceContextDetector.instances.clear();
    }

    // Instance members
    private contextFiles = new Map<string, Set<string>>(); // Map<rootPath, Set<detectedFile>>
    private scheduledContextUpdate?: NodeJS.Timeout;

    constructor(
        private readonly editorContextKey: string,
        /** The unique name of the detector this instance is associated with (e.g., "datapack"). */
        public readonly associatedDetectorName: string,
        private readonly logger: Logger // Instance logger
    ) {
        WorkspaceContextDetector.instances.add(this);
        this.logger.info(`WorkspaceContextDetector instance created for context key '${editorContextKey}' associated with detector '${associatedDetectorName}'`);
    }

    public dispose() {
        WorkspaceContextDetector.instances.delete(this);
        if (this.scheduledContextUpdate) {
            clearTimeout(this.scheduledContextUpdate);
        }
        // Clear the specific context this instance was managing
        void vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, undefined);
        this.logger.info(`Disposed WorkspaceContextDetector for ${this.editorContextKey}`);
    }

    // This method is called by the static message handler with already filtered files
    public handleDetectedFiles(rootPath: string, detectedFiles: string[]) {
        this.logger.debug(`Handling ${detectedFiles.length} files for detector '${this.associatedDetectorName}' in root '${rootPath}' (context: ${this.editorContextKey})`);
        const newFileSet = new Set(detectedFiles);
        this.contextFiles.set(rootPath, newFileSet);
        this.scheduleContextUpdate();
    }

    public clearFilesForPath(rootPath: string) {
        if (this.contextFiles.has(rootPath)) {
            this.contextFiles.delete(rootPath);
            this.scheduleContextUpdate();
            // this.logger.debug(`Cleared files for ${rootPath} (context: ${this.editorContextKey})`);
        }
    }

    private scheduleContextUpdate() {
        if (this.scheduledContextUpdate) {
            clearTimeout(this.scheduledContextUpdate);
        }
        // Update context fairly quickly after changes
        this.scheduledContextUpdate = setTimeout(() => this.updateContext(), 100);
    }

    private updateContext() {
        this.scheduledContextUpdate = undefined;
        const timer = new Timer();

        // Aggregate all files from all watched root paths for this instance's type
        const allRelevantFilesForContext = new Set<string>();
        for (const filesSet of this.contextFiles.values()) {
            filesSet.forEach(file => allRelevantFilesForContext.add(file));
        }

        // The context value is true if any files of the relevant type exist, false otherwise.
        // Or it could be the list of files if the context is used that way.
        // The original logic set a dictionary of { [filePath]: true }.
        // For a simple boolean context (e.g. "hasDatapacks"), we just need to know if the set is non-empty.
        // Let's assume for now the context variable is a boolean indicating presence.
        const contextValue = allRelevantFilesForContext.size > 0;

        // If the context key is meant to hold the list of files (as original contextFiles did):
        // const filesForContextObject: { [key: string]: true } = {};
        // allRelevantFilesForContext.forEach(file => filesForContextObject[file] = true);
        // await vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, filesForContextObject);

        // For now, setting a boolean context based on presence
        void vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, contextValue);

        this.logger.verbose(`Updated context ${constants.CONTEXT_PREFIX}.${this.editorContextKey} to ${contextValue} (${allRelevantFilesForContext.size} files) [${timer.stop()}]`);
    }

    // initialize method is no longer needed on the instance,
    // as forking and initial watch commands are handled statically.
    // The old `add`, `remove`, `removeAll`, `getApplicableFiles` etc. are removed.
}
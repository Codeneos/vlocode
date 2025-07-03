import * as fs from 'fs';
import * as path from 'path';

import { Logger, FileSystem, container, LogManager } from '@vlocode/core';
import { DatapackDetector } from './detectors/datapackDetector';
import { MetadataDetector } from './detectors/metadataDetector';
import { IFileDetector } from './types';

// Type for the cache: Map<path, Map<detectorName, Set<files>>>
type DetectionCache = Map<string, Map<string, Set<string>>>;

export class DetectionProcess {
    private readonly detectors: IFileDetector[];
    private readonly nodeFs: typeof fs; // Direct access to Node's fs for fs.watch
    private readonly fileSystem: FileSystem; // Injected FileSystem for general file ops
    private readonly logger: Logger;

    private watchedDirectories = new Map<string, fs.FSWatcher>();
    private detectedFilesCache: DetectionCache = new Map();
    private ignoredPaths = [
        '**/node_modules/**', '**/.git/**'
    ];

    // Debounce timer for processing batch changes
    private debounceTimer: NodeJS.Timeout | null = null;
    private debounceQueue = new Set<string>(); // Root paths that changed

    constructor() {
        this.logger = LogManager.get(DetectionProcess);
        this.fileSystem = container.get(FileSystem);
        this.nodeFs = fs;

        // Resolve all registered IFileDetector instances
        // This assumes they are registered in the container.
        // Alternatively, explicitly list them: [container.get(DatapackDetector), container.get(MetadataDetector)]
        try {
            // For TypeDI, if services are tagged, one could use Container.getMany(SERVICE_TAG)
            // For now, explicit resolution:
            this.detectors = [
                container.get(DatapackDetector),
                container.get(MetadataDetector)
            ];
            if (this.detectors.some(d => !d)) {
                throw new Error('One or more detectors failed to resolve.');
            }
        } catch (err) {
            this.logger.error('Failed to resolve detectors from container:', err);
            this.sendToParent({ type: 'error', message: 'Failed to initialize detectors in forked process.', stack: (err as Error).stack });
            process.exit(1);
        }

        const detectorNames = this.detectors.map(d => d.name).join(', ');
        this.logger.info(`Detection process started. Initialized detectors: ${detectorNames}`);
    }

    public run() {
        process.on('message', this.handleMessage.bind(this));
        this.sendToParent({ type: 'ready' });
    }

    private sendToParent(message: any) {
        if (process.send) {
            process.send(message);
        } else {
            this.logger.warn('process.send is not available. IPC will not work.');
        }
    }

    private async handleMessage(message: any) {
        this.logger.info(`Received message type: ${message.type}`);
        try {
            switch (message.type) {
                case 'watch':
                    if (Array.isArray(message.paths)) {
                        for (const dirPath of message.paths) {
                            await this.startWatching(dirPath);
                        }
                    }
                    break;
                case 'scan':
                    if (typeof message.path === 'string') {
                        await this.scanAndReport(message.path);
                    }
                    break;
                case 'stop_watch':
                     if (typeof message.path === 'string') {
                        this.stopWatching(message.path);
                    }
                    break;
                case 'ping':
                    this.sendToParent({ type: 'pong' });
                    break;
                default:
                    this.logger.warn(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            this.logger.error(`Error handling message ${message.type}:`, error);
            this.sendToParent({ type: 'error', message: `Error handling ${message.type}: ${(error as Error).message}`, stack: (error as Error).stack });
        }
    }

    private async startWatching(dirPath: string) {
        if (this.watchedDirectories.has(dirPath)) {
            this.logger.info(`Already watching ${dirPath}`);
            return;
        }

        this.logger.info(`Starting to watch ${dirPath}`);
        try {
            // Perform an initial scan
            await this.scanAndReport(dirPath);

            const watcher = this.nodeFs.watch(dirPath, { recursive: true }, (eventType, filename) => {
                if (filename) {
                    // this.logger.debug(`fs.watch event: ${eventType} on ${filename} in ${dirPath}`);
                    // Add to debounce queue to avoid processing too many events at once
                    this.debounceQueue.add(dirPath);
                    if (this.debounceTimer) {
                        clearTimeout(this.debounceTimer);
                    }
                    this.debounceTimer = setTimeout(() => {
                        this.processDebouncedChanges();
                    }, 500); // Debounce for 500ms
                } else {
                    // this.logger.debug(`fs.watch event: ${eventType} (no filename) in ${dirPath}. Rescanning.`);
                    // If filename is null, it might indicate a more significant change, rescan the directory.
                    this.scheduleScan(dirPath);
                }
            });

            watcher.on('error', (err) => {
                this.logger.error(`Watcher error for ${dirPath}:`, err);
                this.stopWatching(dirPath); // Stop watching if an error occurs
                this.sendToParent({ type: 'error', message: `Watcher error for ${dirPath}: ${err.message}`, stack: err.stack });
            });

            this.watchedDirectories.set(dirPath, watcher);
            this.logger.info(`Successfully watching ${dirPath}`);
        } catch (err) {
            this.logger.error(`Failed to start watching ${dirPath}:`, err);
            this.sendToParent({ type: 'error', message: `Failed to watch ${dirPath}: ${(err as Error).message}`, stack: (err as Error).stack });
        }
    }

    private scheduleScan(dirPath: string) {
        this.debounceQueue.add(dirPath);
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.processDebouncedChanges();
        }, 500);
    }

    private processDebouncedChanges() {
        const pathsToRescan = new Set(this.debounceQueue);
        this.debounceQueue.clear();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        this.logger.info(`Processing debounced changes for: ${Array.from(pathsToRescan).join(', ')}`);
        for (const dirPath of pathsToRescan) {
            this.scanAndReport(dirPath).catch(err => {
                this.logger.error(`Error during debounced scan of ${dirPath}:`, err);
            });
        }
    }

    private stopWatching(dirPath: string) {
        const watcher = this.watchedDirectories.get(dirPath);
        if (watcher) {
            watcher.close();
            this.watchedDirectories.delete(dirPath);
            this.detectedFilesCache.delete(dirPath); // Clear cache for this path
            this.logger.info(`Stopped watching ${dirPath}`);
        }
    }

    private async scanAndReport(dirPath: string) {
        this.logger.info(`Scanning directory: ${dirPath} using detectors: ${this.detectors.map(d => d.name).join(', ')}`);

        // Initialize a map to hold current detection results for this path, per detector
        const pathResultsByDetector = new Map<string, Set<string>>();
        this.detectors.forEach(detector => pathResultsByDetector.set(detector.name, new Set<string>()));

        try {
            if (!await this.fileSystem.isDirectory(dirPath)) {
                this.logger.warn(`Path is not a directory or not accessible, skipping scan: ${dirPath}`);
                this.stopWatching(dirPath);
                return;
            }

            for await (const entry of this.fileSystem.find(dirPath, { exclude: ['**/node_modules/**', '**/.git/**'] })) {
                const fullPath = path.resolve(dirPath, entry);
                if (await this.fileSystem.isFile(fullPath)) {
                    for (const detector of this.detectors) {
                        if (await detector.isApplicable(fullPath, dirPath)) {
                            pathResultsByDetector.get(detector.name)!.add(fullPath);
                        }
                    }
                }
            }

            // Get cached results for this path, or an empty map if not cached
            const cachedPathResults = this.detectedFilesCache.get(dirPath) ?? new Map<string, Set<string>>();
            let overallChangesFound = false;

            for (const detector of this.detectors) {
                const currentFiles = pathResultsByDetector.get(detector.name)!;
                const cachedFiles = cachedPathResults.get(detector.name) ?? new Set<string>();

                if (!this.compareSets(cachedFiles, currentFiles)) {
                    overallChangesFound = true;
                    this.logger.info(`Changes detected by '${detector.name}' in ${dirPath}: ${currentFiles.size} files found.`);
                    this.sendToParent({
                        type: 'singleDetectorUpdate',
                        detectorName: detector.name,
                        path: dirPath,
                        files: Array.from(currentFiles)
                    });
                }
            }

            if (overallChangesFound) {
                this.detectedFilesCache.set(dirPath, pathResultsByDetector);
            } else {
                this.logger.info(`Scan of ${dirPath} found no changes across all detectors.`);
            }

        } catch (error) {
            this.logger.error(`Error during scan of ${dirPath}:`, error);
            this.sendToParent({ type: 'error', message: `Error scanning ${dirPath}: ${(error as Error).message}`, stack: (error as Error).stack });
        }
    }

    // Helper to compare two sets of strings
    private compareSets(setA: Set<string>, setB: Set<string>): boolean {
        if (setA.size !== setB.size) {
            return false;
        }
        for (const item of setA) {
            if (!setB.has(item)) {
                return false;
            }
        }
        return true;
    }
}


import * as path from 'path';
import * as fs from 'fs';
import { parentPort } from 'worker_threads';
import registryData from '../../../salesforce/src/registry/metadataRegistry.json';
import { WorkspaceContextScanner } from './workspaceContextScanner';
import type { FileFilterFunction, FileFilterInfo } from './workspaceContextScanner';
import type { WorkspaceContextScanKind } from './workspaceContextWorkerClient';

interface WorkspaceContextWorkerRequest {
    id: number;
    kind: WorkspaceContextScanKind;
    folder: string;
}

interface WorkspaceContextWorkerResponse {
    id: number;
    files?: string[];
    error?: string;
}

const scanners = new Map<WorkspaceContextScanKind, WorkspaceContextScanner>();

function getScanner(kind: WorkspaceContextScanKind) {
    let scanner = scanners.get(kind);
    if (!scanner) {
        scanner = new WorkspaceContextScanner(new WorkerFileSystem(), getFilter(kind), { yieldDelay: 0 });
        scanners.set(kind, scanner);
    }
    return scanner;
}

function getFilter(kind: WorkspaceContextScanKind): FileFilterFunction {
    if (kind == 'datapacks') {
        return createDatapackFilter();
    }
    if (kind == 'metadata') {
        return createMetadataFilter();
    }
    throw new Error(`Unsupported workspace context scan kind: ${kind}`);
}

function createDatapackFilter(): FileFilterFunction {
    const datapacksFoundSymbol = Symbol('@hasDatapacks');

    function isDatapackFile(file: FileFilterInfo | string) {
        return (typeof file !== 'string' ? file.name : file).endsWith('_DataPack.json');
    }

    return file => {
        if (file.siblings[datapacksFoundSymbol]) {
            return true;
        }

        if (file.name.endsWith('_DataPack.json')) {
            file.siblings[datapacksFoundSymbol] = file.fullName;
            return true;
        }

        const datapackFile = file.siblings.find(isDatapackFile);
        if (datapackFile) {
            file.siblings[datapacksFoundSymbol] = datapackFile.fullName;
            return true;
        }

        return false;
    };
}

function createMetadataFilter(): FileFilterFunction {
    const metadataTypes = new Set(Object.keys(registryData.types).map(type => type.toLowerCase()));
    const metadataSuffixes = new Map(Object.entries(registryData.suffixes).map(([suffix, type]) => [
        suffix.toLowerCase(),
        type.toLowerCase()
    ]));

    return file => {
        if (file.name.endsWith('-meta.xml')) {
            return true;
        }
        const metadataType = metadataSuffixes.get(path.extname(file.name).slice(1).toLowerCase());
        if (metadataType && metadataTypes.has(metadataType)) {
            return true;
        }
        return file.siblings.some(f => f.name.endsWith('-meta.xml'));
    };
}

class WorkerFileSystem {
    public readDirectory(folder: string) {
        return fs.promises.readdir(folder, { withFileTypes: true });
    }
}

function postMessage(response: WorkspaceContextWorkerResponse) {
    parentPort?.postMessage(response);
}

parentPort?.on('message', async (request: WorkspaceContextWorkerRequest) => {
    try {
        postMessage({
            id: request.id,
            files: await getScanner(request.kind).getApplicableFiles(request.folder)
        });
    } catch (error) {
        postMessage({
            id: request.id,
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

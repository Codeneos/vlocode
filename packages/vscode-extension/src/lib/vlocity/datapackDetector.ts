import { injectable, FileSystem } from '@vlocode/core';
import * as path from 'path';
import { IFileDetector } from '../detectors/types';

@injectable.singleton()
export class DatapackDetector implements IFileDetector {
    public readonly name = "datapack";

    constructor() {
        // No FileSystem needed for this simple detector yet
    }

    /**
     * Checks if the given file path represents a Vlocity Datapack JSON file.
     * This check is solely based on the file name ending with '_DataPack.json'.
     * @param filePath Absolute path to the file.
     * @param fileSystem FileSystem instance (not used by this detector).
     * @param projectRoot Project root path (not used by this detector).
     * @returns True if the file is a Datapack JSON file, false otherwise.
     */
    public isApplicable(filePath: string, fileSystem?: FileSystem, projectRoot?: string): boolean {
        if (!filePath || typeof filePath !== 'string') {
            return false;
        }
        return path.basename(filePath).endsWith('_DataPack.json');
    }
}
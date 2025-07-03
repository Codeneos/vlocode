import { injectable } from '@vlocode/core';
import * as path from 'path';
import { IFileDetector } from '../types';

@injectable.transient()
export class DatapackDetector implements IFileDetector {
    public readonly name = "datapack";

    constructor() {
        // No FileSystem needed for this simple detector yet
    }

    /**
     * Checks if the given file path represents a Vlocity Datapack JSON file.
     * This check is solely based on the file name ending with '_DataPack.json'.
     * @param filePath Absolute path to the file.
     * @returns True if the file is a Datapack JSON file, false otherwise.
     */
    public isApplicable(filePath: string): boolean {
        if (!filePath || typeof filePath !== 'string') {
            return false;
        }
        return path.basename(filePath).endsWith('_DataPack.json');
    }
}
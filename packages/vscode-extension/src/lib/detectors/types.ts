import type { FileSystem } from '@vlocode/core';

/**
 * Defines the contract for a file detector that can be used by the
 * detection process.
 */
export interface IFileDetector {
    /**
     * A unique name for this detector. This name will be used in IPC messages
     * to identify the source of detected files.
     * Example: "datapack", "salesforceMetadata", "customLwcConfig"
     */
    readonly name: string;

    /**
     * Asynchronously or synchronously checks if a given file path is relevant to this detector.
     *
     * @param filePath The absolute path to the file to check.
     * @param fileSystem An instance of FileSystem for performing any necessary file operations (e.g., reading content, checking siblings).
     * @param projectRoot Optional. The root path of the project containing the file, if known.
     *                    This can be used by detectors that have project-structure-dependent logic.
     * @returns True if the file is relevant to this detector, false otherwise.
     */
    isApplicable(filePath: string, fileSystem: FileSystem, projectRoot?: string): Promise<boolean> | boolean;
}

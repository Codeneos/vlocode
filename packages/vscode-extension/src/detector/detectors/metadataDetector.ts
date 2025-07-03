
import { injectable, FileSystem } from '@vlocode/core';
import { fileSuffix } from '@vlocode/util'; // fileName is not used directly anymore
import { MetadataRegistry } from '@vlocode/salesforce';
import * as path from 'path';
import { IFileDetector } from '../types';

@injectable.singleton()
export class MetadataDetector implements IFileDetector {
    public readonly name = "salesforceMetadata";

    constructor(
        private readonly registry: MetadataRegistry,
        private readonly fs: FileSystem
    ) { }

    /**
     * Checks if the given file path represents a Salesforce metadata file.
     * This can be a -meta.xml file, a file whose suffix is registered in the MetadataRegistry,
     * or a content file that has a corresponding -meta.xml sibling.
     * @param filePath Absolute path to the file.
     * @param fileSystem FileSystem instance (already available via injection as this.fs).
     * @param projectRoot Optional. The root path of the project. If provided, metadata detection might be limited to files within this project.
     * @returns True if the file is considered a metadata file, false otherwise.
     */
    public async isApplicable(filePath: string, projectRoot?: string) {
        // fileSystem parameter is available as this.fs due to constructor injection, so we use this.fs.
        // The projectRoot parameter is available if needed for more complex rules.
        // For now, we only make sure this file is part of the project if projectRoot is passed.
        if (projectRoot && !filePath.startsWith(path.resolve(projectRoot))) {
            // If a projectRoot is specified, only consider files within that project.
            // This check might be too simple if filePath is a relative path fragment from fs.watch
            // However, detectionProcess.ts resolves it to an absolute path.
            return false;
        }

        if (!filePath || typeof filePath !== 'string') {
            return false;
        }

        const name = path.basename(filePath);

        // 1. Is it a -meta.xml file itself?
        if (name.endsWith('-meta.xml')) {
            return true;
        }

        // 2. Is it a known metadata type by suffix? (e.g. .object, .layout)
        //    This usually covers metadata types that don't have a separate -meta.xml file.
        const suffix = fileSuffix(name);
        if (suffix) {
            const metadataInfo = this.registry.getMetadataTypeBySuffix(suffix);
            if (metadataInfo) {
                return true;
            }
        }

        // 3. Is it a content file with a sibling -meta.xml file? (e.g. MyClass.cls and MyClass.cls-meta.xml)
        //    Use the injected this.fs for pathExistsSync.
        if (await this.fs.pathExists(filePath + '-meta.xml')) {
            return true;
        }

        return false;
    }
}
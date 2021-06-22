
import { FileFilterFunction } from 'lib/workspaceContextDetector';
import { MetadataRegistry } from 'lib/salesforce/metadataRegistry';
import { container, injectable } from 'lib/core';
import { fileSuffix } from 'lib/util/fs';

@injectable()
export class MetadataDetector {
    constructor(private readonly registry: MetadataRegistry) {
    }

    public isMetadataFile(fileName: string) {
        if (fileName.endsWith('-meta.xml')) {
            return true;
        }
        const suffix = fileSuffix(fileName);
        if (suffix) {
            return this.registry.isMetadataSuffix(suffix);
        }
        return false;
    }

    public static filter(): FileFilterFunction {
        const detector = container.get(MetadataDetector);
        return detector.isMetadataFile.bind(detector);
    }
}
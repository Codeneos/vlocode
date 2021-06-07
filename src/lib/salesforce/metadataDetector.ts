import { substringAfterLast } from 'lib/util/string';
import { FileFilterFunction } from 'lib/workspaceContextDetector';
import { MetadataRegistry } from 'lib/salesforce/metadataRegistry';
import { singleton } from 'lib/util/singleton';

export class MetadataDetector{
    constructor(private readonly registry: MetadataRegistry = singleton(MetadataRegistry)) {
    }

    public getFilter() : FileFilterFunction {
        return (fileName: string) => {
            if (fileName.endsWith('-meta.xml')) {
                return true;
            }
            const suffix = substringAfterLast(fileName, '.');
            if (suffix) {
                return this.registry.isMetadataSuffix(suffix);
            }
            return false;
        };
    }
}
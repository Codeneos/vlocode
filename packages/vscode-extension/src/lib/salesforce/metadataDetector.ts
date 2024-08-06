
import { FileFilterFunction, FileFilterInfo } from '../../lib/workspaceContextDetector';
import { container, injectable } from '@vlocode/core';
import { fileSuffix, directoryName, fileName } from '@vlocode/util';
import { MetadataRegistry } from '@vlocode/salesforce';

@injectable.singleton()
export class MetadataDetector {
    constructor(private readonly registry: MetadataRegistry) {
    }

    public isMetadataFile(file: FileFilterInfo | string) {
        if (typeof file === 'string') {
            return this.isMetadataFile({ fullName: file, folderName: directoryName(file), name: fileName(file), siblings: new Array<any>() } as FileFilterInfo);
        }
        if (file.name.endsWith('-meta.xml')) {
            return true;
        }
        const metadataInfo = this.registry.getMetadataTypeBySuffix(fileSuffix(file.name));
        if (metadataInfo) {
            return true;
        }
        return file.siblings.some(f => {
            if (f.name.endsWith('-meta.xml')) {
                return true;
            }
            return false;
        });
    }

    public static filter(): FileFilterFunction {
        const detector = container.get(MetadataDetector);
        return detector.isMetadataFile.bind(detector);
    }
}
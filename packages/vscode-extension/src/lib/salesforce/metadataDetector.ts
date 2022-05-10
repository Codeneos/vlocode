
import { FileFilterFunction, FileFilterInfo } from '@lib/workspaceContextDetector';
import { container, injectable } from '@vlocode/core';
import { fileSuffix, directoryName, fileName } from '@vlocode/util';
import { MetadataRegistry } from '@vlocode/salesforce';

@injectable()
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
            const siblingType = this.registry.getMetadataTypeBySuffix(fileSuffix(f.name));
            if (siblingType?.isBundle) {
                // Aura/LWC
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
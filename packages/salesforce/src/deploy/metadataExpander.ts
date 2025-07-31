import path from 'path';
import { SalesforcePackageComponentFile } from './package';
import { outputFile } from 'fs-extra';
import { MetadataRegistry, MetadataType } from '../metadataRegistry';
import { injectable } from '@vlocode/core';
import { asArray, XML } from '@vlocode/util';

interface MetadataFile extends SalesforcePackageComponentFile {
    read(): Promise<Buffer>;
}

interface OutputFile {
    ( name: string, data: Buffer ): Promise<void>;
}

@injectable()
export class MetadataExpander {
    public constructor(private metadataRegistry: MetadataRegistry) {
    }

    public async expandMetadata(metadata: MetadataFile): Promise<Record<string, Buffer>> {
        const metadataContent = await metadata.read();
        const type = this.metadataRegistry.getMetadataType(metadata.componentType);

        if (type?.childXmlNames.length) {
            return this.expandMetadataChildren(metadata.componentName, type, XML.parse(metadataContent));
        }

        const basename = decodeURIComponent(path.basename(metadata.packagePath));
        const appendMetaXml = this.shouldAppendMetaXml(metadata.packagePath, metadataContent);        
        const expandedName = appendMetaXml ? `${basename}-meta.xml` : basename;
        return {
            [expandedName]: metadataContent
        };
    }

    private expandMetadataChildren(name: string, type: MetadataType, metadata: object): Record<string, Buffer> {
        const expandedMetadata: Record<string, Buffer> = {};

        for (const childType of Object.values(type.children?.types ?? {})) {
            const childContent = metadata[type.name][childType.directoryName];
            for (const childItem of asArray(childContent ?? [])) {
                const childName = childItem.fullName;
                const childFileName = path.posix.join(name, childType.directoryName, `${childName}.${childType.suffix}-meta.xml`);
                expandedMetadata[childFileName] = Buffer.from(XML.stringify({ [childType.name]: childItem}, 4));
            }

            if (childContent) {
                delete metadata[type.name][childType.directoryName];
            }
        }

        const parentFileName = path.posix.join(name, `${name}.${type.suffix}-meta.xml`);
        expandedMetadata[parentFileName] = Buffer.from(XML.stringify({ [type.name]: metadata[type.name]}, 4));

        return expandedMetadata;
    }

    public async saveExpandedMetadata(metadata: MetadataFile, destinationPath: string, options?: { outputFile?: OutputFile }): Promise<void> {
        const expandedMetadata = await this.expandMetadata(metadata);
        for (const [fileName, content] of Object.entries(expandedMetadata)) {
            const filePath = path.join(destinationPath, fileName);
            (options?.outputFile ?? outputFile)(filePath, content)
        }
    }

    private shouldAppendMetaXml(fileName: string, body: Buffer) {
        if (fileName.endsWith('.xml')) {
            return false;
        }
        // Check if the body starts with XML declaration
        const bodyString = body.toString('utf8', 0, Math.min(100, body.length));
        return bodyString.includes('<?xml');
    }
}

import path from 'path';
import { SalesforcePackageComponentFile } from './package';
import { outputFile } from 'fs-extra';
import { MetadataRegistry, MetadataType } from '../metadataRegistry';
import { injectable } from '@vlocode/core';
import { asArray, substringBefore, XML } from '@vlocode/util';
import * as mimeTypes from 'mime-db';

interface MetadataFile extends SalesforcePackageComponentFile {
    content(): Promise<Buffer>;
    metadata(): Promise<(object & { "@type": string }) | undefined>;
}

interface OutputFile {
    ( name: string, data: Buffer ): Promise<void>;
}

@injectable()
export class MetadataExpander {

    public async expandMetadata(metadata: MetadataFile): Promise<Record<string, Buffer>> {
        const content = await metadata.content();
        const type = MetadataRegistry.getMetadataType(metadata.componentType);

        if (type?.childXmlNames.length) {
            return this.expandMetadataChildren(metadata.componentName, type, XML.parse(content));
        }

        const metadataObj = await metadata.metadata();
        if (!metadataObj) {
            return this.expandContentAsMeta(metadata, content);
        }
        
        if (metadataObj['@type'] === 'StaticResource') {
            return this.expandStaticResource(metadata, content, metadataObj);
        }

        return this.expandAsContent(metadata, content);
    }

    private expandStaticResource(metadata: MetadataFile, content: Buffer, meta: object): Record<string, Buffer> {
        const basename = this.baseName(metadata.packagePath);
        const contentType = meta['contentType']?.toLowerCase();
        const mimeType = mimeTypes[contentType];
        const suffix = mimeType?.extensions?.[0] || 'resource';
        return {
            [`${basename}.${suffix}`]: content
        };
    }

    private expandContentAsMeta(metadata: MetadataFile, content: Buffer): Record<string, Buffer> {
        const basename = this.baseName(metadata.packagePath);
        const appendMetaXml = this.shouldAppendMetaXml(metadata.packagePath, content);        
        const expandedName = appendMetaXml ? `${basename}-meta.xml` : basename;
        return {
            [expandedName]: content
        };
    }

    private expandAsContent(metadata: MetadataFile, content: Buffer): Record<string, Buffer> {
        const basename = this.baseName(metadata.packagePath);
        return {
            [basename]: content
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

    private baseName(packagePath: string, removeSuffix?: boolean): string {
        const basename = decodeURIComponent(path.basename(packagePath))
        return removeSuffix ? substringBefore(basename, '.') : basename;
    }
}

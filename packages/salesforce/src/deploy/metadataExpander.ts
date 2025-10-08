import path from 'path';
import { SalesforcePackageComponentFile } from './package';
import { outputFile } from 'fs-extra';
import { MetadataRegistry, MetadataType } from '../metadataRegistry';
import { injectable } from '@vlocode/core';
import { asArray, count, substringBefore, XML } from '@vlocode/util';
import * as mimeTypes from 'mime-db';

interface MetadataFile extends SalesforcePackageComponentFile {
    content(): Promise<Buffer>;
    metadata(): Promise<object | undefined>;
}

interface OutputFile {
    ( name: string, data: Buffer ): Promise<void>;
}

@injectable()
export class MetadataExpander {

    public async expandMetadata(metadata: MetadataFile): Promise<Record<string, Buffer>> {
        const content = await metadata.content();
        const metadataObj = await metadata.metadata();
        const type = MetadataRegistry.getMetadataType(metadata.componentType);

        if (type?.childXmlNames.length) {
            return this.expandMetadataChildren(metadata.componentName, type, content);
        }

        if (type?.name === 'StaticResource') {
            return metadataObj ? this.expandStaticResource(metadata, content, metadataObj) : {};
        }

        return this.expandContent(metadata, content);
    }

    private expandStaticResource(metadata: MetadataFile, content: Buffer, meta: object): Record<string, Buffer> {
        const basename = this.baseName(metadata.packagePath, true);
        const contentType = meta['contentType']?.toLowerCase();
        const mimeType = mimeTypes[contentType];
        const suffix = mimeType?.extensions?.[0] || 'resource';
        const metaXml = XML.stringify({ StaticResource: meta }, { indent: 4, attributePrefix: '@attributes' });
        return {
            [`${basename}.${suffix}`]: content,
            [`${basename}.${suffix}-meta.xml`]: Buffer.from(metaXml)
        };
    }
    
    private expandContent(metadata: MetadataFile, content: Buffer): Record<string, Buffer> {
        const basename = this.baseName(metadata.packagePath);
        const appendMetaXml = this.shouldAppendMetaXml(metadata.packagePath, content);        
        const expandedName = appendMetaXml ? `${basename}-meta.xml` : basename;
        return {
            [expandedName]: content
        };
    }

    private expandMetadataChildren(name: string, type: MetadataType, content: Buffer): Record<string, Buffer> {
        const attributeNode = '$';
        const metadata = XML.parse(content, { attributeNode });
        const expandedMetadata: Record<string, Buffer> = {};

        if (!type.children) {
            throw new Error(`Metadata type ${type.name} does not have child types defined`);
        }

        for (const [childNode, childTypeId] of Object.entries(type.children.directories ?? {})) {
            const childType = type.children.types[childTypeId];
            const childContent = metadata[type.name][childNode];
            for (const childItem of asArray(childContent ?? [])) {
                const childName = childType.uniqueIdElement ? childItem[childType.uniqueIdElement] : childItem.fullName;
                if (!childName) {
                    throw new Error(`Missing unique identifier for child type ${childType.name} in metadata ${type.name}`);
                }
                const childFileName = path.posix.join(name, childType.directoryName, `${childName}.${childType.suffix}-meta.xml`);
                const childXml = XML.stringify(
                    { 
                        [childType.name]: {
                            ...childItem,
                            [attributeNode]: {
                                xmlns: MetadataRegistry.xmlNamespace,
                                ...metadata[attributeNode]
                            }
                        }                        
                    }, 
                    {
                        indent: 4,
                        attributePrefix: attributeNode
                    }
                );
                expandedMetadata[childFileName] = Buffer.from(childXml);
            }

            if (childContent) {
                delete metadata[type.name][childNode];
            }
        }

        const isParentEmpty = count(Object.keys(metadata[type.name]), key => key != '$') === 0;
        if (!isParentEmpty) {
            // Do not include parent metadata if it has no children
            const parentFileName = path.posix.join(name, `${name}.${type.suffix}-meta.xml`);
            expandedMetadata[parentFileName] = Buffer.from(XML.stringify({ [type.name]: metadata[type.name]}, 4));
        }
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

import path from 'path';
import { SalesforcePackageComponentFile } from './package';
import { outputFile } from 'fs-extra';

interface MetadataFile extends SalesforcePackageComponentFile {
    read(): Promise<Buffer>;
}

interface OutputFile {
    ( name: string, data: Buffer ): Promise<void>;
}

export class MetadataExpander {
    public constructor() {
    }

    public async expandMetadata(metadata: MetadataFile): Promise<Record<string, Buffer>> {
        const expandedMetadata: Record<string, Buffer> = {};

        const metadataContent = await metadata.read();
        const basename = decodeURIComponent(path.basename(metadata.packagePath));

        const appendMetaXml = this.shouldAppendMetaXml(metadata.packagePath, metadataContent);        
        const expandedName = appendMetaXml ? `${basename}-meta.xml` : basename;

        expandedMetadata[expandedName] = metadataContent;
        
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

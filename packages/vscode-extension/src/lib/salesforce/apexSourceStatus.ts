import type { TextDocument } from 'vscode';
import { cache } from '@vlocode/util';
import { injectable } from '@vlocode/core';
import { crc32 } from 'zlib';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';

export type ApexSourceStatusType = "synced" | "modified" | "new";

export interface ApexClassInfo {
    readonly id: string;
    readonly name: string;
    readonly namespacePrefix?: string;
    readonly lengthWithoutComments: number;
    readonly bodyCrc: number;
    body(): Promise<string | undefined>;
    status(document: string | TextDocument): Promise<ApexSourceStatusType>;
    converage(): Promise<ApexTestCoverage | undefined>;
}

export interface ApexTestCoverage {
    readonly coveredLines: number[];
    readonly uncoveredLines: number[];
}
    
@injectable()
/**
 * Provides functionality to check the status of Apex source files in relation to their state in a Salesforce org.
 * The status can be "synced", "modified", or "new" based on CRC comparison.
 * Integrates with SalesforceConnectionProvider to fetch Apex class information from the org.
 * Utilizes caching to optimize repeated org metadata lookups.
 *
 * @remarks
 * - Intended for use within the Vlocode VSCode extension.
 * 
 * @example
 * const apexSourceStatus = container.get(ApexSourceStatus);
 * const status = await apexSourceStatus.status(document, 'MyApexClass');
 */
export class ApexSourceStatus {

    /**
     * Regular expression to match the class name in an Apex class file.
     */
    public static readonly CLASS_NAME_REGEX = /^[a-z ]*class ([a-z0-9]+)/im;

    public constructor(private readonly connectionProvider: SalesforceConnectionProvider) {
    }

    /**
     * Extracts the class name from the provided document if it is an Apex class file.
     * @param document - The text document to extract the class name from.
     * @returns An object containing the class name and its range in the document, or undefined if not an Apex class file.
     */
    public classNameFromDocument(document: TextDocument) {
        if (!document.uri.path.endsWith('.cls')) {
            return;
        }

        for (let i = 0; i < Math.min(document.lineCount, 30); i++) {
            const line = document.lineAt(i);
            const match = line.text.match(ApexSourceStatus.CLASS_NAME_REGEX);
            if (match) {
                return { range: line.range, className: match[1] }
            }
        }
    }

    public className(document: string | TextDocument) {
        if (typeof document !== 'string') {
            document = document.getText();
        } 
        const match = document.match(ApexSourceStatus.CLASS_NAME_REGEX);
        return match?.[1];
    }

    public isApexClass(document: string | TextDocument) {
        return this.className(document);
    }
    
    private isCrcMatch(classBody: string, expectedCrc: number) {
        if (crc32(Buffer.from(classBody, 'utf8')) >>> 0 === expectedCrc) {
            return true;
        }

        const normalizedText = classBody
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();
            
        return crc32(Buffer.from(normalizedText, 'utf8')) >>> 0 === expectedCrc;
    }
    
    /**
     * Gets the synchronization status of the Apex class represented by the provided document.
     * The status can be "synced", "modified", or "new".
     * @param document - The text document representing the Apex class.
     * @param className - The name of the Apex class.
     * @returns A promise that resolves to the synchronization status of the Apex class.
     */
    @cache({ ttl: 30 })
    public async classStatus(document: TextDocument | string) : Promise<"synced" | "modified" | "new"> {
        const className = this.className(document);
        if (!className) {
            throw new Error('Document is not an Apex class');
        }
        const orgClassInfo = await this.classInfo(className);
        if (!orgClassInfo) {
            return 'new';
        }
        const crcMatch = this.isCrcMatch(
            typeof document === 'string' ? document : document.getText(), 
            orgClassInfo.bodyCrc
        );
        return crcMatch ? 'synced' : 'modified';
    }

    /**
     * Gets information about the specified Apex class or classes from the Salesforce org.
     * @param apexClassName - The name of the Apex class or an array of class names.
     * @returns A promise that resolves to the Apex class information or an array of Apex class information
     */
    public async classInfo(apexClassName: string) : Promise<ApexClassInfo>;
    public async classInfo(apexClassName: string[]) : Promise<ApexClassInfo[]>;
    public async classInfo(apexClassName: string | string[]) : Promise<ApexClassInfo[] | ApexClassInfo> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const records: any[] = await connection.tooling.sobject('ApexClass').find(
            { Name: Array.isArray(apexClassName) ? apexClassName : [ apexClassName ] },
            [ 'Id', 'Name', 'BodyCrc', 'LengthWithoutComments', 'NamespacePrefix', 'ApiVersion' ]
        );
        const apexClassInfo = records.map(record => ({
            id: record.Id,
            name: record.Name,
            namespacePrefix: record.NamespacePrefix,
            lengthWithoutComments: record.LengthWithoutComments,
            bodyCrc: record.BodyCrc,
            body: () => this.classBody(record.Name),
            status: (document: string | TextDocument) => this.classStatus(document),
            converage: () => this.codeCoverage(record.Name)
        }));
        return Array.isArray(apexClassName) ? apexClassInfo : apexClassInfo[0];
    }

    /**
     * Retrieves the body of the specified Apex class from the Salesforce org.
     * @param apexClassName - The name of the Apex class.
     * @returns The body of the Apex class.
     */
    public async classBody(apexClassName: string) : Promise<string> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const record: any = await connection.tooling.sobject('ApexClass').findOne(
            { Name: apexClassName },
            [ 'Body' ]
        );
        return record?.Body;
    }

    public async codeCoverage(apexClassName: string) : Promise<ApexTestCoverage | undefined>
    public async codeCoverage(apexClassName: string[]) : Promise<ApexTestCoverage[]>
    public async codeCoverage(apexClassName: string | string[]) : Promise<ApexTestCoverage | undefined | ApexTestCoverage[]> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const records: { Coverage: ApexTestCoverage, ApexClassOrTrigger: { Name: string } }[] = 
            await connection.tooling.sobject('ApexCodeCoverageAggregate').find(
                { 'ApexClassOrTrigger.Name': Array.isArray(apexClassName) ? apexClassName : [ apexClassName ] },
                [ 'Coverage', 'ApexClassOrTrigger.Name' ]
            );

        // Map the results to to class name and remove
        // any records that do not have any coverage details
        const results = new Map<string, ApexTestCoverage>(
            records
                .filter(record =>
                    record.Coverage.coveredLines?.length &&
                    record.Coverage.uncoveredLines?.length
                )
                .map(record => [
                    record.ApexClassOrTrigger.Name.toLowerCase(), 
                    record.Coverage as ApexTestCoverage
                ])
        );

        if (!Array.isArray(apexClassName)) {
            return results.get(apexClassName.toLowerCase())!;
        }
        return apexClassName.map(name => results.get(name.toLowerCase())!);
    }
}
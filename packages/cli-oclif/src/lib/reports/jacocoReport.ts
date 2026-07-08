import { fileName, XML } from '@vlocode/util';
import path from 'path';

/**
 * Per-class Apex code coverage in the shape this report consumes: a line-number map where
 * `1` = covered and `0` = not covered, plus aggregate totals.
 */
export interface SalesforceApexCodeCoverageRecord {
    id: string;
    name: string;
    totalLines: number;
    lines: Record<string, 0 | 1>;
    totalCovered: number;
    coveredPercent: number;
}

/**
 * Internal interface representing a line coverage information in JaCoCo format
 */
interface JacocoLineCoverage {
    /**
     * Line number
     */
    lineNumber: number;
    /**
     * Missed instruction count (1 if not covered, 0 if covered)
     */
    missedInstructions: number;
    /**
     * Covered instruction count (0 if not covered, 1 if covered)
     */
    coveredInstructions: number;
    /**
     * Missed branches (always 0 in our implementation)
     */
    missedBranches: number;
    /**
     * Covered branches (always 0 in our implementation)
     */
    coveredBranches: number;
}

/**
 * Internal interface representing a class coverage in JaCoCo format
 */
interface JacocoClassCoverage {
    /**
     * JaCoCo class name in path notation without file extension
     */
    className: string;
    /**
     * Original Salesforce class or trigger name
     */
    salesforceName: string;
    /**
     * Package path in JaCoCo notation
     */
    packageName: string;
    /**
     * Source filename
     */
    sourceFilename: string;
    /**
     * Coverage information for each line
     */
    lines: JacocoLineCoverage[];
    /**
     * Original identifier (for reference)
     */
    originalId?: string;
}

interface TestSessionInfo {
    id: string;
    startTime: Date;
    endTime: Date;
}

interface JacocoCounter {
    type: 'INSTRUCTION' | 'BRANCH' | 'LINE' | 'COMPLEXITY' | 'METHOD' | 'CLASS';
    missed: number;
    covered: number;
}

/**
 * Class for generating JaCoCo XML reports from Salesforce Apex code coverage records
 */
export class JacocoReport {
    private records: JacocoClassCoverage[] = [];
    private reportName: string;
    private session: TestSessionInfo = { id: '', startTime: new Date(), endTime: new Date() };
    
    /**
     * Creates a new JacocoReport instance
     * @param reportName Optional custom name for the report
     */
    constructor(reportName?: string, info?: Partial<TestSessionInfo>) {
        this.reportName = reportName || 'Salesforce JaCoCo Coverage';
        info && this.sessionInfo(info);
    }

    /**
     * Updates the current session information with the provided partial `TestSessionInfo` object.
     * 
     * @param info - An object containing one or more properties of `TestSessionInfo` to update the session with.
     * @returns The current instance for method chaining.
     */
    public sessionInfo(info: Partial<TestSessionInfo>) {
        for (const [key, value] of Object.entries(info)) {
            if (value !== undefined) {
                // @ts-ignore
                this.session[key] = value;
            }
        }
        return this;
    }
    
    /**
     * Add Salesforce code coverage records to the report
     * @param records Array of Salesforce code coverage records
     * @returns The current JacocoReport instance for chaining
     */
    public addCoverageRecords(records: SalesforceApexCodeCoverageRecord[]): JacocoReport {
        for (const record of records) {
            this.records.push(this.convertToJacocoFormat(record));
        }
        return this;
    }

    /**
     * Convert from Salesforce format to JaCoCo internal format
     * @param record Salesforce code coverage record
     * @returns JaCoCo format class coverage record
     */    
    private convertToJacocoFormat(record: SalesforceApexCodeCoverageRecord): JacocoClassCoverage {
        const lines = this.convertLines(record.lines);
        const sourceFilename = `${record.name}.cls`;

        return {
            className: this.toClassName(sourceFilename),
            salesforceName: record.name,
            packageName: '',
            sourceFilename,
            lines,
            originalId: record.id
        };
    }
    
    /**
     * Manually add test coverage for a class
     * @param className Name of the class
     * @param lines Coverage mapping of line numbers to coverage status (1 = covered, 0 = not covered)
     * @returns The current JacocoReport instance for chaining
     */    
    public addClassCoverage(
        className: string,
        lines: Record<string, 0 | 1 | boolean | string | number>,
        options?: { id?: string }
    ): JacocoReport {
        const jacocoLines = this.convertLines(lines);
        const sourceFilename = `${className}.cls`;
        
        this.records.push({
            className: this.toClassName(sourceFilename),
            salesforceName: className,
            packageName: '',
            sourceFilename,
            lines: jacocoLines,
            originalId: options?.id || className
        });
        
        return this;
    }
    
    /**
     * Generates the JaCoCo XML report
     * @returns XML string representation of the JaCoCo report
     */
    public getReport(): string {
        const packageRecords = new Map<string, JacocoClassCoverage[]>();
        for (const record of this.records) {
            const packageName = record.packageName;
            const existing = packageRecords.get(packageName) ?? [];
            existing.push(record);
            packageRecords.set(packageName, existing);
        }

        const packages = [...packageRecords.entries()].map(([packageName, records]) => {
            const packageCounters = this.sumCounters(records.map(record => this.getRecordCounters(record)));
            return {
                $: { name: packageName },
                class: records.map(record => ({
                    $: {
                        name: record.className,
                        sourcefilename: record.sourceFilename
                    },
                    counter: this.toXmlCounters(this.getRecordCounters(record, this.getClassCoverageCounter(record)))
                })),
                sourcefile: records.map(record => ({
                    $: {
                        name: record.sourceFilename
                    },
                    line: record.lines.map(line => ({
                        $: {
                            nr: line.lineNumber,
                            mi: line.missedInstructions,
                            ci: line.coveredInstructions,
                            mb: line.missedBranches,
                            cb: line.coveredBranches
                        }
                    })),
                    counter: this.toXmlCounters(this.getRecordCounters(record))
                })),
                counter: this.toXmlCounters(packageCounters)
            };
        });

        const reportCounters = this.sumCounters(this.records.map(record => this.getRecordCounters(record, this.getClassCoverageCounter(record))));
        const jacocoJson = {
            report: {
                $: { 
                    name: this.reportName 
                },
                sessioninfo: {
                    $: {
                        id: this.session.id,
                        start: (this.session.startTime.getTime() / 1000).toFixed(0),
                        dump: (this.session.endTime.getTime() / 1000).toFixed(0)
                    }
                },
                package: packages,
                counter: this.toXmlCounters(reportCounters)
            }
        };
        
        return XML.stringify(jacocoJson, { indent: 4, headless: false });
    }
    
    /**
     * Gets all the coverage records converted back to Salesforce format
     * @returns Array of SalesforceApexCodeCoverageRecord objects
     */
    public getCoverageRecords(): SalesforceApexCodeCoverageRecord[] {
        return this.records.map(record => {
            const lines: Record<string, 0 | 1> = {};
            let totalCovered = 0;
              for (const line of record.lines) {
                const lineNumber = line.lineNumber.toString();
                const covered = line.coveredInstructions === 1 ? 1 : 0;
                
                lines[lineNumber] = covered;
                if (covered === 1) {
                    totalCovered++;
                }
            }
            
            const totalLines = record.lines.length;
            
            return {
                id: record.originalId || record.salesforceName,
                name: record.salesforceName,
                totalLines,
                lines,
                totalCovered,
                coveredPercent: totalLines > 0 ? (totalCovered / totalLines) * 100 : 0
            };
        });
    }

    /**
     * This method resolves the source file path of each record to a relative provide sources path. It searches the path and nested folders 
     * for the source file and updates the record's `sourceFilename` property.
     * 
     * @param sourcesFiles - An array of source file paths to resolve against.
     * @return The current JacocoReport instance for chaining.
     */
    public resolveSourceFilePaths(sourcesFiles: string[], workspaceRoot?: string): JacocoReport {
        const filesByName = new Map(
            sourcesFiles
                .map(file => [
                    fileName(file).toLowerCase(),
                    file
                ])
        );

        for (const record of this.records) {
            const sourcePath = filesByName.get(fileName(record.sourceFilename).toLowerCase());
            if (sourcePath) {
                const relativeSourcePath = workspaceRoot ? path.relative(workspaceRoot, sourcePath) : sourcePath;
                const normalizedSourcePath = this.normalizePath(relativeSourcePath);
                const sourceDirectory = path.posix.dirname(normalizedSourcePath);

                record.sourceFilename = path.posix.basename(normalizedSourcePath);
                record.packageName = sourceDirectory === '.' ? '' : sourceDirectory;
                record.className = this.toClassName(normalizedSourcePath);
            }
        }
        return this;
    }

    private convertLines(lines: Record<string, 0 | 1 | boolean | string | number>): JacocoLineCoverage[] {
        return Object.entries(lines)
            .map(([lineStr, covered]) => {
                const lineNumber = parseInt(lineStr, 10);
                const normalizedCoverage = this.normalizeCoverageValue(covered);

                return Number.isFinite(lineNumber) && lineNumber > 0
                    ? {
                        lineNumber,
                        missedInstructions: normalizedCoverage === 1 ? 0 : 1,
                        coveredInstructions: normalizedCoverage === 1 ? 1 : 0,
                        missedBranches: 0,
                        coveredBranches: 0
                    }
                    : undefined;
            })
            .filter((line): line is JacocoLineCoverage => !!line)
            .sort((a, b) => a.lineNumber - b.lineNumber);
    }

    private normalizeCoverageValue(value: unknown): 0 | 1 {
        if (typeof value === 'number') {
            return value > 0 ? 1 : 0;
        }

        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }

        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (!normalized || normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'uncovered') {
                return 0;
            }

            if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'covered') {
                return 1;
            }

            const numericValue = Number(normalized);
            if (!Number.isNaN(numericValue)) {
                return numericValue > 0 ? 1 : 0;
            }
        }

        return 0;
    }

    private toClassName(sourcePath: string): string {
        return this.normalizePath(sourcePath).replace(/\.[^.]+$/, '');
    }

    private normalizePath(filePath: string): string {
        return filePath.replaceAll(path.sep, path.posix.sep);
    }

    private getRecordCounters(record: JacocoClassCoverage, ...extraCounters: JacocoCounter[]): JacocoCounter[] {
        const coveredLines = record.lines.filter(line => line.coveredInstructions > 0).length;
        const missedLines = record.lines.filter(line => line.missedInstructions > 0).length;

        return [
            {
                type: 'INSTRUCTION',
                missed: missedLines,
                covered: coveredLines
            },
            {
                type: 'LINE',
                missed: missedLines,
                covered: coveredLines
            },
            ...extraCounters
        ];
    }

    private getClassCoverageCounter(record: JacocoClassCoverage): JacocoCounter {
        const hasCoveredLines = record.lines.some(line => line.coveredInstructions > 0);
        return {
            type: 'CLASS',
            missed: hasCoveredLines ? 0 : 1,
            covered: hasCoveredLines ? 1 : 0
        };
    }

    private sumCounters(counterSets: JacocoCounter[][]): JacocoCounter[] {
        const counters = new Map<JacocoCounter['type'], JacocoCounter>();

        for (const counterSet of counterSets) {
            for (const counter of counterSet) {
                const existing = counters.get(counter.type);
                if (existing) {
                    existing.missed += counter.missed;
                    existing.covered += counter.covered;
                } else {
                    counters.set(counter.type, { ...counter });
                }
            }
        }

        return [...counters.values()];
    }

    private toXmlCounters(counters: JacocoCounter[]) {
        return counters.map(counter => ({
            $: {
                type: counter.type,
                missed: counter.missed,
                covered: counter.covered
            }
        }));
    }
}

import { hash } from 'node:crypto';
import { ILogger, LogManager, FileSystem, NodeFileSystem, injectable, LifecyclePolicy, container } from "@vlocode/core";
import { AwaitableAsyncGenerator, pluralize, spreadAsync, stringEqualsIgnoreCase, Timer, unique } from "@vlocode/util";
import { Parser } from "./parser";
import { ApexClass, ApexCompilationUnit, ApexInterface, ApexTrigger } from "./types";
import path from "path";
import { TestIdentifier } from "./testIdentifier";
import { EventEmitter } from 'node:events';

interface ParserTypes { 
    ['class']: ApexClass,
    ['trigger']: ApexTrigger,
    ['interface']: ApexInterface,
}

type ApexParsedFileInfoBase<T extends keyof ParserTypes> = { 
    name: string;
    file: string; 
    type: T;
    body: ParserTypes[T];
} 

export interface ApexParsedClassInfo extends ApexParsedFileInfoBase<'class'> {
    isClass: true,
    isInterface: false,
    isTrigger: false,
    isAbstract: boolean,
    isTest: boolean,
    /** Class names that are being referenced by this APEX class. Excludes known system types. */
    references: string[],
}

export interface ApexParsedInterfaceInfo extends ApexParsedFileInfoBase<'interface'>{
    isClass: false,
    isInterface: true,
    isTrigger: false,
}

export interface ApexParsedTriggerInfo extends ApexParsedFileInfoBase<'trigger'>{   
    isClass: false,
    isInterface: false,
    isTrigger: true,
    /** Class names that are being referenced by this APEX class. Excludes known system types. */
    references: string[],
}

export type ApexParsedFileInfo = ApexParsedClassInfo | ApexParsedTriggerInfo | ApexParsedInterfaceInfo;

interface ApexCacheFile {
    version: 1;
    parserCache: Record<string, ApexParsedFileInfo & {
        hash: string
    }>;
    classToFileMap: Record<string, string>;
    fileTimes: Record<string, { mtime: number, size: number }>;
}

@injectable({ lifecycle: LifecyclePolicy.singleton })
export class Apex extends EventEmitter<{
    /**
     * Triggered when a new file is parsed into the APEX Parser File Cache
     */
    parse: [ ApexParsedFileInfo ],
    /**
     * Triggered when teh cache is cleared/invalidated
     */
    clear: [],
    /**
     * Triggered when an parsing error occurs.
     */
    error: [ Error ]
}> {

    private parsingTimeCounter = 0;

    /**
     * Cached of parsed APEX classes keyed by the file path
     */
    private parserCache: Record<string, ApexParsedFileInfo & {
            hash: string
        }> = {};
    
    /**
     * Maps class names to file paths
     */
    private classToFileMap: Record<string, string> = {};

    /**
     * Stores the last modified time and size of the file for each file in the cache
     * which can be used to determine if the file has changed since it was last parsed.
     */
    private fileTimes: Record<string, { mtime: number, size: number }> = {};


    /**
     * Returns the number of APEX classes that have been parsed.
     */
    public get parsedFileCount() {
        return Object.values(this.parserCache).length;
    }

    /**
     * Returns the total time spent parsing APEX classes in milliseconds.
     */
    public get parsingTimeMs() {
        return this.parsingTimeCounter;
    }

    public constructor(
        private readonly fileSystem: FileSystem = new NodeFileSystem(),
        private readonly logger: ILogger | undefined = LogManager.get(Apex)
    ) { 
        super();
    }
   
    /**
     * Finds the impacted test classes for the given APEX class files.
     *
     * @param apexClassFiles - The list of APEX class file paths to find impacted tests for.
     * @returns A promise that resolves to an array of impacted test class names.
     *
     * This method performs the following steps:
     * 1. Parses the provided APEX class files.
     * 2. Finds and parses all test classes in the same folder as the provided APEX class files.
     * 3. Checks if any of the test classes reference the provided APEX classes.
     * 4. Returns the names of the test classes that reference the provided APEX classes.
     */
    public async findImpactedTests(apexClassFiles: string[], options: { sourceFolder: string, depth?: number }): Promise<string[]> {
        const td = container.get(TestIdentifier);
        await td.loadApexClasses([ options?.sourceFolder ]);
        return td.findImpactedTests(apexClassFiles, { depth: options?.depth });
    }

    /**
     * Finds all implementations of a given interface within the specified source folder.
     *
     * @param interfaceName - The name of the interface to search for implementations.
     * @param options - An object containing the source folder to search within.
     * @param options.sourceFolder - The folder to search for source files.
     * @returns A promise that resolves to an array of objects, each containing the name and file path of a class that implements the specified interface.
     */
    public async findImplementations(interfaceName: string, options: { sourceFolder: string }): Promise<{ name: string, file: string }[]> {
        // Parse all test classes in the same folder as 
        // the classes we are looking for impacted tests for
        const results: { name: string, file: string }[] = [];
        const sourcesFiles = await spreadAsync(this.getSourceFiles([ options.sourceFolder ]))
        this.logger?.verbose(`Found ${sourcesFiles.length} source files`);

        for (const file of sourcesFiles) {
            const classFile = await this.parseSourceFileSafe(file);
            if (!classFile) {
                continue;
            }
            if (classFile.type === 'class') {
                const implRef = classFile.body.implements.find(impl => stringEqualsIgnoreCase(impl.name, interfaceName));
                if (implRef) {
                    results.push({
                        name: classFile.name,
                        file: classFile.file,
                    });
                }
            }
        }

        return results;
    }

    /**
     * Finds and returns a list of classes that extend a given class within a specified source folder.
     *
     * @param className - The name of the class to find extensions of.
     * @param options - An object containing the source folder to search within.
     * @param options.sourceFolder - The folder to search for class files.
     * @returns A promise that resolves to an array of objects, each containing the name and file path of a class that extends the specified class.
     */
    public async findExtended(className: string, options: { sourceFolder: string }): Promise<{ name: string, file: string }[]> {
        // Parse all test classes in the same folder as 
        // the classes we are looking for impacted tests for
        const results: { name: string, file: string }[] = [];
        const sourcesFiles = await spreadAsync(this.getSourceFiles([ options.sourceFolder ]))
        this.logger?.verbose(`Found ${sourcesFiles.length} source files`);

        for (const file of sourcesFiles) {
            const classFile = await this.parseSourceFileSafe(file);
            if (!classFile) {
                continue;
            }
            if (classFile.type === 'class' && classFile.body.extends && stringEqualsIgnoreCase(classFile.body.extends.name, className)) {
                results.push({
                    name: classFile.name,
                    file: classFile.file,
                });
            }
        }

        return results;
    }

    /**
     * Retrieves the source file path for a given class name.
     *
     * @param className - The name of the class to get the source file for.
     * @returns The file path of the source file corresponding to the specified class name.
     */
    public getSourceFile(typeName: string) {
        return this.classToFileMap[typeName.toLowerCase()];
    }

    /**
     * Asynchronously parses source files from the specified folders.
     * 
     * This generator function iterates over each folder and reads the source files within them.
     * For each source file, it parses the file and yields the result if the parsing is successful.
     * 
     * @param folders - An array of folder paths to read source files from.
     * @yields The result of parsing each source file, if the parsing is successful.
     */
    public parseSourcePaths(...paths: string[]): AwaitableAsyncGenerator<ApexParsedFileInfo> {
        return new AwaitableAsyncGenerator(async function*(this: Apex) {
            for await (const file of this.getSourceFiles(paths)) {
                const result = await this.parseSourceFileSafe(file);
                if (result) {
                    yield result;
                }
            }
        }, this);
    }

    /**
     * Parses an Apex source file and returns information about the parsed file.
     * 
     * @param file - The path to the Apex source file to be parsed.
     * @returns A promise that resolves to an `ApexParsedFileInfo` object containing information about the parsed file, or `undefined` if no valid class or interface is found.
     * @throws An error if the file is not found.
     */
    public async parseSourceFile(file: string): Promise<ApexParsedFileInfo> {
        const fileInfo = await this.fileSystem.stat(file, { throws: false });
        if (!fileInfo) {
            throw new Error(`File not found: ${file}`);
        }

        // Check for a cached entry
        const fullPath = await this.fileSystem.realPath(file);
        const fileInfoCache = this.fileTimes[fullPath];

        if (this.parserCache[fullPath] && fileInfoCache?.mtime === fileInfo.mtime && fileInfoCache?.size === fileInfo.size) {
            return this.parserCache[fullPath];
        }

        // Read and parse the file
        const source = await this.fileSystem.readFile(fullPath);
        return this.parseSource(source, fullPath);
    }

    /**
     * Parses the given source buffer and returns the parsed file information.
     * If the file has been parsed before and the hash matches, the cached result is returned.
     * 
     * @param source - The source buffer to parse.
     * @param fullPath - The full path of the source file.
     * @returns A promise that resolves to the parsed file information.
     */
    public parseSource(source: Buffer | string, fullPath: string): ApexParsedFileInfo {
        // Check for a cached entry
        const sourceHash = hash('md5', source, 'hex');
        const parsedFileInfo = this.parserCache[fullPath];
        if (parsedFileInfo && parsedFileInfo.hash === sourceHash) {
            return parsedFileInfo; 
        } 

        // Read and parse the file
        const parseTimer = new Timer();
        const parser = new Parser(source);
        const struct = parser.getCodeStructure();

        this.parsingTimeCounter += parseTimer.stop().elapsed;
        this.logger?.verbose(`Parsed ${fullPath ?? hash} in ${parseTimer.toString('ms')}`);
        return this.storeCompilationUnit(struct, sourceHash, fullPath);
    }

    private storeCompilationUnit(cu: ApexCompilationUnit, hash: string, fullPath: string) {
        const info = Object.assign(
            { hash, file: fullPath }, 
            this.createCacheEntry(cu)
        );
        this.parserCache[fullPath] = info;
        this.emit('parse', info);
        return info;
    }

    private createCacheEntry(cu: ApexCompilationUnit) {
        if (cu.classes[0]) {
            return this.createClassEntry(cu.classes[0]);
        } else if (cu.interfaces[0]) {
            return this.createInterfaceEntry(cu.interfaces[0]);
        } else if (cu.triggers?.[0]) {
            return this.createTriggerEntry(cu.triggers[0]);
        }
    }

    private createClassEntry(cu: ApexClass): Omit<ApexParsedClassInfo, 'file'> {
        return {
            isClass: true,
            isInterface: false,
            isTrigger: false,
            isAbstract: cu.isAbstract === true,
            isTest: cu.isTest === true,
            type: 'class',
            name: cu.name,
            references: [...unique(cu.refs.filter(ref => !ref.isSystemType), ref => ref.name.toLowerCase(), ref => ref.name)],
            body: cu
        };
    }

    private createTriggerEntry(cu: ApexTrigger): Omit<ApexParsedTriggerInfo, 'file'> {
        return {
            isClass: false,
            isInterface: false,
            isTrigger: true,
            type: 'trigger',
            name: cu.name,
            references: [...unique(cu.refs.filter(ref => !ref.isSystemType), ref => ref.name.toLowerCase(), ref => ref.name)],
            body: cu
        };
    }

    private createInterfaceEntry(cu: ApexInterface): Omit<ApexParsedInterfaceInfo, 'file'> {
        return {
            isClass: false,
            isInterface: true,
            isTrigger: false,
            type: 'interface',
            name: cu.name,
            body: cu
        };
    }

    /**
     * Parses the given Apex source file and returns the parsed file information.
     * If an error occurs during parsing, it logs a warning message and returns undefined.
     *
     * @param file - The path to the Apex source file to be parsed.
     * @returns A promise that resolves to the parsed file information, or undefined if parsing fails.
     */
    public async parseSourceFileSafe(file: string): Promise<ApexParsedFileInfo | undefined> {
        try {
            return await this.parseSourceFile(file);
        } catch (e) {
            this.logger?.warn(`Failed to parse ${file}: ${e.message}`);
        }
    }

    /**
     * Clears the cache of parsed APEX classes.
     */
    public clear() {
        this.parserCache = {};
        this.fileTimes = {};
    }

    private async* getSourceFiles(paths: string[], extensions = [ '.cls', '.trigger' ]): AsyncGenerator<string> {
        for (const sourcePath of paths) {
            const stat = await this.fileSystem.stat(sourcePath, { throws: true });
            if (stat.isFile()) {
                if (this.isExtMatch(stat.name, extensions)) {
                    yield stat.name;
                }
            } else {
                yield* this.getSourceFilesInFolder(sourcePath, extensions);
            }
        }
    }

    private async* getSourceFilesInFolder(folder: string, extensions = [ '.cls', '.trigger' ]): AsyncGenerator<string> {
        for (const file of await this.fileSystem.readDirectory(folder)) {
            const fullPath = await this.fileSystem.realPath(path.join(folder, file.name));
            if (file.isDirectory()) {
                yield* this.getSourceFilesInFolder(fullPath);
            }
            if (file.isFile() && this.isExtMatch(file.name, extensions)) {
                yield fullPath;
            }
        }
    }

    private isExtMatch(file: string, extensions: string[]) {
        return extensions.some(ext => file.toLowerCase().endsWith(ext));
    }

    public async persistCache(cacheFile: string) {
        const cache: ApexCacheFile = {
            version: 1,
            parserCache: this.parserCache,
            fileTimes: this.fileTimes,
            classToFileMap: this.classToFileMap,
        };

        const timer = new Timer();
        this.logger?.info(`Persisting APEX parser cache to: ${cacheFile}`);
        try {
            await this.fileSystem.outputFile(cacheFile, Buffer.from(JSON.stringify(cache, undefined, 4)));        
            this.logger?.info(`Persisted ${pluralize('entry', this.parserCache)} to APEX parser cache [${timer.stop().toString('ms')}]`);
        } catch(err) {
            this.logger?.error('Failed to persist APEX cache:', err);
        }
    }

    public async loadCache(cacheFile: string) {
        const timer = new Timer();
        this.logger?.info(`Loading APEX parser cache from: ${cacheFile}`);
        try {
            const cache: ApexCacheFile = JSON.parse(await this.fileSystem.readFileAsString(cacheFile));
            this.parserCache = cache.parserCache;
            this.fileTimes = cache.fileTimes;
            this.classToFileMap = cache.classToFileMap;
            this.logger?.info(`Loaded ${pluralize('entry', this.parserCache)} from APEX parser cache [${timer.stop().toString('ms')}]`);
        } catch(e) {
            this.logger?.warn('Failed to load APEX parser cache:', e);
        }        
    }
}
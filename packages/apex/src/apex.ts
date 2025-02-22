import { ILogger, LogManager, FileSystem, NodeFileSystem } from "@vlocode/core";
import { Parser } from "./parser";
import { bufferIndexOfCaseInsensitive, fileName, spreadAsync, stringEqualsIgnoreCase, Timer, unique } from "@vlocode/util";
import { ApexClass, ApexInterface } from "./types";
import { dirname } from "path";

export type ApexParsedFileInfo = {
    name: string,
    file: string,
} & ({    
    isInterface: false
    isClass: true,
    isAbstract: boolean,
    isTest: boolean,
    refs: string[],
    body: ApexClass,
} | {    
    isInterface: true,
    isClass: false,
    body: ApexInterface,
});

export class Apex {

    private parsingTimeCounter = 0;

    /**
     * Cached of parsed APEX classes keyed by the file path
     */
    private fileCache: Record<string, ApexParsedFileInfo & {
            mtime: number,
            size: number
        }> = {};    
    private classToFileMap: Record<string, string> = {};

    /**
     * Returns the number of APEX classes that have been parsed.
     */
    public get parsedFileCount() {
        return Object.values(this.fileCache).length;
    }

    /**
     * Returns the total time spent parsing APEX classes in milliseconds.
     */
    public get parsingTimeMs() {
        return this.parsingTimeCounter;
    }

    public constructor(
        private readonly fileSystem: FileSystem = new NodeFileSystem(),
        private readonly logger: ILogger | undefined = LogManager.get('apex')
    ) { }
   
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
    public async findImpactedTests(apexClassFiles: string[], options?: { sourceFolder?: string, depth?: number }): Promise<string[]> {
        // Parse APEX classes
        const apexClasses: Record<string, ApexParsedFileInfo> = Object.fromEntries(
            await Promise.all(apexClassFiles.map(async file => [file, await this.parseSourceFileSafe(file)]))
        );
        const apexClassNames = Object.values(apexClasses).map(cls => cls.name);

        if (options?.sourceFolder) {
            this.logger?.verbose(`Parsing source files in: ${options.sourceFolder}`);
        } else {
            this.logger?.verbose(`Parsing sibling source files for: ${apexClassFiles.join(', ')}`);
        }

        // Parse all test classes in the same folder as 
        // the classes we are looking for impacted tests for
        const results = new Set<string>();
        const sourcesFiles = options?.sourceFolder 
            ? await spreadAsync(this.findSourceFiles([ options?.sourceFolder ], '**/*.cls'))
            : await this.findSiblingSources(apexClassFiles, '**/*.cls');
        this.logger?.verbose(`Found ${sourcesFiles.length} source files`);
    
        for (const file of sourcesFiles) {
            this.classToFileMap[fileName(file, true)] = file;
        }

        for (const file of sourcesFiles) {
            if (await this.isTestClass(file)) {
                const testClass = await this.parseSourceFileSafe(file);
                if (!testClass || testClass.isInterface || !this.hasTestMethods(testClass)) {
                    continue;
                }

                // Check if test class has a reference to any of the classes we are looking for
                if (await this.isReferenced(testClass, apexClassNames, options?.depth)) {
                    results.add(testClass.name);
                }
            }
        }

        return [...results];
    }

    private hasTestMethods(apexTest: ApexParsedFileInfo & { isClass: true }) {
        return apexTest.body.methods.some(method => method.isTest);
    }

    private async isReferenced(apexClass: ApexParsedFileInfo & { isClass: true }, classList: string[], depth: number = 0) {
        if (apexClass.refs.some(ref => classList.includes(ref))) {
            return true;
        }

        if (!depth || depth <= 0) {
            return false;
        }

        for (const ref of apexClass.refs) {
            const sourceFile = this.classToFileMap[ref];
            if (!sourceFile) {
                continue;
            }

            const refClass = await this.parseSourceFileSafe(sourceFile);
            if (refClass?.isClass && await this.isReferenced(refClass, classList, depth - 1)) {
                return true;
            }
        }

        return false;
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
        const sourcesFiles = await spreadAsync(this.findSourceFiles([ options.sourceFolder ], '**/*.cls'))
        this.logger?.verbose(`Found ${sourcesFiles.length} source files`);

        for (const file of sourcesFiles) {
            const classFile = await this.parseSourceFileSafe(file);
            if (!classFile) {
                continue;
            }
            if (classFile.isClass) {
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
        const sourcesFiles = await spreadAsync(this.findSourceFiles([ options.sourceFolder ], '**/*.cls'))
        this.logger?.verbose(`Found ${sourcesFiles.length} source files`);

        for (const file of sourcesFiles) {
            const classFile = await this.parseSourceFileSafe(file);
            if (!classFile) {
                continue;
            }
            if (classFile.isClass && classFile.body.extends && stringEqualsIgnoreCase(classFile.body.extends.name, className)) {
                results.push({
                    name: classFile.name,
                    file: classFile.file,
                });
            }
        }

        return results;
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
    public async* parseSourceFiles(folders: string[]) {
        for await (const file of this.findSourceFiles(folders)) {
            const result = await this.parseSourceFile(file);
            if (result) {
                yield result;
            }
        }
    }

    /**
     * Parses an Apex source file and returns information about the parsed file.
     * 
     * @param file - The path to the Apex source file to be parsed.
     * @returns A promise that resolves to an `ApexParsedFileInfo` object containing information about the parsed file, or `undefined` if no valid class or interface is found.
     * @throws An error if the file is not found.
     * 
     * The returned `ApexParsedFileInfo` object contains:
     * - `mtime`: The modification time of the file.
     * - `size`: The size of the file.
     * - `name`: The name of the class or interface.
     * - `file`: The full path to the file.
     * - `isClass`: A boolean indicating if the parsed body is a class.
     * - `isInterface`: A boolean indicating if the parsed body is an interface.
     * - `isAbstract`: A boolean indicating if the class is abstract (only for classes).
     * - `isTest`: A boolean indicating if the class is a test class (only for classes).
     * - `refs`: An array of references found in the class (only for classes).
     * - `body`: The parsed body of the class or interface.
     */
    public async parseSourceFile(file: string): Promise<ApexParsedFileInfo | undefined> {
        const fileInfo = await this.fileSystem.stat(file, { throws: false });
        if (!fileInfo) {
            throw new Error(`File not found: ${file}`);
        }

        const fullPath = await this.fileSystem.realPath(file);
        const key = `${fullPath}:${fileInfo.mtime}:${fileInfo.size}`;

        if (this.fileCache[key]) {
            return this.fileCache[key];
        }

        const parseTimer = new Timer();
        const content = await this.fileSystem.readFile(fullPath);
        const parser = new Parser(content);
        const struct = parser.getCodeStructure();

        this.parsingTimeCounter += parseTimer.stop().elapsed;
        this.logger?.verbose(`Parsed ${file} in ${parseTimer.toString('ms')}`);
        
        const entry = {
            mtime: fileInfo.mtime,
            size: fileInfo.size,
            file: fullPath,
        };

        if (struct.classes[0]) {
            const [ body ] = struct.classes;
            this.fileCache[key] = {
                ...entry,
                name: body.name,
                isClass: true,
                isInterface: false,
                isAbstract: body.isAbstract === true,
                isTest: body.isTest === true,
                refs: [...unique(body.refs.filter(ref => !ref.isSystemType), ref => ref.name.toLowerCase(), ref => ref.name)],
                body: body
            };
        } else if (struct.interfaces[0]) {
            const [ body ] = struct.interfaces;
            this.fileCache[key] = {
                ...entry,
                name: body.name,
                isClass: false,
                isInterface: true,
                body: body
            };
        } else {
            this.logger?.warn(`No valid class or interface defined in in: ${file}`);
            return;
        }

        return this.fileCache[key];
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
    public clearCache() {
        this.fileCache = {};
    }

    private async isTestClass(file: string) {
        const fileInfo = await this.fileSystem.stat(file, { throws: false });
        if (!fileInfo) {
            throw new Error(`File not found: ${file}`);
        }
        const fullPath = await this.fileSystem.realPath(file);
        const key = `${fullPath}:${fileInfo.mtime}:${fileInfo.size}`;
        const cachedEntry = this.fileCache[key];
        if (cachedEntry?.isClass && cachedEntry.isTest) {
            return true;
        }
        const content = await this.fileSystem.readFile(fullPath);
        return bufferIndexOfCaseInsensitive(content, '@isTest') >= 0;
    }

    private async* findSourceFiles(cwds: string[], pattern = '**/*.{cls,trigger}') {
        for (const cwd of cwds) {
            yield* this.fileSystem.find(pattern, { findType: 'file', cwd });
        }
    }

    private async findSiblingSources(files: string[], pattern: string): Promise<string[]> {
        const siblings = new Set<string>();
        for (const file of files) {
            const cwd = dirname(await this.fileSystem.realPath(file));
            if (!cwd) {
                (await spreadAsync(this.fileSystem.find(pattern, { findType: 'file', cwd }))).forEach(siblings.add, siblings);
            }
        }
        return [...siblings];
    }
}
import { Logger, LogManager, FileSystem, container, injectable, LifecyclePolicy } from '@vlocode/core';
import { Timer, stringEqualsIgnoreCase } from '@vlocode/util';
import path from 'path';

import { ApexClass } from './types';
import { Parser } from './parser';

interface ApexClassInfo {
    name: string,
    file: string,
    isAbstract: boolean,
    isTest: boolean,
    classStructure: ApexClass
}

interface ApexTestClassInfo {
    name: string,
    file: string,
    classCoverage: string[],
    testMethods: {
        methodName: string,
        classCoverage: string[]
    }[]
}

/**
 * This class can be used to identify test classes that cover a given Apex class, it
 * does so by parsing the source files and identifying test classes.
 *
 * The class is injectable and depends on the `FileSystem` and `Logger` services. These services can be injected
 * by the dependency injection container see {@link container}
 *
 * @example
 * ```typescript
 * const testIdentifier = container.create(TestIdentifier);
 * await testIdentifier.loadApexClasses([ 'path/to/apex/classes' ]);
 * const testClasses = testIdentifier.getTestClasses('MyClass');
 * ```
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class TestIdentifier {

    /**
     * Full path of the file to the apex class name.
     */
    private fileToApexClass: Map<string, string> = new Map();

    /**
     * Map of Apex class information by name class name (lowercase)
     */
    private apexClassesByName: Map<string, ApexClassInfo> = new Map();

    /**
     * Set of test class names
     */
    private testClasses: Map<string, ApexTestClassInfo> = new Map();

    constructor(
        private fileSystem: FileSystem,
        private logger: Logger = LogManager.get('apex-test-identifier')
    ) {
    }

    /**
     * Loads the Apex classes from the specified folders and populates the testClasses map.
     * 
     * @param folders - An array of folder paths containing the Apex classes.
     * @returns A promise that resolves when the Apex classes are loaded and testClasses map is populated.
     */
    public async loadApexClasses(folders: string[]) {
        const timerAll = new Timer();

        const loadedFiles = await this.parseSourceFiles(folders);
        const testClasses = loadedFiles.filter((info) => info.classStructure.methods.some(method => method.isTest));
        testClasses.forEach(testClass => this.testClasses.set(testClass.name.toLowerCase(), {
            name: testClass.name,
            file: testClass.file,
            classCoverage: testClass.classStructure.methods
                .filter(method => method.isTest)
                .flatMap(method => method.refs.filter(ref => !ref.isSystemType))
                .map(ref => ref.name.toLowerCase()),
            testMethods: testClass.classStructure.methods
                .filter(method => method.isTest)
                .map(method => ({
                    methodName: method.name,
                    classCoverage: method.refs.filter(ref => !ref.isSystemType).map(ref => ref.name.toLowerCase())
                })),
        }));

        this.logger.info(`Loaded ${loadedFiles.length} sources (${testClasses.length} test classes) in ${timerAll.toString('ms')}`);
    }

    /**
     * Retrieves the test classes that cover a given class, optionally include test classes for classes that reference the given class.
     * The depth parameter controls how many levels of references to include, if not specified only direct test classes are returned.
     *
     * If the class is not found, undefined is returned; if no test classes are found, an empty array is returned.
     *
     * @param className - The name of the class to retrieve test classes for.
     * @param options - Optional parameters for controlling the depth of the search.
     * @returns An array of test class names that cover the specified class.
     */
    public getTestClasses(className: string, options?: { depth?: number }) {
        const classInfo = this.apexClassesByName.get(className.toLowerCase());
        if (!classInfo) {
            return undefined;
        }

        const testClasses = new Set<string>();
        for (const testClass of this.testClasses.values()) {
            if (testClass.classCoverage.includes(className.toLowerCase())) {
                testClasses.add(testClass.name);
            }
        }

        if (options?.depth) {
            for (const referenceClassName of this.getClassReferences(className)) {
                this.getTestClasses(referenceClassName, { depth: options.depth - 1 })
                    ?.forEach(testClass => testClasses.add(testClass))
            }
        }

        return [...testClasses];
    }

    /**
     * Retrieves an Array class that references the given class.
     * @param className The name of the class to retrieve references for.
     * @returns An array of class names that reference the given class.
     */
    private getClassReferences(className: string) {
        const references = new Set<string>();
        for (const classInfo of this.apexClassesByName.values()) {
            if (classInfo.classStructure.refs.some(ref => stringEqualsIgnoreCase(ref.name, className))) {
                references.add(classInfo.name);
            }
        }
        return [...references];
    }

    private async parseSourceFiles(folders: string[]) {
        const sourceFiles = new Array<ApexClassInfo>();

        for (const folder of folders) {
            this.logger.verbose(`Parsing source files in: ${folder}`);

            for await (const { buffer, file } of this.readSourceFiles(folder)) {
                const apexClassName = this.fileToApexClass.get(file);
                if (apexClassName) {
                    sourceFiles.push(this.apexClassesByName.get(apexClassName.toLowerCase())!);
                    continue;
                }

                const parseTimer = new Timer();
                const parser = new Parser(buffer);
                const struct = parser.getCodeStructure();

                for (const classInfo of struct.classes) {
                    const sourceData = {
                        classStructure: classInfo,
                        name: classInfo.name,
                        file,
                        isAbstract: !!classInfo.isAbstract,
                        isTest: !!classInfo.isTest,
                    };

                    this.fileToApexClass.set(file, classInfo.name);
                    this.apexClassesByName.set(classInfo.name.toLowerCase(), sourceData);

                    sourceFiles.push(sourceData);
                }

                this.logger.verbose(`Parsed: ${file} (${parseTimer.toString('ms')})`);
            }
        }

        return sourceFiles;
    }

    private async* readSourceFiles(folder: string){
        for (const file of await this.fileSystem.readDirectory(folder)) {
            const fullPath = path.join(folder, file.name);
            if (file.isDirectory()) {
                yield* this.readSourceFiles(fullPath);
            }
            if (file.isFile() && file.name.endsWith('.cls') /* || file.name.endsWith('.trigger') */) {
                yield {
                    buffer: await this.fileSystem.readFile(fullPath),
                    fullPath,
                    file: file.name
                };
            }
        }
    }
}
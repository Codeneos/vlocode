import { Logger, LogManager, injectable, LifecyclePolicy } from '@vlocode/core';
import { Iterable, Timer, spreadAsync } from '@vlocode/util';
import { Apex, ApexParsedFileInfo } from './apex';

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
     * Map of Apex class information by name class name (lowercase)
     */
    private apexClassesByName: Map<string, ApexParsedFileInfo & { isClass: true }> = new Map();

    /**
     * Set of test class names
     */
    private testClasses: Set<string> = new Set<string>();

    private apexClassesRefs: Map<string, Set<string>> = new Map();

    constructor(
        private apexParser: Apex,
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

        const loadedFiles = await spreadAsync(this.apexParser.parseSourcePaths(...folders));
        for (const info of loadedFiles) {
            this.onFileParsed(info);
        }

        this.logger.info(`Loaded ${loadedFiles.length} sources (${this.testClasses.size} test classes) in ${timerAll.toString('seconds')}`);
    }

    private onFileParsed(info: ApexParsedFileInfo) {
        if (!info.isClass) {
            return;
        }

        this.apexClassesByName.set(info.name.toLowerCase(), info);
        this.apexClassesRefs.set(info.name.toLowerCase(), new Set(info.body.refs.map(ref => ref.name.toLowerCase())));

        if (info.isTest && info.body.methods.some(method => method.isTest)) {
            this.addTestClass(info);
        }
    }

    private addTestClass(info: ApexParsedFileInfo & { isClass: true }) {
        this.testClasses.add(info.name.toLowerCase());
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
    public async findImpactedTests(sourceFiles: string[], options?: { depth?: number }) {
        const classInfos = await spreadAsync(this.apexParser.parseSourcePaths(...sourceFiles));
        const classNames = classInfos.map(info => info.name.toLowerCase());
        const result: string[] = [];
        
        for (const testClass of Iterable.map(this.testClasses, name => this.apexClassesByName.get(name.toLowerCase()))) {
            if (testClass && this.isReferenced(testClass, classNames, options?.depth)) {
                result.push(testClass.name);
            }
        }

        return result;
    }

    private isReferenced(apexClass: ApexParsedFileInfo & { isClass: true }, classList: string[], depth: number = 0) {
        if (apexClass.references.some(ref => classList.includes(ref.toLowerCase()))) {
            return true;
        }

        if (!depth || depth <= 0) {
            return false;
        }

        for (const ref of apexClass.references) {
            const refClass = this.apexClassesByName.get(ref.toLowerCase());
            if (refClass?.isClass && this.isReferenced(refClass, classList, depth - 1)) {
                return true;
            }
        }

        return false;
    }
}
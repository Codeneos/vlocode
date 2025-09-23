import * as path from 'path';
import chalk from 'chalk';
import ZipArchive from 'jszip';

import { Logger, injectable, CachedFileSystemAdapter , FileSystem, Container, container, inject } from '@vlocode/core';
import { cache, substringAfterLast , Iterable, XML, CancellationToken, FileSystemUri, substringBeforeLast, stringEquals, clearCache, stringEqualsIgnoreCase } from '@vlocode/util';

import { PackageManifest } from './maifest';
import { SalesforcePackage, SalesforcePackageComponent, SalesforcePackageComponentFile } from './package';
import { MetadataRegistry, MetadataType } from '../metadataRegistry';
import { RetrieveDeltaStrategy } from '../retrieveDeltaStrategy';
import { SalesforcePackageBuilderPlugin } from './packageBuilderPlugin';
import { ReplacementDetail, TokenReplacementPlugin } from './plugins/tokenReplacementPlugin';
import { TypeScriptCompilerPlugin } from './plugins/typescriptCompilerPlugin';

export enum SalesforcePackageType {
    /**
     * Deploy all files in the package
     */
    deploy = 'deploy',
    /**
     * Build a package without adding data.
     */
    retrieve = 'retrieve',
    /**
     * Build package as destructive change; files added inthe builder will be removed from the target org
     */
    destruct = 'destruct',
}

type FilePath = string | FileSystemUri;

/**
 * Interface for a strategy to determine which components in the packages have changed and need to be deployed.
 * Returns a list of components that have changed which can be used to create a new deployment package.
 */
export interface DeltaPackageStrategy<TOptions extends object = object> {
    /**
     * Gets a list of components that have changed since the last deployment.
     * @param metadataPackage Package to get changed components for.
     */
    getChangedComponents(
        metadataPackage: SalesforcePackage, 
        options?: { 
            cancellationToken?: CancellationToken 
        } & TOptions
    ): Promise<Array<SalesforcePackageComponent>>;
}

interface MetadataObject {
    type: MetadataType;
    data: Record<string, unknown>;
}

/**
 * Represents a single file or component included in a Salesforce deployment package.
 *
 * This type merges the metadata defined by `SalesforcePackageComponentFile` with the
 * actual file payload under the `data` property.
 *
 * @remarks
 * - The `data` property holds the file contents and is required.
 * - Provide a `Buffer` for binary files (images, archives, compiled assets) and a `string`
 *   for text files (XML, Apex, metadata files). Strings are treated as text content (typically UTF-8).
 * - Consumers should write or transmit `data` exactly as provided; no additional encoding is assumed.
 *
 * @public
 *
 * @example
 * ```ts
 * // Binary file example
 * const pngEntry: SalesforcePackageEntry = {
 *   ...componentMeta,
 *   data: Buffer.from([0x89, 0x50, 0x4E, 0x47])
 * };
 *
 * // Text file example
 * const xmlEntry: SalesforcePackageEntry = {
 *   ...componentMeta,
 *   data: '<ApexClass>...</ApexClass>'
 * };
 * ```
 */
export type SalesforcePackageEntry = SalesforcePackageComponentFile & { data: Buffer | string, fsPath?: string };


@injectable.transient()
/**
 * SalesforcePackageBuilder
 *
 * High-level builder for constructing Salesforce metadata packages (SalesforcePackage) from a set of
 * filesystem sources. The builder:
 * - discovers metadata types and related meta files,
 * - handles SFDX-style source formats and classic metadata package formats,
 * - composes fragmented metadata (child elements merged into parent metadata),
 * - bundles resources (Aura/LWC and StaticResource folders) and compresses folder-based static resources,
 * - applies plugin-based transformations to package entries (for token replacement, filtering, or custom transformations),
 * - supports creating deploy/retrieve/destructive packages and generating delta packages via pluggable strategies.
 *
 * Usage
 * - Construct with the desired package type (deploy | retrieve | destruct) and optional API version.
 * - Add files or directories via addFiles. The builder recursively expands directories and resolves
 *   content/meta file pairs. For SFDX fragmented sources the builder will merge fragments into composed
 *   parent metadata before adding them to the package.
 * - Plugins can be registered with addPlugin to transform or filter package entries. For backwards
 *   compatibility a TokenReplacementPlugin instance is always present as the first plugin.
 * - Call build() to obtain the SalesforcePackage. build() will regenerate missing meta files and will
 *   trigger a rebuild when replacement tokens or other conditions require a re-run.
 *
 * Key behaviors and notes
 * - The builder normalizes paths and deduplicates parsed files to avoid double-processing.
 * - It recognizes and respects metadata type configuration from the MetadataRegistry (folders, bundles,
 *   folder-content types, suffixes, strict directory names, decomposition/child types).
 * - For bundle metadata (Aura, LWC, etc.) the builder collects all files in the bundle folder and adds them
 *   as component sources. For StaticResource bundles it compresses the folder into a zip and adds the binary.
 * - Child fragments (decomposed XML files) are merged into a composed representation of the parent metadata
 *   (composedData) and persisted into the package before returning the final SalesforcePackage.
 * - When operating in destructive mode the builder records destructive change entries rather than adding binary/data.
 * - getDeltaPackage and removeUnchanged accept a DeltaPackageStrategy or its constructor to compute changed
 *   components and build a package containing only those changes.
 * - CancellationToken arguments are honored for long running operations such as addFiles and rebuildPackage.
 *
 * Concurrency and caching
 * - The builder is not safe for concurrent modifications from multiple callers. Treat a builder instance as
 *   single-threaded: do not call mutating APIs concurrently.
 * - Internal file resolution helpers (findMetaFile, findContentFile) are cached for performance.
 *
 * Plugins
 * - The plugin system is ordered: the built-in TokenReplacementPlugin is always the first plugin and can
 *   be supplemented by additional SalesforcePackageBuilderPlugin implementations using addPlugin().
 * - Plugins receive a SalesforcePackageEntry and may return a transformed entry or undefined to leave it unchanged.
 * - addPlugin appends plugins; it does not deduplicate or validate duplicates — callers are responsible for that.
 *
 * Rebuild behavior
 * - When changes require a full package recomposition (for example when replacement tokens are added after files
 *   have been parsed) the builder will mark itself for rebuild. Calling build() will trigger rebuildPackage() when required.
 * - rebuildPackage resets parsed file state and composed metadata, and re-adds the previously added files.
 *
 * Examples
 * - Basic build (deploy):
 *   const builder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, '56.0');
 *   await builder.addFiles(['src/classes', 'src/triggers']);
 *   const pkg = await builder.build();
 *   const manifest = pkg.getManifest();
 *
 * - Add plugin:
 *   builder.addPlugin(new MyCustomPlugin());
 *
 * - Create delta package:
 *   const delta = await builder.getDeltaPackage(MyDeltaStrategy, { since: lastDeploymentDate });
 *
 * Tags
 * @public
 * @remarks
 * - Prefer build() over the legacy getPackage() accessor: build() will regenerate missing meta files and will
 *   perform a rebuild when necessary.
 * - addReplacement is deprecated; use TokenReplacementPlugin via addPlugin instead.
 * @see SalesforcePackage
 * @see SalesforcePackageBuilderPlugin
 * @see DeltaPackageStrategy
 */
export class SalesforcePackageBuilder {

    /**
     * Default API version to use when no version is specified.
     */
    public static defaultApiVersion = '64.0';

    private mdPackage: SalesforcePackage;
    private rebuildRequired = false;
    private readonly parsedFiles = new Set<string>();
    private readonly composedData = new Map<string, MetadataObject>();
    private readonly plugins: [ TokenReplacementPlugin, ...SalesforcePackageBuilderPlugin[] ] = [
        // For backwards compatibility the token replacement plugin is always the first plugin
        new TokenReplacementPlugin(),
        new TypeScriptCompilerPlugin()
    ];

    @inject(Logger) private readonly logger: Logger;
    @inject(FileSystem) private readonly fs: FileSystem;

    constructor(
        public readonly type: SalesforcePackageType = SalesforcePackageType.deploy,
        public readonly apiVersion: string = SalesforcePackageBuilder.defaultApiVersion
    ) {
        this.mdPackage = new SalesforcePackage(this.apiVersion);
        this.plugins.push(new TokenReplacementPlugin());
    }

    /**
     * @deprecated Add the {@link TokenReplacementPlugin} using `{@link addPlugin}` and add replacements to the plugin instead of using this method.
     */
    public addReplacement(replacement: ReplacementDetail) {
        this.plugins[0].add(replacement);
    }


    /**
     * Extend the package builder with custom functionality by registering a plugin. Plugins 
     * are used to modify package entries during the build process, allowing for custom transformations,
     * as well as filtering or adding new entries.
     *
     * The provided SalesforcePackageBuilderPlugin instance is appended to the builder's internal
     * plugin list and will be considered during subsequent package build operations.
     * 
     * This method does not perform deduplication or validation of the plugin; callers are
     * responsible for avoiding duplicate registrations if that is undesired.
     *
     * @param plugin - The plugin to register with the package builder.
     * @returns void
     */
    public addPlugin(plugin: SalesforcePackageBuilderPlugin) {
        this.plugins.push(plugin);
    }

    /**
     * Rebuilds the Salesforce metadata package by reinitializing the package instance,
     * clearing any previously parsed files and composed data. 
     * 
     * This is automatically called when replacement tokens are added to the package builder after files have been added.
     * 
     * @returns {this} The current instance for method chaining.
     */
    public rebuildPackage(token?: CancellationToken): Promise<this> {
        clearCache(this.fs);
        const sources = this.mdPackage.files();
        if (sources.size === 0) {
            // There is no point in rebuilding the package when no files are added
            return Promise.resolve(this);
        }
        this.logger.verbose(`Rebuilding package with ${sources.size} files`);
        this.mdPackage = new SalesforcePackage(this.apiVersion);
        this.parsedFiles.clear();
        this.composedData.clear();
        this.rebuildRequired = false;
        return this.addFiles(sources, token);
    }

    /**
     * Adds one or more files to the package.
     * @param files Array of files to add
     * @param token Optional cancellation token
     * @returns Instance of the package builder.
     */
    public async addFiles(files: Iterable<FilePath>, token?: CancellationToken) : Promise<this> {        
        const childMetadataFiles = new Array<[string, string, MetadataType]>();

        // Build zip archive for all expanded file; filter out files already parsed
        // Note use posix path separators when building package.zip
        for await (const file of this.getFiles(files, token)) {

            // get metadata type
            const xmlName = await this.getComponentType(file);
            if (xmlName == 'Package') {
                const lowercasePath = file.toLocaleLowerCase();
                if (!path.basename(lowercasePath).includes('destructive')) {
                    this.logger.warn(`${file} is a Package manifest which is not supported by the package builder`);
                } else {
                    const destructiveChangeType = lowercasePath.includes('post') ? 'post' : 'pre';
                    this.mdPackage.mergeDestructiveChanges(await this.fs.readFile(file), destructiveChangeType);
                }
                continue;
            }

            const metadataType = xmlName && this.getMetadataType(xmlName);
            if (!xmlName || !metadataType) {
                const isInStaticResourceFolder = file.split(/\/|\\/).includes('staticresources');
                if (!isInStaticResourceFolder) {
                    // This is just here to avoid complaining on static resources that are part of an extracted zip file
                    this.logger.warn(`${file} (xmlName: ${xmlName ?? '?'}) is not a known Salesforce metadata type`);
                }
                continue;
            }

            const isFolderMetadata = stringEquals(metadataType.folderType, xmlName, { caseInsensitive: true });
            if (metadataType.name != xmlName && !isFolderMetadata) {
                // Support for SFDX formatted source code
                childMetadataFiles.push([ file, xmlName, metadataType ]);
                continue;
            }

            if (metadataType.id === 'staticresource' && file.endsWith('-meta.xml')) {
                const folder = this.stripFileExtension(file, 2);
                const isFolder = await this.fs.isDirectory(folder);
                if (isFolder) {
                    await this.addStaticResourceBundle(folder);
                }
            }

            if (metadataType.isBundle) {
                // Only Aura and LWC are bundled at this moment
                // Classic metadata package all related files
                await this.addBundledSources(path.dirname(file), metadataType);
            }

            // add source
            await this.addSingleSourceFile(file, metadataType);
        }

        for (const [file, xmlName, metadataType] of this.sortXmlFragments(childMetadataFiles)) {
            await this.mergeChildSourceWithParent(file, xmlName, metadataType);
        }

        this.persistComposedMetadata();
        return this;
    }

    /**
     * Removes unchanged components from the package by executing the
     * provided delta strategy which determines which components have changed.
     * 
     * @template S - The type of the DeltaPackageStrategy.
     * @template T - The type of the object.
     * @param strategy - The DeltaPackageStrategy instance or constructor.
     * @param options - The options for getting changed components.
     * @returns An array of removed SalesforcePackageComponent objects.
     */
    public async removeUnchanged<S extends DeltaPackageStrategy<T>, T extends object>(
        strategy?: S | (new(...args: any[]) => S),
        options?: Parameters<S['getChangedComponents']>[1]
    ) : Promise<Array<SalesforcePackageComponent>> {
        const mdPackage = this.mdPackage;
        mdPackage.generateMissingMetaFiles();
        const deltaStrategy: DeltaPackageStrategy<T> = typeof strategy === 'function' || !strategy 
            ? (Container.get(this) ?? container).new(strategy ?? RetrieveDeltaStrategy as any) : strategy;

        const changedComponents = await deltaStrategy.getChangedComponents(mdPackage, options);
        const changedComponentSet = new Set(changedComponents.map(c => `${c.componentType}/${c.componentName}`));
        const removedComponents = new Array<SalesforcePackageComponent>();

        for (const component of this.mdPackage.components()) {
            if (!changedComponentSet.has(`${component.componentType}/${component.componentName}`)) {
                removedComponents.push(component);
                this.mdPackage.remove(component);
            }
        }

        return removedComponents;
    }

    private sortXmlFragments(fragments: Array<[string, string, MetadataType]>) : Array<[string, string, MetadataType]> {
        return fragments.sort(([, fragmentTypeA, parentTypeA], [, fragmentTypeB, parentTypeB]) => {
            const metaTypeCompare = parentTypeA.name.localeCompare(parentTypeB.name);
            if (metaTypeCompare != 0) {
                return metaTypeCompare;
            }

            const decompositions = Object.values(parentTypeA.children?.types ?? []);
            if (decompositions) {
                const decompositionIndexA = decompositions.findIndex(({name}) => name === fragmentTypeA);
                const decompositionIndexB = decompositions.findIndex(({name}) => name === fragmentTypeB);
                return decompositionIndexA - decompositionIndexB;
            }

            return fragmentTypeA.localeCompare(fragmentTypeB);
        });
    }

    private async* getFiles(files: Iterable<FilePath>, token?: CancellationToken): AsyncGenerator<string> {
        const fileNames = [...Iterable.map(files, file => typeof file !== 'string' ? file.fsPath : file)];

        // Build zip archive for all expanded file; filter out files already parsed
        // Note use posix path separators when building package.zip
        for (const file of fileNames) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                break;
            }

            if (!this.addParsedFile(file)) {
                continue;
            }

            // parse folders recursively
            const fileStat = await this.fs.stat(file);
            if (fileStat == null) {
                throw new Error(`The specified file does not exist or is inaccessible: ${file}`);
            }

            if (fileStat.isDirectory()) {
                yield* this.getFiles((await this.fs.readDirectory(file)).map(entry => path.join(file, entry.name)), token);
                continue;
            }

            // If selected file is a meta file check the source file instead
            const isMetaFile = file.endsWith('-meta.xml');
            if (isMetaFile) {
                const sourceFile = await this.findContentFile(file);
                if (sourceFile && this.addParsedFile(sourceFile)) {
                    // If the source file is a folder yield the folder content sources
                    // this ensures when just a meta file for a folder is selected the content is also deployed
                    if (await this.fs.isDirectory(sourceFile)) {
                        yield* this.getFiles((await this.fs.readDirectory(sourceFile)).map(entry => path.join(sourceFile, entry.name)), token);
                    } else {
                        yield sourceFile;
                    }
                }
            } else {
                const metaFile = await this.findMetaFile(file);
                if (metaFile && this.addParsedFile(metaFile)) {
                    yield metaFile;
                }
            }

            yield file;
        }
    }

    /**
     * Add file a file to the parsed file set when not already added. Normalizes the file path when required/
     * @param file file to add
     * @returns Returns true when the file is nto yet parsed; returns false when the file is already parsed.
     */
    private addParsedFile(file: string){
        const normalizedFileName = file.split(/\\|\//g).join('/');
        if (!this.parsedFiles.has(normalizedFileName)) {
            this.parsedFiles.add(normalizedFileName);
            return true;
        }
        return false;
    }

    private async addBundledSources(bundleFolder: string, metadataType: MetadataType) {
        const bundleFiles = await this.fs.readDirectory(bundleFolder);
        const componentName = bundleFolder.split(/\\|\//g).pop()!;
        for (const file of bundleFiles) {
            const fullPath = path.join(bundleFolder, file.name);
            if (file.isFile() && this.addParsedFile(fullPath)) {
                await this.addSingleSourceFile(fullPath, metadataType, componentName);
            }
        }
    }

    private async addSingleSourceFile(file: string, metadataType: MetadataType, componentName?: string) {
        if (!componentName) {
            // resolve component name when not defined as input param
            componentName = this.getPackageComponentName(file, metadataType);
        }

        const componentType = await this.getPackageComponentType(file, metadataType);

        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(componentType, componentName);
        } else {
            let packageEntry: SalesforcePackageEntry = {
                componentType,
                componentName,
                packagePath: await this.getPackagePath(file, metadataType),
                data: await this.fs.readFile(file),
            };
            for (const plugin of this.plugins) {
                packageEntry = await plugin.transformEntry?.(packageEntry) ?? packageEntry;
            }
            this.mdPackage.add({ ...packageEntry, fsPath: file });
        }
        
        this.logger.verbose(`Added %s (%s) as [%s]`, path.basename(file), componentName, chalk.green(metadataType.name));
    }
    
    /**
     * Add compressed static resource bundle to the package; compresses all the resources in the folder into a zip file but does not add
     * the meta-data file for the resource folder.
     * @param folder Folder name to add and compress
     */
    private async addStaticResourceBundle(folder: string) {
        const componentName = folder.split(/\/|\\/g).pop()!;
        const packagePath = `staticresources/${componentName}.resource`;

        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange('StaticResource', componentName);
        } else if (this.type === SalesforcePackageType.retrieve) {
            this.mdPackage.add({ componentType: 'StaticResource', componentName, packagePath });
        } else {
            this.mdPackage.add({
                componentType: 'StaticResource', componentName, packagePath,
                data: await this.compressFolder(folder)
            });
        }
    }

    /**
     * Compress all files in the specified folder into a single ZIP archive and returns the Buffer to the ZIP archive generated
     * @param folder Folder name to add and compress
     */
    private async compressFolder(folder: string) {
        // Build zip
        const resourceBundle = new ZipArchive();
        for await (const file of this.readDirectoryRecursive(folder)) {
            const relativePath = path.relative(folder, file).replace(/\/|\\/g, '/');
            resourceBundle.file(relativePath, await this.fs.readFile(file));
            this.addParsedFile(file);        }

        return resourceBundle.generateAsync({ type: 'nodebuffer' });
    }

    private async* readDirectoryRecursive(folder: string) {
        for(const file of await this.fs.readDirectory(folder)) {
            const fullPath = path.join(folder, file.name);
            if (file.isDirectory()) {
                return yield* this.readDirectoryRecursive(fullPath);
            } else {
                yield fullPath;
            }
        }
    }

    /**
     * Merge the source of the child element into the parent
     * @param sourceFile Source file containing the child source
     * @param fragmentTypeName XML name of the child element
     * @param parentType Metadata type of the parent/root
     */
    private async mergeChildSourceWithParent(sourceFile: string, fragmentTypeName: string, parentType: MetadataType) {
        // Get metadata type for a source file
        const fragmentType = Object.values(parentType.children?.types ?? []).find(d => d.name === fragmentTypeName);// ?.decompositions.find(d => d.metadataName == xmlName);
        if (!fragmentType) {
            this.logger.error(`No decomposition configuration for: ${chalk.green(sourceFile)} (${fragmentTypeName})`);
            return;
        }

        const childComponentName = this.getPackageComponentName(sourceFile, parentType);
        const sourceFilePath = sourceFile.split(/\\|\//g);
        const indexOfTypeFolder = sourceFilePath.findLastIndex(p => stringEqualsIgnoreCase(p, parentType.directoryName));

        const parentComponentFolder = [...sourceFilePath.slice(0, indexOfTypeFolder + 2)].join(path.sep);
        const parentComponentName = sourceFilePath[indexOfTypeFolder + 1];
        const parentComponentMetaFile =  path.join(parentComponentFolder, `${parentComponentName}.${parentType.suffix}-meta.xml`);
        const parentPackagePath = await this.getPackagePath(parentComponentMetaFile, parentType);

        // Whether the component is supported by the Metadata API and therefore should be included within a manifest.
        // When not set defaults to true in metadata registry -
        // When `isAddressable = false` the parent is added to the manifest instead of the child
        const isAddressable = fragmentType.isAddressable !== false; 

        // Merge child metadata into parent metadata
        if (this.type === SalesforcePackageType.deploy) {
            await this.mergeMetadataFragment(parentPackagePath, sourceFile, parentType);
        }

        // Add as member to the package when not yet mentioned
        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(fragmentType.name, `${parentComponentName}.${childComponentName}`);
        } else {
            if (isAddressable) {
                this.mdPackage.addManifestEntry(fragmentType.name, `${parentComponentName}.${childComponentName}`);
            } else {
                this.mdPackage.addManifestEntry(parentType.name, parentComponentName);
            }
            // Register source file as source for composed metadata
            this.mdPackage.addSourceMap(sourceFile, { 
                componentType: fragmentType.name,
                componentName: `${parentComponentName}.${childComponentName}`, 
                packagePath: parentPackagePath 
            });
            // Ensure parent meta file is also registered as source for the composed metadata
            if (await this.fs.pathExists(parentComponentMetaFile)) {
                this.mdPackage.addSourceMap(parentComponentMetaFile, { 
                    componentType: parentType.name, 
                    componentName: parentComponentName, 
                    packagePath: parentPackagePath 
                });
            }
        }

        this.logger.verbose(`Added %s (%s.%s) as [%s]`, path.basename(sourceFile), parentComponentName, childComponentName, chalk.green(fragmentTypeName));
    }

    /**
     * Merge the source file into the existing package metadata when there is an existing metadata file.
     * @param packagePath Path of the parent package file in the package
     * @param fragmentFile Path of the metedata file on the FS that should be merged into the package
     * @param metadataType Type of the metadata to merge
     */
    private async mergeMetadataFragment(packagePath: string, fragmentFile: string, metadataType: MetadataType) {
        const [[fragmentTag, fragmentMetadata]] = Object.entries(XML.parse(await this.fs.readFileAsString(fragmentFile), { trimValues: true }));
        const decomposition = Object.values(metadataType.children?.types ?? []).find(d => d.name === fragmentTag);

        if (!decomposition) {
            this.logger.error(`No decomposition configuration for: ${chalk.green(fragmentFile)} (${fragmentTag})`);
            return;
        }

        // Merge child metadata into parent metadata
        const metadata = await this.readComposedMetadata(packagePath, fragmentFile, metadataType);
        this.mergeMetadata(metadata[metadataType.name], { [decomposition.directoryName]: fragmentMetadata });
    }

    private async readComposedMetadata(packagePath: string, fragmentFile: string, metadataType: MetadataType): Promise<any> {
        const composedData = this.composedData.get(packagePath);
        if (composedData) {
            return composedData.data;
        }

        const existingPackageData = await this.readPackageData(packagePath);
        // if (!existingPackageData) {
        //     // ensure parent files are included
        //     const parentBaseName = path.basename(packagePath);
        //     const parentSourceFile = path.join(fragmentFile, '..', '..', `${parentBaseName}-meta.xml`);
        //     if (await this.fs.pathExists(parentSourceFile)) {
        //         existingPackageData = await this.fs.readFileAsString(parentSourceFile);
        //     }
        // }

        const existingMetadata = existingPackageData
            ? XML.parse(existingPackageData, { trimValues: true }) 
            : { [metadataType.name]: {} };
        this.composedData.set(packagePath, { data: existingMetadata, type: metadataType });
        return existingMetadata;
    }

    private async persistComposedMetadata() {
        for (const [ packagePath, { data, type } ] of this.composedData.entries()) {
            this.mdPackage.setPackageData(packagePath, {
                data: this.buildMetadataXml(type.name, data[type.name]),
                componentType: type.name,
                componentName: path.basename(packagePath, `.${type.suffix}`)
            });
        }
    }

    private async readPackageData(packagePath: string): Promise<string | Buffer | undefined> {
        const existingPackageData = this.mdPackage.getPackageData(packagePath);
        if (existingPackageData?.data) {
            return existingPackageData.data;
        } else if (existingPackageData?.fsPath) {
            return this.fs.readFile(existingPackageData.fsPath);
        }
    }

    private mergeMetadata(targetMetadata: object, sourceMetadata: object) {
        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(sourceMetadata)) {
            if (value === undefined) {
                continue; // skip undefined
            }

            if (typeof value === 'object' && !Array.isArray(value)) {
                value = [ value ];
            }

            const existingValue = targetMetadata[key];
            if (!existingValue) {
                targetMetadata[key] = value;
            } else if (Array.isArray(value)) {
                if (Array.isArray(existingValue)) {
                    existingValue.push(...value);
                } else if (typeof targetMetadata === 'object') {
                    targetMetadata[key] = [ targetMetadata[key], ...value ];
                } else {
                    throw new Error(`Cannot merge metadata; properties of the source and target metadata are incompatible for property ${key}: expected source to be an Object or Array `);
                }
            }
        }
        return targetMetadata;
    }

    /**
     * Gets a SalesforcePackage containing only the changed components using the provided strategy.
     * TODO: Based on the type of metadata a different strategy should be used instead of the generic one.
     * This will allow for more efficient in delta packaging by using a different API for certain metadata types.
     * @param strategy The strategy to use for getting the changed components
     * @param options Options that are passed to the strategy
     * @returns A SalesforcePackage containing only the changed components
     */
    public async getDeltaPackage<S extends DeltaPackageStrategy<T>, T extends object>(
        strategy?: S | (new(...args: any[]) => S),
        options?: Parameters<S['getChangedComponents']>[1]
    ) {
        const mdPackage = await this.build();
        const deltaStrategy = typeof strategy === 'function' || !strategy 
            ? (Container.get(this) ?? container).new(strategy ?? RetrieveDeltaStrategy as any) : strategy;
        const changedComponents = await deltaStrategy.getChangedComponents(mdPackage, options);
        const deltaPackage = new SalesforcePackage(this.apiVersion);

        for (const component of changedComponents) {
            deltaPackage.add([...this.mdPackage.getComponentFiles(component)]);
        }

        // Add destructive changes from original package
        deltaPackage.addDestructiveChange(mdPackage.getDestructiveChanges());

        return deltaPackage;
    }

    /**
     * Retrieves the list of components currently in the package.
     * @returns An array of SalesforcePackageComponent objects.
     */
    public getPackageComponents(): Array<SalesforcePackageComponent> {
        return this.mdPackage.components();
    }

    /**
     * Retrieves the list of files included in the current metadata package.
     *
     * @returns {string[]} An array of file paths representing the files in the package.
     */
    public getPackageFiles() {
        return this.mdPackage.files();
    }


    /**
     * Gets the SalesforcePackage underlying the builder without rebuilding it.
     * @deprecated Use {@link build} instead which also rebuilds the package when required (e.g. when replacement tokens are added).
     */
    public getPackage() {
        this.mdPackage.generateMissingMetaFiles();
        return this.mdPackage;
    }

    /**
     * Gets SalesforcePackage underlying the builder.
     */
    public async build(token?: CancellationToken): Promise<SalesforcePackage> {     
        if (this.rebuildRequired) {  
            await this.rebuildPackage(token);
        }
        this.mdPackage.generateMissingMetaFiles();
        return this.mdPackage;
    }

    /**
     * @see SalesforcePackage.getManifest
     */
    public getManifest(types?: string[]): PackageManifest {
        return this.mdPackage.getManifest(types);
    }

    private getMetadataType(xmlName: string) {
        const metadataTypes = MetadataRegistry.getMetadataTypes();
        return metadataTypes.find(type => type.name == xmlName || type.childXmlNames?.includes(xmlName));
    }

    private async getComponentType(file: string) : Promise<string| undefined> {
        const xmlName = await this.getComponentTypeFromSource(file);
        if (xmlName) {
            return xmlName;
        }

        // Strict directory name check
        const pathParts = file.split(/\\|\//g).slice(0, -1);
        const folder = pathParts.pop();
        const parentFolder = pathParts.pop();

        for (const type of MetadataRegistry.getMetadataTypes()) {
            if (type.strictDirectoryName) {
                if (type.isBundle) {
                    // match parent folder only for bundles
                    if (parentFolder == type.directoryName){
                        return type.name;
                    }
                } else if (folder == type.directoryName) {
                    return type.name;
                }
            }
        }

        // Suffix check
        const fileSuffix = this.getFileSuffix(file)?.toLocaleLowerCase();
        if (fileSuffix) {
            return MetadataRegistry.getMetadataTypeBySuffix(fileSuffix)?.name;
        }
    }

    private getFileSuffix(file: string) {
        const metaSuffixMatch = file.match(/\.([^-]+)-meta\.xml$/i);
        if (metaSuffixMatch) {
            return metaSuffixMatch[1];
        }
        const suffix = file.split(/\\|\//g).pop()?.match(/\.([^.]+)$/i)?.[1];
        return suffix?.toLowerCase() != 'xml' ? suffix : undefined;
    }

    private async getComponentTypeFromSource(file: string) : Promise<string| undefined>{
        const isMetaFile = file.endsWith('-meta.xml');

        if (!isMetaFile) {
            const metaFile = await this.findMetaFile(file);
            if (metaFile) {
                // Prefer meta file if they exist
                return this.getComponentTypeFromSource(metaFile);
            }
        }

        const metadataTypes = MetadataRegistry.getMetadataTypes();
        const xmlName = await this.getRootElementName(file);

        // Cannot detect certain metadata types properly so instead manually set the type
        if (xmlName == 'Package') {
            // Package are considered valid types for destructive changes
            return xmlName;
        }

        const metadataType = xmlName ? metadataTypes.find(type =>
            type.name == xmlName ||
            type.childXmlNames?.includes(xmlName!)
        ) : undefined

        if (metadataType) {
            return xmlName;
        }
    }

    /**
     * Get root Element/Tag name of the specified XML file.
     * @param file Path to the XML file from which to get the root element name.
     */
    private async getRootElementName(file: string) {
        return XML.getRootTagName(await this.fs.readFile(file));
    }

    /**
     * Gets the name of the component for the package manifest
     * @param metaFile
     * @param metadataType
     */
    private getPackageComponentName(metaFile: string, metadataType: MetadataType) : string {
        const sourceFileName = path.basename(metaFile).replace(/-meta\.xml$/ig, '');
        const componentName = sourceFileName.replace(/\.[^.]+$/ig, '');

        if (metadataType.isBundle) {
            return metaFile.split(/\\|\//g).slice(-2).shift()!;
        }

        const packageFolder = this.getPackageFolder(metaFile, metadataType);
        if (packageFolder.includes(path.posix.sep)) {
            return packageFolder.split(path.posix.sep).slice(1).concat([ componentName ]).join(path.posix.sep);
        }

        return componentName;
    }

    /**
     * Get the packaging folder for the source file.
     * @param fullSourcePath
     * @param metadataType
     */
    private getPackageFolder(fullSourcePath: string, metadataType: MetadataType) : string {
        const retainFolderStructure = !!metadataType.inFolder;
        const componentPackageFolder = metadataType.directoryName;

        if (retainFolderStructure && componentPackageFolder) {
            const packageParts = path.dirname(fullSourcePath).split(/\/|\\/g);
            const packageFolderIndex = packageParts.indexOf(componentPackageFolder);
            return packageParts.slice(packageFolderIndex).join(path.posix.sep);
        }

        if (metadataType.isBundle && componentPackageFolder) {
            const componentName = fullSourcePath.split(/\\|\//g).slice(-2).shift()!;
            return path.posix.join(componentPackageFolder, componentName);
        }

        return componentPackageFolder ?? substringAfterLast(path.dirname(fullSourcePath), /\/|\\/g);
    }

    private async getPackagePath(file: string, metadataType: MetadataType) {
        const baseName =  file.split(/\\|\//g).pop()!;
        const contentName = baseName.replace(/-meta\.xml$/i,'');

        const isMetaFile = baseName !== contentName;
        const packageFolder = this.getPackageFolder(file, metadataType);
        const expectedSuffix = metadataType.suffix ? (isMetaFile ? `${metadataType.suffix}-meta.xml` : `${metadataType.suffix}`) : undefined;

        if (metadataType.folderContentType) {   
            // For folder metadata the meta file name should match the folder name
            return path.posix.join(packageFolder, `${substringBeforeLast(contentName,'.')}-meta.xml`);
        }

        if (isMetaFile && !metadataType.hasContent && !metadataType.isBundle) {
            // SFDX adds a '-meta.xml' to each file, when deploying we need to strip these
            // when the source does not have a meta data file
            return path.posix.join(packageFolder, contentName);
        }

        if (metadataType.id == 'document') {
            // For documents ensure each meta file matches the contents suffix
            if (isMetaFile) {
                const contentFile = await this.findContentFile(file);
                if (contentFile) {
                    return path.posix.join(packageFolder, `${contentFile.split(/\\|\//g).pop()!}-meta.xml`);
                }
            }
        } else if (expectedSuffix && !file.endsWith(expectedSuffix)) {
            // for non-document source files should match the metadata suffix
            return path.posix.join(packageFolder, `${this.stripFileExtension(contentName, 1)}.${expectedSuffix}`);
        }

        return path.posix.join(packageFolder, baseName);
    }

    private async getPackageComponentType(file: string, metadataType: MetadataType) {
        if (metadataType.folderContentType) {
            return MetadataRegistry.getMetadataType(metadataType.folderContentType)!.name;
        }
        return metadataType.name;
    }

    @cache({ unwrapPromise: true })
    private async findContentFile(metaFile: string) {
        const metaFileSuggestedContentFile = metaFile.slice(0, -9);
        if (await this.fs.pathExists(metaFileSuggestedContentFile)) {
            return metaFileSuggestedContentFile;
        }

        const contentFilePattern = `${this.stripFileExtension(metaFile, 2)}.*`;
        const contentMatches = (await this.fs.findFiles(contentFilePattern)).filter(f => f !== metaFile)
            .filter(file => !file.endsWith('-meta.xml'));
        if (contentMatches.length) {
            return contentMatches[0];
        }
    }

    @cache({ unwrapPromise: true })
    private async findMetaFile(contentFile: string) {
        const metaFile = `${contentFile}-meta.xml`;
        if (await this.fs.isFile(metaFile)) {
            return metaFile;
        }

        const genericMetaGlob = `${this.stripFileExtension(contentFile)}.*-meta.xml`;
        const globMetaMatch = await this.fs.findFiles(genericMetaGlob);
        if (globMetaMatch.length) {
            return globMetaMatch[0];
        }
    }

    private stripFileExtension(fileName: string, maxCount: number = 1) {
        const baseName = fileName.split(/\\|\//g).pop()!;
        const extensions = baseName.split('.');
        if (extensions.length == 1) {
            return fileName;
        }
        return fileName.split('.').slice(0,-(Math.min(extensions.length - 1, maxCount))).join('.');
    }

    private buildMetadataXml(rootName: string, data?: any) {
        return XML.stringify({
            [rootName]: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...(data || {})
            }
        }, 4);
    }
}

import { injectable, LifecyclePolicy, Logger } from "@vlocode/core";
import { CancellationToken, deepCompare, remove, XML } from "@vlocode/util";
import { RetrieveManifestOptions, SalesforceDeployService } from "./salesforceDeployService";
import { MetadataRegistry, MetadataType } from "./metadataRegistry";
import { RetrieveResultComponent } from "./deploy";
import { SalesforcePackage, SalesforcePackageComponent } from "./deploy/package";

/**
 * Interface for a strategy to determine if two objects are equal. Used in the delta strategy to determine if a component has changed.
 * Based on the object type and or file name the strategy can be different.
 */
interface CompareStrategy {
    (a: Buffer | string, b: Buffer | string): boolean
}

type CompareXmlStrategyType = 'xmlStrict' | 'xmlStrictOrder' | 'xml' | 'metaXml';
type CompareStrategyType = CompareXmlStrategyType | 'binary' | 'default';

/**
 * Interface for a strategy to determine which components in the packages have changed and need to be deployed.
 * Returns a list of components that have changed which can be used to create a new deployment package.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class RetrieveDeltaStrategy {

    private readonly compareStrategies: Record<CompareStrategyType | string, CompareStrategy> = {
        'xmlStrict': (a, b) => this.isXmlEqual(a, b, { strictOrder: true }),
        'xmlStrictOrder': (a, b) => this.isXmlEqual(a, b, { strictOrder: true, ignoreExtra: true }),
        'xml': (a, b) => this.isXmlEqual(a, b, { strictOrder: false, ignoreExtra: true }),
        'metaXml': (a, b) => this.isMetaXmlEqual(a, b),
        'binary': this.isBinaryEqual.bind(this),
        'default': this.isStringEqual.bind(this),
        'InstalledPackage': (a, b) => !this.isPackageNewer(a, b)
    };

    /**
     * Represents the metadata strategy for different types of metadata.
     */
    public static readonly metadataStrategy : Record<string, CompareStrategyType | CompareStrategy> = {
        'FlexiPage': 'xmlStrict',  
        'Layout': 'xmlStrict',
        'Flow;': 'xmlStrict',
        'StaticResource': 'binary',
        'ContentAsset': 'binary',
        'Document': 'binary',      
    };

    /**
     * Determines the default strategy for strict XML parsing.
     * This strategy is used when no specific strategy is defined for a metadata type.
     * This strategy is used for XML files that are not metadata types.
     */
    public static readonly defaultXmlStrategy: CompareXmlStrategyType = 'xml';

    constructor(
        private readonly deployService: SalesforceDeployService,
        private readonly logger: Logger) {
    }

    /**
     * Gets a list of components that have changed since the last deployment.
    * @param mdPackage Package to get changed components for.
     */
    public async getChangedComponents(mdPackage: SalesforcePackage, options: {
            deltaTypes?: string[];
            cancellationToken?: CancellationToken;
        } & RetrieveManifestOptions): Promise<Array<SalesforcePackageComponent>> {

        const retrievalManifest = mdPackage.getManifest(options?.deltaTypes);
        if (retrievalManifest.isEmpty) {
            return [];
        }

        this.logger.debug(`Retrieving metadata for types: ${retrievalManifest.types()}`);

        const packageComponents = mdPackage.components().map(({ componentName, componentType }) => ({ componentName, componentType }));
        const retrieveResult = await this.deployService.retrieveManifest(retrievalManifest, { apiVersion: mdPackage.apiVersion, ...options });

        for (const component of retrieveResult.components()) {
            if (!await this.isComponentChanged(mdPackage, component)) {
                // remove all components that are unchanged so that
                // all that remains are the *changed* and *new* components
                remove(packageComponents, c =>
                    c.componentName == component.componentName &&
                    c.componentType == component.componentType
                );
            }
        }

        return packageComponents;
    }

    /**
     * Compare the retrieved component against the component in the current package to determine if it has changed.
     * @param mdPackage Package containing the data to compare against
     * @param component The retrieved component to compare against the same component in package
     * @returns Returns true if the component has changed
     */
    private async isComponentChanged(mdPackage: SalesforcePackage, component: RetrieveResultComponent) {
        const metadataType = MetadataRegistry.getMetadataType(component.componentType);
        if (!metadataType) {
            return true;
        }

        const packageComponent = mdPackage.getComponent(component);
        if (packageComponent.files.length !== component.files.length) {
            this.logger.debug(`component ${component.componentType}\\${component.componentName} changed due to component file count mismatch`);
            return true;
        }

        for (const componentFile of component.files) {
            const localData = mdPackage.getPackageData(componentFile.packagePath)?.data
            const orgData = await componentFile.getBuffer();

            if (this.isDataChanged(componentFile.packagePath, localData, orgData, metadataType)) {
                this.logger.debug(`component ${component.componentType}\\${component.componentName} changed due to data mismatch in ${componentFile.packagePath}`);
                return true;
            }
        }

        return false;
    }

    private isDataChanged(
        packagePath: string,
        localData: Buffer | string | undefined,
        orgData: Buffer | string | undefined,
        type: MetadataType
    ): boolean {
        if (Buffer.isBuffer(localData) && Buffer.isBuffer(orgData) && localData.compare(orgData) === 0) {
            // If both are buffers first do a quick buffer comparison
            return false;
        }

        if (localData === orgData) {
            return false;
        }

        if (localData === undefined || orgData === undefined) {
            return true;
        }

        try {
            return !this.getComparer(packagePath, localData, type)(orgData, localData);
        } catch {
            return !this.compareStrategies.default(orgData, localData);
        }
    }

    private getComparer(packagePath: string, data: string | Buffer, type: MetadataType): CompareStrategy {
        if (this.compareStrategies[type.name]) {
            return this.compareStrategies[type.name];
        }

        if (/\.([a-z]+)-meta\.xml$/i.test(packagePath)) {
            return this.compareStrategies.metaXml;
        }

        if (type.name === 'StaticResource' ||
            type.name === 'ContentAsset' ||
            type.name === 'Document') {
            return this.compareStrategies.binary;
        }

        const strategyName = RetrieveDeltaStrategy.metadataStrategy[type.name];
        if (strategyName) {
            if (typeof strategyName === 'string') {
                if (!(strategyName in this.compareStrategies)) {
                    throw new Error(`Specified strategy for metadata type ${type.name} does not exist: ${strategyName}`);
                }
                return this.compareStrategies[strategyName];
            }
            return strategyName;
        }

        if (/\.xml$/i.test(packagePath) || XML.isXml(data)) {
            return this.compareStrategies[RetrieveDeltaStrategy.defaultXmlStrategy];
        }
        return this.compareStrategies.default;
    }

    private isBinaryEqual(a: Buffer | string, b: Buffer | string): boolean {
        // binary comparison
        const bufferA = typeof a === 'string' ? Buffer.from(a) : a;
        const bufferB = typeof b === 'string' ? Buffer.from(b) : b;
        return bufferA.compare(bufferB) === 0;
    }

    private isXmlEqual(a: Buffer | string, b: Buffer | string, options?: { arrayMode?: boolean, strictOrder?: boolean, ignoreExtra?: boolean }): boolean {
        // Note: this function does not yet properly deal with changes in the order of XML elements in an array
        // Parse XML and filter out attributes as they are not important for comparison of metadata
        const parsedA = XML.parse(a, { arrayMode: options?.arrayMode, ignoreAttributes: true });
        const parsedB = XML.parse(b, { arrayMode: options?.arrayMode, ignoreAttributes: true });

        // Compare parsed XML
        return deepCompare(parsedA, parsedB, {
            primitiveCompare: this.primitiveCompare,
            ignoreArrayOrder: !options?.strictOrder,
            ignoreExtraProperties: !!options?.ignoreExtra,
            ignoreExtraElements: !!options?.ignoreExtra
        });
    }

    private isPackageNewer(a: Buffer | string, b: Buffer | string): boolean {
        const orgMeta = XML.parse(a, { arrayMode: false, ignoreAttributes: true });
        const localMeta = XML.parse(b, { arrayMode: false, ignoreAttributes: true });

        const localVersion = parseFloat(localMeta.InstalledPackage?.versionNumber);
        const orgVersion = parseFloat(orgMeta.InstalledPackage?.versionNumber);
        if (isNaN(localVersion) || isNaN(orgVersion)) {
            return true;
        }

        if (localVersion > orgVersion) {
            return true;
        } else if (localVersion === orgVersion) {
            return deepCompare(localMeta, orgMeta, {
                primitiveCompare: this.primitiveCompare,
                ignoreArrayOrder: false,
                ignoreExtraProperties: true
            });
        }
        return false;
    }

    private isMetaXmlEqual(a: Buffer | string, b: Buffer | string): boolean {
        // Note: this function does not yet properly deal with changes in the order of XML elements in an array
        // Parse XML and filter out attributes as they are not important for comparison of metadata
        const orgMeta = XML.parse(a, { arrayMode: false, ignoreAttributes: true });
        const localMeta = XML.parse(b, { arrayMode: false, ignoreAttributes: true });

        if (orgMeta.packageVersions && !localMeta.packageVersions) {
            // If the org data has package versions details but the local data does not, copy the package versions details;
            localMeta.packageVersions = orgMeta.packageVersions;
        }

        // Compare parsed XML
        return deepCompare(localMeta, orgMeta, {
                primitiveCompare: this.primitiveCompare,
                ignoreArrayOrder: false,
                ignoreExtraProperties: true
            });
    }

    private isStringEqual(a: Buffer | string, b: Buffer | string): boolean {
        a = (typeof a === 'string' ? a : a.toString('utf8')).replace(/\r\n/g, '\n').trim();
        b = (typeof b === 'string' ? b : b.toString('utf8')).replace(/\r\n/g, '\n').trim();
        return a.localeCompare(b) === 0;
    }

    private primitiveCompare(this: void, a: unknown, b: unknown): boolean {
        // treated empty strings, nulls and undefined as equals
        return a === b || (!a && !b);
    }
}
import { injectable, LifecyclePolicy, Logger } from "@vlocode/core";
import { CancellationToken, deepCompare, remove, XML } from "@vlocode/util";
import { RetrieveManifestOptions, SalesforceDeployService } from "./salesforceDeployService";
import { SalesforcePackage, SalesforcePackageComponent } from "./deploymentPackage";
import { MetadataRegistry, MetadataType } from "./metadataRegistry";
import { RetrieveResultComponent } from "./deploy";

/**
 * Interface for a strategy to determine which components in the packages have changed and need to be deployed.
 * Returns a list of components that have changed which can be used to create a new deployment package.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class RetrieveDeltaStragey  {

    constructor(
        private readonly deployService: SalesforceDeployService,
        private readonly metadataRegistry: MetadataRegistry,
        private readonly logger: Logger) {
    }

    /**
     * Gets a list of components that have changed since the last deployment.
     * @param metadataPackage Package to get changed components for.
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
        const metadataType = this.metadataRegistry.getMetadataType(component.componentType);
        if (!metadataType) {
            return true;
        }

        const packageComponent = mdPackage.getComponent(component);
        if (packageComponent.files.length !== component.files.length) {
            this.logger.debug(`component ${component.componentType}\\${component.componentName} changed due to component file count mismatch`);
            return true;
        }

        for (const componentFile of component.files) {
            const packageData = mdPackage.getPackageData(componentFile.packagePath)?.data
            const orgData = await componentFile.getBuffer();

            if (this.isDataChanged(componentFile.packagePath, packageData, orgData, metadataType)) {
                this.logger.debug(`component ${component.componentType}\\${component.componentName} changed due to data mismatch in ${componentFile.packagePath}`);
                return true;
            }
        }

        return false;
    }

    private isDataChanged(
        packagePath: string, 
        a: Buffer | string | undefined, 
        b: Buffer | string | undefined, 
        type: MetadataType): boolean 
    {
        if (a === b) {
            return false;
        }

        if (a === undefined || b === undefined) {
            return true;
        }

        if (packagePath.endsWith('.xml')) {
            return this.isXmlChanged(a, b);
        }

        if (!type.metaFile && type.suffix && packagePath.endsWith(type.suffix)) {
            try {
                return this.isXmlChanged(a, b);
            } catch {
                // Fallback to binary comparison when XML parsing fails
            }
        }

        if (type.name === 'StaticResource' ||
            type.name === 'ContentAsset' ||
            type.name === 'Document' ||
            type.contentIsBinary)
        {
            // binary comparison
            const bufferA = typeof a === 'string' ? Buffer.from(a) : a;
            const bufferB = typeof b === 'string' ? Buffer.from(b) : b;
            return bufferA.compare(bufferB) !== 0;
        }

        a = (typeof a === 'string' ? a : a.toString('utf8')).trim();
        b = (typeof b === 'string' ? b : b.toString('utf8')).trim();

        return a !== b;
    }

    private isXmlChanged(a: Buffer | string, b: Buffer | string) {
        // Note: this function does not yet properly deal with changes in the order of XML elements in an array
        // Parse XML and filter out attributes as they are not important for comparison of metadata
        const parsedA = XML.parse(a, { arrayMode: true, ignoreAttributes: true });
        const parsedB = XML.parse(b, { arrayMode: true, ignoreAttributes: true });

        // Compare parsed XML
        return deepCompare(parsedA, parsedB, {
                primitiveCompare: (a, b) => {
                    // treated empty strings, nulls and undefineds as equals
                    return a === b || (!a && !b);
                },
                // Should we ignore element order or artay elements or not?
                // ignoreArrayOrder: true,
            }) === false;
    }
}
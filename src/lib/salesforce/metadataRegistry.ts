// node_modules\@salesforce\source-deploy-retrieve\lib\src\metadata-registry\data\registry.json
import { registry as registryData, MetadataType as SfdxMetadataType } from '@salesforce/source-deploy-retrieve';
import { typeDefs } from 'salesforce-alm/metadata/metadataTypeInfos.json';
import { metadataObjects } from 'salesforce-alm/metadata/describe.json';
import { MetadataObject } from 'jsforce';
import { singletonMixin } from '@vlocode/util';
import { injectable, LifecyclePolicy } from '@vlocode/core';

export interface MetadataType extends Partial<SfdxMetadataType>, MetadataObject {
    isBundle: boolean;
    nameForMsgs?: string;
    nameForMsgsPlural?: string;
}

@singletonMixin
@injectable( { lifecycle: LifecyclePolicy.singleton } )
export class MetadataRegistry {

    private readonly registry = new Array<MetadataType>();
    private readonly types = new Map<string, MetadataType>();
    private readonly suffixes = new Map<string, string>();

    constructor() {
        // Init metadata
        for (const metadataObject of metadataObjects.map(md => Object.assign({}, md) as MetadataType)) {
            const sfdxRegistryData = registryData.types[metadataObject.xmlName.toLocaleLowerCase()];
            if (sfdxRegistryData) {
                Object.assign(metadataObject, sfdxRegistryData);
                metadataObject.isBundle = metadataObject.strategies?.adapter == 'bundle';
            } else {
                metadataObject.isBundle = metadataObject.xmlName.endsWith('Bundle');
            }

            // Merge type def data
            const metadataTypeDef = typeDefs[metadataObject.xmlName];
            if (metadataTypeDef) {
                Object.assign(metadataObject, metadataTypeDef);
            }

            // Store in registry
            this.registry.push(metadataObject);
            if (this.types.has(metadataObject.xmlName.toLowerCase())) {
                console.debug(`XML Name already in-use: ${metadataObject.xmlName.toLowerCase()}`);
                continue;
            }

            this.types.set(metadataObject.xmlName.toLowerCase(), metadataObject);
            if (metadataObject.childXmlNames) {
                metadataObject.childXmlNames.forEach(childType => {
                    if (this.types.has(childType.toLowerCase())) {
                        throw `XML Name already in-use: ${childType.toLowerCase()}`;
                    }
                    this.types.set(childType.toLowerCase(), metadataObject);
                });
            }
        }

        // Init case insensitive suffix to type map
        for (const suffix of Object.keys(registryData.suffixes)) {
            this.suffixes.set(suffix.toLowerCase(), registryData.suffixes[suffix]);
        }
    }

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX registry
     */
    public getMetadataTypes() : MetadataType[] {
        return this.registry;
    }

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX registry
     */
    public getMetadataSuffixes() : string[] {
        return [...Object.keys(registryData.suffixes)];
    }

    /**
     * Returns true if the selected file is a metadata type based on it's suffix
     * @param suffix File suffix without .
     * @returns 
     */
    public isMetadataSuffix(suffix: string) {
        return this.suffixes.has(suffix.toLowerCase());
    }

    /**
     * Get the metadata type info based on XML name
     * @param type 
     * @returns 
     */
    public getMetadataType(type: string) {
        return this.types.get(type.toLowerCase());
    }

    /**
     * Get the primary Metadata type for a given file suffix
     * @param suffix File suffix without .
     * @returns 
     */
    public getMetadataTypeBySuffix(suffix: string) : MetadataType | undefined {
        const metadataType = this.suffixes.get(suffix.toLowerCase());
        return metadataType ? this.getMetadataType(metadataType) : undefined;
    }
}
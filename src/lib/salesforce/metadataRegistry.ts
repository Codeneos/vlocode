// node_modules\@salesforce\source-deploy-retrieve\lib\src\metadata-registry\data\registry.json
import { registryData, MetadataType as SfdxMetadataType } from '@salesforce/source-deploy-retrieve';
import { typeDefs } from 'salesforce-alm/metadata/metadataTypeInfos.json';
import { metadataObjects } from 'salesforce-alm/metadata/describe.json';
import { MetadataObject } from 'jsforce';
import { singletonMixin } from 'lib/util/singleton';
import { injectable } from 'lib/core';
import { arrayMapPush } from 'lib/util/collection';

export interface MetadataType extends Partial<SfdxMetadataType>, MetadataObject {
    isBundle: boolean;
    nameForMsgs?: string;
    nameForMsgsPlural?: string;
}

@singletonMixin
@injectable()
export class MetadataRegistry {

    private readonly registry = new Array<MetadataType>();
    private readonly types = new Map<string, MetadataType>();
    private readonly suffixes = new Map<string, MetadataType[]>();

    constructor() {
        console.debug('Init');
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
            if (metadataObject.suffix) {
                arrayMapPush(this.suffixes, metadataObject.suffix.toLowerCase(), metadataObject);
            }
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
        return [...this.suffixes.keys()];
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
     * Get the metadata type info based on file suffix
     * @param suffix File suffix without .
     * @returns 
     */
    public getMetadataTypesBySuffix(suffix: string) {
        return this.suffixes.get(suffix.toLowerCase());
    }
}
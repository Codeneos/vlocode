import registryData from './registry/metadataRegistry.json';
import { MetadataType as RegistryMetadataType } from './registry/types';
import { singletonMixin } from '@vlocode/util';
import { injectable, Logger } from '@vlocode/core';
import urlFormats from './metadataUrls.json';

export interface MetadataUrlFormat {
    query: string;
    nameField: string;
    url: string;
    strategy: 'tooling' | 'standard';
}

export interface MetadataType extends RegistryMetadataType {
    isBundle: boolean;
    /**
     * True when the metadata has a separate content file(s) this implies that
     * any -meta.xml file is a meta file and not a content file and should not be renamed.
     */
    hasContent: boolean;
    /**
     * Name of the XML tag used for this metadata type
     * @deprecated Use {@link MetadataType.name} instead
     */
    xmlName: string;
    /**
     * Array with the list of child XML fragments that match this metadata type
     */
    childXmlNames: string[];
    /**
     * Human readable label for the metadata type, used in UI and commands
     * This is derived from the name of the metadata type and formatted to be more readable.
     */
    label: string;
}

@singletonMixin
@injectable.singleton()
export class MetadataRegistry {

    private readonly registry = new Array<MetadataType>();
    private readonly types = new Map<string, MetadataType>();
    private readonly urlFormats = new Map<string, MetadataUrlFormat>();
    private readonly suffixes = new Map<string, string>();

    constructor(private readonly logger: Logger) {
        // Init metadata
        for (const registryEntry of Object.values(registryData.types)) {
            const metadataObject = registryEntry as MetadataType;

            metadataObject.xmlName = metadataObject.name;
            metadataObject.label = this.formatLabel(metadataObject.name);
            metadataObject.childXmlNames = Object.values(metadataObject.children?.types ?? []).map(({ name }) => name);
            metadataObject.isBundle = metadataObject.strategies?.adapter == 'bundle' ||  metadataObject.name.endsWith('Bundle');
            metadataObject.hasContent = metadataObject.strategies?.adapter == 'matchingContentFile' ||
                metadataObject.strategies?.adapter == 'mixedContent';

            // Store in registry
            this.registry.push(metadataObject);
            if (this.types.has(metadataObject.name.toLowerCase())) {
                this.logger.warn(`XML Name already in-use: ${metadataObject.name.toLowerCase()}`);
                continue;
            }

            this.types.set(metadataObject.name.toLowerCase(), metadataObject);
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
     * Converts a camelCase or PascalCase string to a proper label format
     * @param name The name to format
     * @returns The formatted label
     */
    private formatLabel(name: string): string {
        if (!name) {
            return '';
        }

        // Insert spaces before uppercase letters (except the first one)
        // Handle sequences of uppercase letters properly (e.g., "XMLParser" -> "XML Parser")
        const result = name
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Insert space between uppercase sequences and following lowercase
            .replace(/([0-9])([A-Z])/g, '$1 $2') // Insert space between numbers and uppercase letters
            .replace(/([a-zA-Z])([0-9])/g, '$1 $2'); // Insert space between letters and numbers

        // Capitalize first letter and return
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    public getUrlFormat(type: string) {
        return { ...urlFormats.$default, ...(urlFormats[type] ?? {}) };
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
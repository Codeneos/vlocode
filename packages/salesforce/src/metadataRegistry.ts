import registryData from './registry/metadataRegistry.json';
import { presetMap as registryPresets } from './registry/presets';
import { MetadataType as RegistryMetadataType } from './registry/types';

import { injectable } from '@vlocode/core';
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

@injectable.singleton()
class MetadataInfoStore {
    readonly registry = new Array<MetadataType>();
    readonly types = new Map<string, MetadataType>();
    readonly suffixes = new Map<string, string>();

    public load(
        data: { 
            types?: RegistryMetadataType[], 
            suffixes?: Record<string, string> 
        }
    ) {
        // Init metadata registry
        for (const registryEntry of (data.types ?? [])) {
            const metadataObject = registryEntry as MetadataType;

            metadataObject.xmlName = metadataObject.name;
            metadataObject.label = this.formatLabel(metadataObject.name);
            metadataObject.childXmlNames = Object.values(metadataObject.children?.types ?? []).map(({ name }) => name);
            metadataObject.isBundle = metadataObject.strategies?.adapter == 'bundle' ||  metadataObject.name.endsWith('Bundle');
            metadataObject.hasContent = metadataObject.strategies?.adapter == 'matchingContentFile' ||
                metadataObject.strategies?.adapter == 'mixedContent';

            // Store in registry
            this.registry.push(metadataObject);

            // Store in types map
            this.types.set(metadataObject.name.toLowerCase(), metadataObject);
            if (metadataObject.childXmlNames) {
                metadataObject.childXmlNames.forEach(childType => {
                    this.types.set(childType.toLowerCase(), metadataObject);
                });
            }
        }

        // Init case insensitive suffix to type map
        for (const [suffix, type] of Object.entries(data.suffixes ?? {})) {
            this.suffixes.set(suffix.toLowerCase(), type);
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
}

/**
 * Metadata registry for Salesforce metadata types.
 * 
 * This namespace provides access to bundled metadata type information, 
 * URL formats, and utility methods for working with Salesforce metadata. 
 * 
 * The latest metadata types are loaded from Salesforce when the package is build, 
 * the build date determines the API version of the metadata registry.
 */
export namespace MetadataRegistry {
    
    /**
     * Singleton instance of the metadata registry store
     * @returns {MetadataInfoStore} The singleton instance of the metadata registry store
     */
    export const store = new MetadataInfoStore();

    // Load the metadata registry data
    store.load({
        types: Object.values(registryData.types) as RegistryMetadataType[],
        suffixes: registryData.suffixes
    });

    /**
     * Enable beta features in the metadata registry decomposition
     * load presets and metadata into the store overriding the default values.
     * @param presetName 
     */
    export function loadPresets(presetName: string) {
        const preset = registryPresets.get(presetName);
        if (!preset) {
            throw new Error(`Metadata preset '${presetName}' not found`);
        }
        store.load({ 
            types: Object.values(preset.types) as RegistryMetadataType[],
            suffixes: preset.suffixes
        });
    }

    /**
     * Loads all experimental decomposition presets into the metadata registry.
     */
    export function loadAllPresets() {
        for (const presetName of registryPresets.keys()) {
            loadPresets(presetName);
        }
    }

    /**
     * List all available presets in the metadata registry.
     * @returns 
     */
    export function getPresets() {
        return Array.from(registryPresets.keys());
    }

    /**
     * Get the URL format for a given metadata type
     * @param type Metadata type name or XML name
     * @returns {MetadataUrlFormat} The URL format for the given metadata type
     * @throws {Error} If the metadata type is not found
     */
    export function getUrlFormat(type: string) {
        return { ...urlFormats.$default, ...(urlFormats[type] ?? {}) };
    }

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX registry
     */
    export function getMetadataTypes() : MetadataType[] {
        return store.registry;
    }

    /**
     * Get the list of supported metadata types for the current organization merged with static metadata from the SFDX registry
     */
    export function getMetadataSuffixes() : string[] {
        return [...Object.keys(registryData.suffixes)];
    }

    /**
     * Returns true if the selected file is a metadata type based on it's suffix
     * @param suffix File suffix without .
     * @returns 
     */
    export function isMetadataSuffix(suffix: string) {
        return store.suffixes.has(suffix.toLowerCase());
    }

    /**
     * Get the metadata type info based on XML name
     * @param type 
     * @returns 
     */
    export function getMetadataType(type: string) {
        return store.types.get(type.toLowerCase());
    }

    /**
     * Get the primary Metadata type for a given file suffix
     * @param suffix File suffix without .
     * @returns 
     */
    export function getMetadataTypeBySuffix(suffix: string) : MetadataType | undefined {
        const metadataType = store.suffixes.get(suffix.toLowerCase());
        return metadataType ? getMetadataType(metadataType) : undefined;
    }
}
/**
 * Symbol to access the cpnfiguration section name on a configuration object.
 */
export const configurationSection = Symbol('[[section]]');
export const storeAsOverrideMethod = 'storeAsOverride';

export abstract class BaseConfiguration {
    /**
     * Get the section name from which this configuration was loaded.
     */
    [configurationSection]: string;

    /**
     * Store an configuration value as override; by default configuration gets saved as workspace configuration. Using this method you can update 
     * any configuration key as override
     * @param key Key to override
     * @param value New override value to store
     */
    abstract [storeAsOverrideMethod](key: string, value: any): void;
}
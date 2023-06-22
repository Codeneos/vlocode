
import * as constants from '../constants';
import { Iterable } from '@vlocode/util';
import * as xml2js from 'xml2js';

export interface MetadataManifest {
    apiVersion: string;
    files: {
        [packagePath: string]: ({
            type?: undefined;
            name?: undefined;
        } | {
            type: string;
            name: string;
        }) & ({
            body?: undefined;
            localPath: string;
        } | {
            body: Buffer | string;
            localPath?: undefined;
        });
    };
}

/**
 * Object that describe the salesforce package XML, can be converted into a package.xml file body or JSON structure
 */
export class PackageManifest {
    private readonly metadataMembers = new Map<string, Set<string>>();

    /**
     * Returns `true` if the package is empty otherwise `false`
     */
    public get isEmpty() {
        return this.metadataMembers.size === 0;
    }

    /**
     * Get all types that are mentioned in this package.
     */
    public types() {
        return [...this.metadataMembers.keys()];
    }

    /**
     * Add a new member/s to the package XML manifest
     * @param type Type of component to add
     * @param member Name of the component/s to add
     */
    public add(type: string, member: string | string[]): void {
        // Add component to package if this is a meta like file
        const membersToAdd = Array.isArray(member) ? member : [ member ];

        let members = this.metadataMembers.get(type);
        if (!members) {
            this.metadataMembers.set(type, (members = new Set<string>()));
        }

        if (members.has('*')) {
            return;
        }

        if (membersToAdd.includes('*')) {
            members.clear();
        }

        membersToAdd.forEach(member => members?.add(member));
    }

    /**
     * Removes a member from the manifest
     * @param type Type of component to remove
     * @param member Name of the component to remove
     */
    public remove(type: string, member: string): void {
        const members = this.metadataMembers.get(type);
        
        if (!members) {
            return;
        }

        members.delete(member);
    }

    /**
     * Get a list of all components of the specified type in this package
     * @param type The XML type to list the components from
     */
    public list(type?: string): string[] {
        if (type) {
            return Array.from(this.metadataMembers.get(type)?.values() ?? []);
        }
        return Iterable.reduce(this.metadataMembers.entries(), (arr, [,members]) => arr.concat(Array.from(members)), new Array<string>());
    }

    /**
     * Count the number of package members in the current manifest
     * @param type The XML type to count
     */
    public count(type?: string): number {
        if (type) {
            return this.metadataMembers.get(type)?.size ?? 0;
        }
        return Iterable.reduce(this.metadataMembers.entries(), (sum, [,members]) => sum + members.size, 0);
    }

    /**
     * Determine if the specified type exists in the current manifest and has members
     * @param type 
     */
    public has(type: string): boolean {
        return this.count(type) > 0;
    }

    /**
     * Converts the contents of the package to a JSON structure that can be use for retrieval
     */
    public toJson(apiVersion: string): {
        version: string;
        types: {
            name: string;
            members: string[];
        }[];
    } {
        if (!/^\d{2,3}\.\d$/.test(apiVersion)) {
            throw new Error(`Invalid API version: ${apiVersion}`);
        }

        return {
            version: apiVersion,
            types: [...this.metadataMembers.entries()].map(([name, members]) => ({ name, members: [...members.values()] }))
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    public toXml(apiVersion: string): string {
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
        return xmlBuilder.buildObject({
            Package: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...this.toJson(apiVersion)
            }
        });
    }

    /**
     * Creates a package XML structure object from a MetadataManifest
     * @param manifest The manifest to create a PackageXML from
     */
    static from(manifest: MetadataManifest): PackageManifest {
        const packageXml = new PackageManifest();
        for (const info of Object.values(manifest.files)) {
            if (info.type) {
                packageXml.add(info.type, info.name);
            }
        }
        return packageXml;
    }
}


import * as constants from '@constants';
import { Iterable } from 'lib/util/iterable';
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
     * Get all types that are mentioned in this package.
     */
    public *types() {
        yield *this.metadataMembers.keys();
    }

    /**
     * Add a new memeber to te package XML manifest
     * @param type Type of component to add
     * @param member Name of the component to add
     */
    public add(type: string, member: string): void {
        // Add component to package if this is a meta like file
        let members = this.metadataMembers.get(type);
        if (members == null) {
            this.metadataMembers.set(type, members = new Set<string>());
        }

        if (members.has('*')) {
            return;
        }

        if (member == '*') {
            members.clear();
        }

        members.add(member);
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

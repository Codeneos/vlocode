
import * as constants from '@constants';
import * as xml2js from 'xml2js';

export interface MetadataManifest {
    apiVersion?: string;
    files: {
        [packagePath: string]: {
            type?: string;
            name?: string;
            body?: Buffer | string;
            localPath?: string;
        };
    };
}

/**
 * Object that describe the salesforce package XML, can be converted into a package.xml file body or JSON structure
 */
export class PackageXml {
    private readonly metadataMembers = new Map<string, Set<string>>();
    constructor(public readonly version: string) {
        if (!/^\d{2,3}\.\d$/.test(version)) {
            throw new Error(`Invalid API version: ${version}`);
        }
    }
    /**
     * Add a new memeber to te package XML manifest
     * @param type Type of component to add
     * @param member Name of the component to add
     */
    public add(type: string, member: string): void {
        if (!type) {
            throw new Error('Type cannot be an empty or null string');
        }
        if (!member) {
            throw new Error('member cannot be an empty or null string');
        }
        // Add component to package if this is a meta like file
        let members = this.metadataMembers.get(type);
        if (members == null) {
            this.metadataMembers.set(type, members = new Set<string>());
        }
        members.add(member);
    }
    /**
     * Converts the contents of the package to a JSON structure that can be use for retrieval
     */
    public toJson(): {
        version: string;
        types: {
            name: string;
            members: string[];
        }[];
    } {
        return {
            version: this.version,
            types: [...this.metadataMembers.entries()].map(([name, members]) => ({ name, members: [...members.values()] }))
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    public toXml(): string {
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
        return xmlBuilder.buildObject({
            Package: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...this.toJson()
            }
        });
    }

    /**
     * Creates a package XML structure object from a MetadataManifest
     * @param manifest The manifest to create a PackageXML from
     */
    static from(manifest: MetadataManifest): PackageXml {
        const packageXml = new PackageXml(manifest.apiVersion || '45.0');
        for (const info of Object.values(manifest.files)) {
            packageXml.add(info.type, info.name);
        }
        return packageXml;
    }
}


import { asArray, Iterable, XML } from '@vlocode/util';

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
 * Describes the deserialized package.xml filestructure
 */
interface PackageXml {
    Package: {
        $?: Record<string, string | undefined>;
        version: string;
        types: {
            name: string;
            members: string[];
        }[];
    }
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
     * Get all types that are mentioned in this package.
     */
     public *components() {
        for (const [componentType, members] of this.metadataMembers.entries()) {
            yield *Iterable.map(members, componentName => ({ componentType, componentName }));
        }
    }

    /**
     * Add a new member(s) to the package XML manifest
     * @param type Type of component to add
     * @param member Name of the component(s) to add
     */
    public add(type: string, member: string | Iterable<string>): void {
        let members = this.metadataMembers.get(type);
        if (!members) {
            this.metadataMembers.set(type, (members = new Set<string>()));
        }

        if (members.has('*')) {
            return;
        }

        if (typeof member === 'string') {
            if (member === '*') {
                members.clear();
                members.add('*');
            } else {
                members.add(member);
            }
        } else {
            for (const m of member) {
                if (m === '*') {
                    members.clear();
                    members.add('*');
                    return;
                } else {
                    members.add(m);
                }
            }
        }
    }

    /**
     * Removes one or more members from the manifest, if no member is specified all members of the specified type are removed.
     * @param type Type of component to remove
     * @param member If specified, the name of the component to remove. If not specified, all components of the specified type are removed.
     */
    public remove(type: string, member?: string | Iterable<string>): void {
        const members = this.metadataMembers.get(type);

        if (!members) {
            return;
        }

        if (!member) {
            this.metadataMembers.delete(type);
        } else if (typeof member === 'string') {
            members.delete(member);
        } else {
            Iterable.forEach(member, m => members.delete(m));
        }
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
    public toJson(apiVersion: string): PackageXml['Package'] {
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
        return XML.stringify({
            Package: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...this.toJson(apiVersion)
            }
        });
    }

    /**
     * Creates a new package XML structure object from a JSON structure or a package.xml file
     * @param data Deserialized JSON structure or package.xml file
     * @returns New PackageManifest object
     */
    public static fromJson(data: PackageXml['Package'] | PackageXml): PackageManifest {
        if (data['Package']) {
            data = data['Package'] as PackageXml['Package'];
        } else {
            data = data as PackageXml['Package'];
        }

        const manifest = new PackageManifest();
        for (const info of Object.values(asArray(data.types))) {
            asArray(info.members).forEach(member => manifest.add(info.name, member));
        }
        return manifest;
    }

    /**
     * Deserializes a package.xml file into a package XML structure object
     * @param manifest Buffer or string containing the package.xml file contents
     * @returns New PackageManifest object
     */
    public static fromPackageXml(manifest: string | Buffer): PackageManifest {
        return this.fromJson(XML.parse(manifest));
    }

    /**
     * Creates a package XML structure object from a MetadataManifest
     * @param manifest The manifest to create a PackageXML from
     */
    public static from(manifest: MetadataManifest | string | Buffer): PackageManifest {
        if (typeof manifest === 'string' || Buffer.isBuffer(manifest)) {
            return this.fromPackageXml(manifest)
        }

        const packageXml = new PackageManifest();
        for (const info of Object.values(manifest.files)) {
            if (info.type) {
                packageXml.add(info.type, info.name);
            }
        }
        return packageXml;
    }
}

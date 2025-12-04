import { isUtf8 } from "node:buffer";
import { Minimatch } from "minimatch";
import type { SalesforcePackageComponentFile } from "../package";
import type { SalesforcePackageBuilderPlugin } from "../packageBuilderPlugin";
import type { SalesforcePackageEntry } from "../packageBuilder";

export interface ReplacementDetail {
    /**
     * Token to replace in the file content, all text matching this token will be replaced with the replacement value.
     */
    token: string | RegExp;
    /**
     * Replacement value or function to generate replacement value
     */
    replacement: string | ((file: string, data: string | Buffer) => string);
    /**
     * Match file pattern to apply the replacement to.
     */
    files?: string | string[];
    /**
     * Match metadata type to apply the replacement to.
     */
    types?: string | string[];
}

class TokenReplacement {
    private filePatterns?: Minimatch[];
    private metadataTypes?: string[];

    constructor(public detail: ReplacementDetail) {
        const filePatterns = detail.files 
            ? (Array.isArray(detail.files) ? detail.files : [ detail.files ])
            : undefined;
        const metadataTypes = detail.types 
            ? (Array.isArray(detail.types) ? detail.types : [ detail.types ]) 
            : undefined;
        this.filePatterns = filePatterns?.map(pattern => new Minimatch(pattern, { nocomment: true, nocase: true }));
        this.metadataTypes = metadataTypes?.map(pattern => pattern.toLocaleLowerCase());
    }
    
    public async isMatch(entry: SalesforcePackageComponentFile) {
        if (this.filePatterns) {
            if (!this.filePatterns.some(pattern => pattern.match(entry.packagePath))) {
                return false;
            }
        }
        if (this.metadataTypes) {
            const metadataType = entry.componentType.toLocaleLowerCase();
            if (!this.metadataTypes.includes(metadataType)) {
                return false;
            }
        }
        return true;
    }

    public async apply(data: Buffer | string, file: string) {
        const replacementValue = typeof this.detail.replacement === 'function' 
            ? this.detail.replacement(file, data) 
            : this.detail.replacement;

        if (typeof data === 'string') {
            return data.replace(this.detail.token, replacementValue);
        }
        return Buffer.from(data.toString().replace(this.detail.token, replacementValue));
    }
}

/**
 * TokenReplacementPlugin
 *
 * A package-entry transformer that performs token-based string replacements on package files.
 * You can register one or more TokenReplacement instances (or simple [token, replacement] tuples)
 * with the plugin; when the plugin is applied to a package entry it will iterate the registered
 * replacements and apply each one that matches the entry.
 *
 * Replacements are applied in the order they were added. Each replacement decides whether it
 * applies to a given entry via its asynchronous isMatch(...) predicate and performs the actual
 * substitution via its asynchronous apply(...) method. The plugin mutates the entry.data field
 * in place (Buffer or string) and returns the modified entry.
 *
 * @remarks
 * - Avoid adding overly broad (global) replacements unless you intend the token to be replaced
 *   everywhere: global replacements can have unintended side effects.
 * - The plugin is intended to be used as a PackageEntryTransformer (see `transform` getter).
 * - The plugin preserves the original entry reference and only replaces the entry.data value.
 *
 * @example
 * // Adding replacements:
 * // const plugin = new TokenReplacementPlugin([
 * //   ['$CURRENT_USER', 'peter.smith@example.com'],
 * //   ['${API_URL}', 'https://api.example.com']
 * // ]);
 *
 * // Registering TokenReplacement instances:
 * // plugin.add(new TokenReplacement({ token: '$FOO', replacement: 'bar', metadataTypes: ['ApexClass'] }));
 *
 * @param replacements - Optional initial replacements. Each item may be a TokenReplacement
 *                       instance or a [token, replacement] tuple.
 *
 * Public API:
 * - constructor(replacements?)
 * - add(replacement)        Adds a TokenReplacement or [token, replacement] tuple.
 * - get transform()         Returns a PackageEntryTransformer function that can be used by the package builder.
 *
 * Internal behavior:
 * - When the transformer is invoked it calls each replacement's isMatch(entry) and, if true,
 *   calls replacement.apply(entry.data, entry.packagePath) and assigns the result to entry.data.
 * - The transformer returns the (possibly) mutated entry.
 */
export class TokenReplacementPlugin implements SalesforcePackageBuilderPlugin {

    private readonly replacements = new Array<TokenReplacement>
    
    constructor(replacements?: Array<ReplacementDetail> | [string, string][]) {
       replacements?.forEach(this.add.bind(this));
    }

    /**
     * Add a replacement token to the package builder. When building the package the token will be replaced with the replacement value.
     * Replacements are applied to all files in the package and can target specific files or metadata types or be applied globally.
    * @example
     * ```typescript
     * builder.addReplacement({
     *    token: `$CURRENT_USER`
     *    metadataTypes:
     * });
    * @remarks Avoid applying replacements globally as they can have unintended side effects.
     * @param replacement 
     */
    public add(replacement: ReplacementDetail | [string, string | ((file: string, data: string | Buffer) => string)]) {
        if (Array.isArray(replacement)) {
            this.replacements.push(new TokenReplacement({ 
                token: replacement[0], 
                replacement: replacement[1] 
            }));
        } else {
            this.replacements.push(new TokenReplacement(replacement));
        }
    }

    /**
     * Apply the token replacement plugin to a package entry.
     * @param entry The package entry to transform.
     * @returns The transformed package entry.
     */
    public async transformEntry(entry: SalesforcePackageEntry) {
        // Only apply replacements on UTF8 or ASCII text
        if (this.isBinary(entry)) {
            return;
        }
        for (const replacement of this.replacements) {
            if (await replacement.isMatch(entry)) {
                entry.data = await replacement.apply(entry.data, entry.packagePath);
            }
        }
    }

    private isBinary(entry: SalesforcePackageEntry) {
        if (entry.fsPath?.endsWith('.xml') || entry.packagePath.endsWith('.xml')) {
            return false;
        }

        if (entry.componentType ===  'StaticResource' || 
            entry.componentType ===  'ContentAsset' || 
            entry.componentType ===  'Document') {
            return true;
        }

        if (typeof entry.data === 'string') {
            return false;
        }

        return !isUtf8(entry.data);
    }
}
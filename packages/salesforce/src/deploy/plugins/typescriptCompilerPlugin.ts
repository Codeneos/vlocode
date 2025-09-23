
import type { SalesforcePackageBuilderPlugin } from "../packageBuilderPlugin";
import type { SalesforcePackageEntry } from "../packageBuilder";
import { stripTypeScriptTypes } from "node:module";

export interface TypeScriptCompilerPluginOptions {
    /**
     * Mode to use, 'transform' (default) or 'strip' (removes types only). 
     * Transform mode requires Node.js 23.2.0 or higher.
     */
    mode?: 'transform' | 'strip';
    /** Emit inline source maps (defaults false) */
    sourceMap?: boolean;
	/** Optional logger callback (level,msg) */
	logger?: (level: 'debug' | 'warn' | 'error', message: string) => void;
}

/**
 * Plugin that compiles/transforms TypeScript package entries to JavaScript by stripping TypeScript types.
 *
 * This plugin is intended for use in a Salesforce package build pipeline. It inspects each package entry
 * and, when the entry represents a non-declaration TypeScript file (".ts" but not ".d.ts"), it attempts
 * to transpile the source by removing type annotations using the runtime helper `stripTypeScriptTypes`.
 *
 * Key behaviors:
 * - Only files whose packagePath ends with ".ts" (case-insensitive) are considered; files ending with
 *   ".d.ts" are ignored.
 * - Supports entry data provided as a string or a Buffer. Other data types are ignored and the entry is
 *   left unchanged.
 * - If the runtime transformer (`stripTypeScriptTypes`) is not available, the plugin logs a warning and
 *   skips compilation.
 * - On successful transform, the plugin replaces entry.data with the transpiled JavaScript text and
 *   returns the modified entry. If the entry is not transformed, the method returns void.
 *
 * @remarks
 * - This plugin does not perform type-checking; it only removes TypeScript syntax to produce runnable JS.
 * - The plugin accepts an options object that can include a logger and any transform options forwarded
 *   to the underlying transformer (e.g. mode, sourceMap).
 *
 */
export class TypeScriptCompilerPlugin implements SalesforcePackageBuilderPlugin {
	constructor(private readonly options: TypeScriptCompilerPluginOptions = {}) {}

	/**
	 * Transform a package entry: when the entry represents a .ts file it is transpiled to JS.
	 */
	public async transformEntry(entry: SalesforcePackageEntry): Promise<SalesforcePackageEntry | void> {
        if (/.ts-meta.xml$/.test(entry.packagePath)) {
            return {
                ...entry,
                packagePath: entry.packagePath.replace(/\.ts-meta\.xml$/i, '.js-meta.xml')
            }
		}

        if (!/.ts$/.test(entry.packagePath)) {
			return; // not a TS file
		}

		if (typeof entry.data !== 'string' && !Buffer.isBuffer(entry.data)) {
			return; // unsupported data type
		}

        if (stripTypeScriptTypes === undefined ) {
            throw Error('Transpiling TypeScript files requires Node.js 22.13.0/23.2.0 or higher.');
        }

		const tsSource = typeof entry.data === 'string' ? entry.data : entry.data.toString('utf8');
        const jsSource = stripTypeScriptTypes(tsSource, { mode: 'strip', sourceMap: false, ...this.options });
        
        return {
            ...entry,
            packagePath: entry.packagePath.replace(/\.ts$/i, '.js'),
            data: jsSource
        };
	}
}
import type { SalesforcePackageEntry } from "./packageBuilder";

/**
 * Transformer function used to modify a package entry prior to packaging or deployment.
 *
 * Implementations receive a SalesforcePackageComponentFile augmented with a `data` payload
 * (either a Buffer or string) and must return a Promise that resolves to the transformed
 * package component file (also including a `data` Buffer|string).
 *
 * Use cases:
 * - Normalize or rewrite file contents (e.g. line endings, encoding).
 * - Inject build-time values or perform templating.
 * - Minify, compress, or otherwise process content bytes.
 * - Adjust component metadata or filenames before packaging.
 *
 * @param entry - The package component file to transform. Contains component metadata plus
 *                a `data` property holding the file contents as a Buffer or string.
 * @returns A Promise that resolves to the transformed package component file. The returned
 *          object should preserve the expected shape (including a `data` property of type Buffer | string).
 *
 * @remarks
 * - Prefer returning a new object or a shallow copy when making modifications to avoid
 *   unintended shared-state mutations.
 * - Any thrown errors or rejected promises will typically bubble up to the deployment pipeline
 *   and may abort the operation.
 *
 * @example
 * // Example (conceptual): read `entry.data` as text, replace placeholders, then return
 * // the entry with `data` as a Buffer containing the updated text.
 */
export interface PackageEntryTransformer {
    (entry: SalesforcePackageEntry): Promise<SalesforcePackageEntry | undefined | void>;
}

/**
 * Plugin hook interface for extending the Salesforce package build process.
 *
 * Implementations can provide a transformEntry function to participate in the
 * construction of the package manifest and payload. The transformer is invoked
 * for each package entry and may be used to modify, replace, add, or remove
 * entries before they are included in the final package.
 *
 * Typical uses:
 * - Rename or relocate entries in the package.
 * - Filter out files that should not be deployed.
 * - Inject generated or synthetic entries (for example, auto-generated metadata).
 *
 * Transformer implementations should be deterministic and avoid harmful side
 * effects. If transformers are executed concurrently by the build system,
 * ensure thread-safety and avoid shared mutable state.
 *
 * @public
 * @see PackageEntryTransformer
 */
export interface SalesforcePackageBuilderPlugin {
    /**
     * {@link PackageEntryTransformer} function to modify package entries during the build process.
     */
    transformEntry?: PackageEntryTransformer;
}
import { VlocityDatapackReference } from "@vlocode/vlocity";
import { DatapackDeploymentRecord } from "./datapackDeploymentRecord";

/**
 * Represents a request for dependency resolution.
 */
export type DependencyResolutionRequest = {
    /**
     * The datapack record that the dependency belongs to.
     */
    datapackRecord: DatapackDeploymentRecord;
    /**
     * The dependency to resolve.
     */
    dependency: VlocityDatapackReference;
}

export type DependencyResolutionResult = {
    /**
     * The resolved dependency as a string, or undefined if the dependency cannot be resolved due to it not being found.
     */
    resolution: string | undefined;
    /**
     * The error that occurred during dependency resolution, if any.
     */
    error?: unknown;
}

/**
 * Represents a dependency resolver that resolves dependencies for datapack records.
 */
export interface DatapackDependencyResolver {
    /**
     * Resolves a single dependency for a datapack record.
     * @param dependency - The datapack record dependency to resolve.
     * @param datapackRecord - The datapack record that the dependency belongs to.
     * @returns A promise that resolves to the resolved dependency as a string, or undefined if the dependency cannot be resolved.
     */
    resolveDependency(dependency: VlocityDatapackReference, datapackRecord: DatapackDeploymentRecord): Promise<string | undefined>;

    /**
     * Resolves multiple dependencies for multiple datapack records.
     * @param dependencies - An array of dependency resolution requests.
     * @returns A promise that resolves to an array of resolved dependencies as strings, or undefined if the dependency cannot be resolved.
     * The order of the resolved dependencies in the array should match the order of the dependency resolution requests.
     * If a dependency cannot be resolved, the corresponding array element should be undefined.
     * If an error occurs during dependency resolution, the promise should resolve but with the error property set for the corresponding dependency.
     * If an generic error occurs, the promise should reject with the error and no resolved dependencies.
     */
    resolveDependencies(dependencies: DependencyResolutionRequest[]): Promise<DependencyResolutionResult[]>;
}

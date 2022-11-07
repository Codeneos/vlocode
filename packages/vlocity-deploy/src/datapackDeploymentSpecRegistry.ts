import { Container, container, injectable, LifecyclePolicy, Logger, ServiceCtor } from "@vlocode/core";
import { lazy } from "@vlocode/util";
import { DatapackFilter } from "./datapackDeployer";
import { DatapackDeploymentSpec } from "./datapackDeploymentSpec";

@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackDeploymentSpecRegistry {

    /**
     * Get the current global {@link DatapackDeploymentSpecRegistry} instance registered in the root container
     */
    public static readonly instance = lazy(() => container.get(DatapackDeploymentSpecRegistry));
    public static specCounter = 0;

    private readonly specs: Record<number, { 
        key: number,
        filter: DatapackFilter, 
        type?: ServiceCtor<DatapackDeploymentSpec>, 
        instance?: DatapackDeploymentSpec 
    }> = {};

    constructor(private readonly container: Container) {
    }

    /**
     * Standard iterator to iterate over the specs in this registry
     * @returns Iterable
     */
    public *getSpecs() {
        for (const globalSpec of Object.values(DatapackDeploymentSpecRegistry.instance.specs)) {
            if (this.specs[globalSpec.key]) {
                continue;
            }

            // Copy global specs to local instance; do not copy instances when there is a spec-type set
            this.specs[globalSpec.key] = { 
                key: globalSpec.key,
                filter: globalSpec.filter,
                type: globalSpec.type,
                instance: !globalSpec.type ? globalSpec.instance : undefined,
            };
        }

        for (const spec of Object.values(this.specs)) {
            yield {
                filter: spec.filter, 
                spec: spec.instance ?? lazy( () => spec.instance = this.container.create(spec.type!) )
            };
        }
    }

    /**
     * Register an individual spec function to be executed in for the datapacks of the specified type in this deployment.
     * @param datapackType type of the Datapack 
     * @param fn name of the hook function
     * @param executor function executed
     */
    public registerFunction<T extends keyof DatapackDeploymentSpec>(datapackType: string, fn: T, executor: DatapackDeploymentSpec[T]) {
        this.register(datapackType, { [fn]: executor });
    }

    /**
     * Register a spec with 1 or more hooks to be executed in for the datapacks of the specified type in this deployment. 
     * @param filter filter that determines when this datapack is applied
     * @param spec Object matching the {@link DatapackDeploymentSpec}-shape
     */
    public register(filter: DatapackFilter | string, spec: DatapackDeploymentSpec | ServiceCtor<DatapackDeploymentSpec>) {
        if (typeof filter === 'string') {
            filter = { datapackFilter: filter };
        }

        this.specs[++DatapackDeploymentSpecRegistry.specCounter] = {
            key: DatapackDeploymentSpecRegistry.specCounter, 
            filter, 
            type: typeof spec === 'function' ? spec : undefined,
            instance: typeof spec !== 'function' ? spec : undefined,
        };
    }
}

/**
 * Classes decorated with this decorator will be registered in the {@link DatapackDeploymentSpecRegistry} and in the global-container as transient service types.
 * @param filter filter that determines to which datapacks or sobject-records this deployment spec applies
 */
export function deploymentSpec(filter: DatapackFilter) {
    const containerDecorator = injectable({ lifecycle: LifecyclePolicy.transient });
    return function (constructor: any) {
        constructor = !injectable.isDecorated(constructor) ? containerDecorator(constructor) : constructor;
        DatapackDeploymentSpecRegistry.instance.register(filter, constructor);
        return constructor;
    };
}
import { visitObject } from "@vlocode/util";

export class NamespaceService {
    /**
     * Replaces a namespace place holder with the actual namespace in the target org
     * @param namespacedString 
     * @returns 
     */
    public updateNamespace(namespacedString: string) {
        return namespacedString;
    }

    /**
     * Replace the namespace with a placeholder string
     * @param name text to update
     */
    public replaceNamespace(name: string) {
        return name;
    }

    /**
     * Generic object property replacer for updating source or target namespaces on objects and arrays
     * @param obj Object
     * @returns 
     */
    public updateObjectNamespace<T extends object>(obj: T): T {
        return this.updateObject(obj, this.updateNamespace.bind(this));
    }

    private updateObject<T extends object>(obj: T, replacerFn: (value: string) => string): T {
        return visitObject(obj, (prop, value, target) => {
            if (typeof prop === 'string') {
                const newProp = replacerFn(prop);
                if (newProp !== prop) {
                    delete target[prop];
                }
                prop = newProp;
            }
            if (typeof value === 'string') {
                target[prop] = replacerFn(value);
            }
        });
    }
}
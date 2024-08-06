import { injectable } from "@vlocode/core";
import { visitObject } from "@vlocode/util";

@injectable.singleton()
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
    public updateObjectNamespace(obj: object) {
        return this.updateObject(obj, this.updateNamespace.bind(this));
    }

    private updateObject(obj: object, replacerFn: (value: string) => string) {
        return visitObject(obj, (prop, value, target) => {
            if (typeof prop === 'string') {
                const newProp = replacerFn(prop);
                if (newProp !== prop) {
                    delete target[prop];
                }
                prop = newProp;
            }
            target[prop] = replacerFn(value);
        });
    }
}
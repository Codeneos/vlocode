export abstract class NamespaceService {

    public abstract getNamespace(): string | undefined;

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

    /**
     * Generic object property replacer for replacing source namespaces on objects and arrays
     * @param obj Object
     * @returns
     */
    public replaceObjectNamespace<T extends object>(obj: T): T {
        return this.updateObject(obj, this.replaceNamespace.bind(this));
    }

    private updateObject<T extends object>(obj: T, replacerFn: (value: string) => string): T {
        for (const [prop, value] of Object.entries(obj)) {
            const newProp = replacerFn(prop);
            const newValue = typeof value === 'string'
                ? replacerFn(value)
                : value && typeof value === 'object'
                    ? this.updateObject(value, replacerFn)
                    : value;

            if (newProp !== prop) {
                delete obj[prop];
            }
            obj[newProp] = newValue;
        }
        return obj;
    }
}

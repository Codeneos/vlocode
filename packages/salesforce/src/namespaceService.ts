import { injectable } from "@vlocode/core";

@injectable()
export class NamespaceService {
    /**
     * Replaces a namespace place holder with the actual namespace in the target org
     * @param namespacedString 
     * @returns 
     */
    public updateNamespace(namespacedString: string): string {
        return namespacedString;
    }

    /**
     * Replace the namespace with a placeholder string
     * @param name text to update
     */
     public replaceNamespace(name: string) {
        return name;
    }
}
import { TypeNameContext } from "../grammar";
import { ApexTypeRef } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

/**
 * Collects all type references in a given Apex syntax tree and returns them as an array of unique `ApexTypeRef` objects that are referenced in the tree.
 * Useful for getting all external types referenced in a given Apex syntax tree.
 */
export class TypeRefCollector extends ApexSyntaxTreeVisitor<ApexTypeRef[]> {
    private distinctTypes = new Set<string>();

    constructor(private options?: { excludeSystemTypes?: boolean }) {
        super([]);
    }

    public visitTypeName(ctx: TypeNameContext) {
        this.addDistinct(new TypeRefVisitor().visit(ctx));
        return this.state;
    }

    private addDistinct(typeRef: ApexTypeRef | null) {
        if (!typeRef) {
            return;
        }

        if (!this.options?.excludeSystemTypes || !typeRef.isSystemType) {
            const typeName = `${typeRef.name}`;
            if (!this.distinctTypes.has(typeName)) {
                this.distinctTypes.add(typeName);
                this.state.push(typeRef);
            }
        }

        if (typeRef.genericArguments && typeRef.genericArguments.length > 0) {
            for (const genericArgument of typeRef.genericArguments) {
                this.addDistinct(genericArgument);
            }
        }
    }
}
import { TypeRefContext } from "../grammar";
import { ApexTypeRef } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

export class TypeListVisitor extends ApexSyntaxTreeVisitor<ApexTypeRef[]> {
    constructor(state?: ApexTypeRef[]) {
        super(state ?? []);
    }

    public visitTypeRef(ctx: TypeRefContext) {
        this.state.push(new TypeRefVisitor().visit(ctx) as ApexTypeRef);
        return this.state;
    }
}
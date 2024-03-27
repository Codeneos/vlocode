import { TerminalNode } from "antlr4ng";
import { TypeArgumentsContext } from "../grammar";
import { ApexTypeRef } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { TypeListVisitor } from "./typeListVisitor";

export class TypeRefVisitor extends ApexSyntaxTreeVisitor<ApexTypeRef> {
    constructor(state: Partial<ApexTypeRef> = {}) {
        super(state as ApexTypeRef);
    }

    public visitTypeArguments(ctx: TypeArgumentsContext) {
        this.state.genericArguments = (ctx.typeList() && new TypeListVisitor().visit(ctx.typeList()!)) ?? undefined;
        return this.state;
    }

    public visitTerminal(node: TerminalNode) {
        this.state.name = node.getText();
        this.state.isSystemType = ApexTypeRef.isSystemType(this.state.name);
        return this.state;
    }
}
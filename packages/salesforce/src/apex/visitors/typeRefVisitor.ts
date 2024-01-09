import { TerminalNode } from "antlr4ng";
import { TypeArgumentsContext } from "../grammar";
import { ApexTypeRef } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { TypeListVisitor } from "./typeListVisitor";

export class TypeRefVisitor extends ApexSyntaxTreeVisitor<ApexTypeRef> {
    public static PRIMITIVE_TYPES: readonly string[] = [
        'string',
        'boolean',
        'integer',
        'decimal',
        'long',
        'double',
        'date',
        'datetime',
        'time',
        'id'
    ];

    public static SYSTEM_TYPES: readonly string[] = [
        'map',
        'set',
        'list',
        'void',
        'object',
        'sobject',
        'blob'
    ];

    constructor(state?: ApexTypeRef) {
        super(state ?? {
            name: '',
            isSystemType: false
        });
    }

    public visitTypeArguments(ctx: TypeArgumentsContext) {
        this.state.genericArguments = (ctx.typeList() && new TypeListVisitor().visit(ctx.typeList()!)) ?? undefined;
        return this.state;
    }

    public static isSystemType(typeName: string): boolean {
        return TypeRefVisitor.SYSTEM_TYPES.includes(typeName.toLowerCase()) ||
            TypeRefVisitor.PRIMITIVE_TYPES.includes(typeName.toLowerCase());
    }

    public visitTerminal(node: TerminalNode) {
        this.state.name = node.getText();
        this.state.isSystemType = TypeRefVisitor.isSystemType(this.state.name);
        return this.state;
    }
}
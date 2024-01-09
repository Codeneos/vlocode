import { TerminalNode } from "antlr4ng";
import { TypeArgumentsContext } from "../grammar";
import { ApexTypeRef } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";

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
        this.state.genericArguments = ctx.typeList().typeRef().map(typeRef => {
            return new TypeRefVisitor().visit(typeRef)
        }).filter(typeRef => typeRef !== null) as ApexTypeRef[];
        return this.state;
    }

    public isSystemType(typeName: string): boolean {
        return TypeRefVisitor.SYSTEM_TYPES.includes(typeName.toLowerCase()) ||
            TypeRefVisitor.PRIMITIVE_TYPES.includes(typeName.toLowerCase());
    }

    public visitTerminal(node: TerminalNode) {
        this.state.name = node.getText();
        this.state.isSystemType = this.isSystemType(this.state.name);
        return this.state;
    }
}
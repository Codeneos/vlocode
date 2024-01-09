import { ModifierContext, TypeRefContext, VariableDeclaratorContext } from "../grammar";
import { ApexField, ApexAccessModifier } from "../types";
import { DeclarationVisitor } from "./declarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

/**
 * Represents a visitor for field declarations in Apex.
 */
export class FieldDeclarationVisitor extends DeclarationVisitor<ApexField> {

    constructor(state?: ApexField) {
        super(state ?? {
            name: '',
            modifiers: [],
            type: {
                name: '',
                isSystemType: false
            }
        });
    }

    public visitModifier(ctx: ModifierContext) {
        if (this.visitAccessModifier(ctx)) {
            this.state.access = ctx.getText() as ApexAccessModifier;
        }
        return this.state;
    }

    public visitVariableDeclarator(ctx: VariableDeclaratorContext) {
        const name = ctx.id().getText();
        if (this.state.name) {
            if (!Array.isArray(this.state.name)) {
                this.state.name = [ this.state.name, name ];
            } else {
                this.state.name.push(name);
            }
        } else {
            this.state.name = name;
        }
        return this.state;
    }

    public visitTypeRef(ctx: TypeRefContext) {
        this.state.type = new TypeRefVisitor().visit(ctx) ?? this.state.type;
        return this.state;
    }
}
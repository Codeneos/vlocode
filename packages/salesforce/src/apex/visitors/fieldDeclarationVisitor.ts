import { ModifierContext, TypeRefContext, VariableDeclaratorContext } from "../grammar";
import { ApexField, ApexAccessModifier, ApexFieldModifier } from "../types";
import { DeclarationVisitor } from "./declarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

/**
 * Represents a visitor for field declarations in Apex.
 */
export class FieldDeclarationVisitor extends DeclarationVisitor<ApexField> {

    constructor(state?: ApexField) {
        super(state ?? {
            name: '',
            type: {
                name: '',
                isSystemType: false
            }
        });
    }

    public visitModifier(ctx: ModifierContext) {
        this.visitAccessModifier(ctx) || this.visitFieldModifiers(ctx);
        return this.state;
    }

    public visitFieldModifiers(ctx: ModifierContext) {
        if (ctx.STATIC()) {
            this.state.isStatic = true;
        } else if (ctx.FINAL()) {
            this.state.isFinal = true;
        } else if (ctx.TRANSIENT()) {
            this.state.isTransient = true;
        } else {
            return false;
        }
        return true;
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
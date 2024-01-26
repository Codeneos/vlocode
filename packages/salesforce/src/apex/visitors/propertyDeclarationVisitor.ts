import { BlockContext, GetterContext, IdPrimaryContext, ModifierContext, PropertyDeclarationContext, SetterContext, TypeRefContext, VariableDeclaratorContext } from "../grammar";
import { ApexField, ApexAccessModifier, ApexFieldModifier, ApexSourceRange, ApexProperty, ApexPropertyModifier, ApexBlock } from "../types";
import { BlockVisitor } from "./blockVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

/**
 * Represents a visitor for field declarations in Apex.
 */
export class PropertyDeclarationVisitor extends DeclarationVisitor<ApexProperty> {

    constructor(state?: ApexProperty) {
        super(state ?? {
            name: '',
            type: {
                name: '',
                isSystemType: false
            },
            sourceRange: ApexSourceRange.empty,
        });
    }

    public visitModifier(ctx: ModifierContext) {
        if (!this.visitAccessModifier(ctx) && !this.visitPropertyModifiers(ctx)) {
            if (!this.state.modifiers) {
                this.state.modifiers = [];
            }
            this.state.modifiers.push(ctx.getText() as ApexPropertyModifier);
        }
        return this.state;
    }

    public visitPropertyModifiers(ctx: ModifierContext) {
        if (ctx.STATIC()) {
            this.state.isStatic = true;
        } else if (ctx.TRANSIENT()) {
            this.state.isTransient = true;
        } else {
            return false;
        }
        return true;
    }

    public visitPropertyDeclaration(ctx: PropertyDeclarationContext): ApexProperty | null {
        this.state.name = ctx.id().getText();
        return this.visitChildren(ctx);
    }

    public visitTypeRef(ctx: TypeRefContext) {
        this.state.type = new TypeRefVisitor().visit(ctx) ?? this.state.type;
        return this.state;
    }

    public visitGetter(ctx: GetterContext): ApexProperty | null {
        const getterBlock = ctx.block();
        if (getterBlock) {
            this.state.getter = getterBlock.accept(new BlockVisitor({
                sourceRange: ApexSourceRange.fromToken(getterBlock),
            })) ?? undefined;
        }
        return this.state;
    }

    public visitSetter(ctx: SetterContext): ApexProperty | null {
        const setterBlock = ctx.block();
        if (setterBlock) {
            this.state.setter = setterBlock.accept(new SetterBlockVisitor(setterBlock)) ?? undefined;
        }
        return this.state;
    }
}

class SetterBlockVisitor extends BlockVisitor {
    constructor(setterBlock: BlockContext ) {
        super({ 
            sourceRange: ApexSourceRange.fromToken(setterBlock)
        });
    }

    public visitIdPrimary(ctx: IdPrimaryContext) {
        const idName = ctx.getText().toLowerCase();
        if (idName === 'value') {
            return this.state;
        }
        return super.visitIdPrimary(ctx);
    }
}
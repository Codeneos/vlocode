import { GetterContext, ModifierContext, PropertyDeclarationContext, SetterContext, TypeRefContext } from "../grammar";
import { ApexSourceRange, ApexProperty, ApexPropertyModifier, ApexBlock, ApexTypeRef } from "../types";
import { BlockVisitor } from "./blockVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
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

    public visitPropertyDeclaration(ctx: PropertyDeclarationContext): ApexProperty {
        this.state.name = ctx.id().getText();
        return this.visitChildren(ctx);
    }

    public visitTypeRef(ctx: TypeRefContext) {
        this.state.type = new TypeRefVisitor().visit(ctx) ?? this.state.type;
        return this.state;
    }

    public visitGetter(ctx: GetterContext): ApexProperty {
        const getterBlock = ctx.block();
        if (getterBlock) {
            const visitor = new BlockVisitor({
                sourceRange: ApexSourceRange.fromToken(getterBlock),
            });
            this.state.getter = visitor.visitChildren(getterBlock);
        }
        return this.state;
    }

    public visitSetter(ctx: SetterContext): ApexProperty {
        const setterBlock = ctx.block();
        if (setterBlock) {
            const visitor = new SetterBlockVisitor(this.state.type, ApexSourceRange.fromToken(setterBlock));
            this.state.setter = setterBlock.accept(visitor)!;
        }
        return this.state;
    }
}

class SetterBlockVisitor extends BlockVisitor<ApexBlock> {
    constructor(type: ApexTypeRef, sourceRange: ApexSourceRange) {
        super({ 
            sourceRange,
            localVariables: [{
                name: 'value',
                type, 
                sourceRange: ApexSourceRange.empty 
            }]
        });
    }
}
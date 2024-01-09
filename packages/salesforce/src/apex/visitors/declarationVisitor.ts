import { ModifierContext } from "../grammar";
import { ApexAccessModifier } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";

export abstract class DeclarationVisitor<T extends { access?: ApexAccessModifier }> extends ApexSyntaxTreeVisitor<T> {
    constructor(state: T) {
        super(state);
    }

    public visitModifier(ctx: ModifierContext) {
        this.visitAccessModifier(ctx);
        return this.state;
    }

    protected visitAccessModifier(ctx: ModifierContext): boolean {
        if (ctx.PUBLIC()) {
            this.state.access = 'public';
        } else if (ctx.PROTECTED()) {
            this.state.access = 'public';
        } else if (ctx.GLOBAL()) {
            this.state.access = 'global';
        } else if (ctx.PRIVATE()) {
            this.state.access = 'private';
        } else {
            return false;
        }
        return true;
    }
}
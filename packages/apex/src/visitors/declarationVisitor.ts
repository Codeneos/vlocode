import { stringEquals } from "@vlocode/util";
import { ModifierContext } from "../grammar";
import { ApexAccessModifier, ApexSourceRange, ApexTypeRef, ApexTypeRefSource } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";

export abstract class DeclarationVisitor<T extends { 
    access?: ApexAccessModifier, 
    modifiers?: string[], 
    refs?: ApexTypeRef[],
    sourceRange?: ApexSourceRange
}> extends ApexSyntaxTreeVisitor<T> {
    constructor(state: T) {
        super(state);
    }

    public visitModifier(ctx: ModifierContext) {
        this.addModifier(ctx.getText().toLowerCase());
        this.visitAccessModifier(ctx);
        return this.state;
    }

    protected addModifier(modifier: string) {
        if (!this.state.modifiers) {
            this.state.modifiers = [];
        }
        this.state.modifiers.push(modifier);
    }

    protected visitAccessModifier(ctx: ModifierContext): boolean {
        if (ctx.PUBLIC()) {
            this.state.access = 'public';
        } else if (ctx.PROTECTED()) {
            this.state.access = 'protected';
        } else if (ctx.GLOBAL()) {
            this.state.access = 'global';
        } else if (ctx.PRIVATE()) {
            this.state.access = 'private';
        } else {
            return false;
        }
        return true;
    }

    protected addRef(refs: ApexTypeRef | ApexTypeRef[] | undefined | null, source?: ApexTypeRefSource) {
        if (refs === undefined || refs === null) {
            return;
        }

        if (!this.state.refs) {
            this.state.refs = [];
        }

        for (const ref of Array.isArray(refs) ? refs : [ refs ]) {
            if (ref.name === 'void') {
                continue;
            }
            if (!this.state.refs.find(r => (source === undefined || r.source === source) && stringEquals(r.name, ref.name, { caseInsensitive: true}))) {
                this.state.refs.push({ ...ref, source: source ?? ref.source });
            }
        }
    }
}
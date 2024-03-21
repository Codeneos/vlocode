import { ApexBlock, ApexClass, ApexSourceRange, ApexTypeRef } from "../types";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import {  BlockContext, CatchClauseContext, DotExpressionContext, IdCreatedNamePairContext, IdPrimaryContext, LocalVariableDeclarationContext } from "../grammar";
import { TypeListVisitor } from "./typeListVisitor";
import { stringEquals } from "@vlocode/util";

export class BlockVisitor<T extends ApexBlock> extends DeclarationVisitor<T> {
    constructor(state: T) {
        super(state);
    }

    private addBlock(block: ApexBlock) {
        if (!this.state.blocks) {
            this.state.blocks = [];
        }
        this.state.blocks.push(block);
    }

    public visitBlock(ctx: BlockContext) {
        this.addBlock(
            new BlockVisitor<ApexBlock>({
                sourceRange: ApexSourceRange.fromToken(ctx)
            }).visitChildren(ctx)
        );
        return this.state;
    }

    public visitLocalVariableDeclaration(ctx: LocalVariableDeclarationContext) {
        for (const variableDeclarator of ctx.variableDeclarators()?.variableDeclarator() ?? []) {
            const variableType = ctx.typeRef().accept(new TypeRefVisitor())!;
            this.addLocalVariable(
                variableDeclarator.id().getText(),
                variableType,
                ApexSourceRange.fromToken(variableDeclarator)
            );
            variableDeclarator.expression()?.accept(this);
        }
        return this.state;
    }

    // public visitAssignExpression(ctx: AssignExpressionContext) {
    //     ctx.expression().slice(1).forEach(expr => this.visit(expr));
    //     return this.visit
    // }

    public visitCatchClause(ctx: CatchClauseContext) {
        this.addLocalVariable(
            ctx.id().getText(),
            ApexTypeRef.fromString(ctx.qualifiedName().getText()),
            ApexSourceRange.fromToken(ctx.id())
        );
        this.visitBlock(ctx.block());
        return this.state;
    }

    public visitDotExpression(ctx: DotExpressionContext) {
        // if (ctx.anyId() &&
        //     ctx.parent instanceof DotExpressionContext &&
        //     ctx.expression().getChild(0) instanceof IdPrimaryContext
        // ) {
        //     this.addRef(
        //         ApexTypeRef.fromString(ctx.getText()),
        //         'identifier'
        //     )
        //     return this.state;
        // }
        return this.visitChildren(ctx);
    }

    public visitIdPrimary(ctx: IdPrimaryContext) {
        const id = ctx.getText();
        const isLocal = this.state.localVariables?.some(v => v.name === id);
        if (!isLocal) {
            this.addRef(
                ApexTypeRef.fromString(ctx.getText()), 
                'identifier'
            );
        }
        return this.visitChildren(ctx);
    }

    public visitIdCreatedNamePair(ctx: IdCreatedNamePairContext) {
        const typeList = ctx.typeList();
        this.addRef({
            ...ApexTypeRef.fromString(ctx.anyId().getText()),
            genericArguments: (typeList && new TypeListVisitor().visit(typeList)) ?? undefined
        }, 'new');
        return this.visitChildren(ctx);
    }

    public addLocalVariable(name: string, type: ApexTypeRef, sourceRange: ApexSourceRange) {
        if (!this.state.localVariables) {
            this.state.localVariables = [];
        }
        this.state.localVariables.push({ name, type, sourceRange });
        this.addRef(type, 'localVariable');
    }

    protected getLocalVariableNames(blockHierarchy: ApexBlock[]) {
        return blockHierarchy.flatMap(block => block.localVariables ?? []).map(v => v.name);
    }

    public updateReferences(context: ApexClass) {
        const classVariables = context.fields.flatMap(f => f.name).concat(context.properties.map(p => p.name));
        for (const blockHierarchy of this.resolveBlockHierarchy()) {
            const blockLeaf = blockHierarchy[blockHierarchy.length - 1];
            if (!blockLeaf.refs) {
                continue;
            }

            const blockLocalVariables = blockHierarchy.flatMap(block => block.localVariables ?? []).map(v => v.name).concat(classVariables);
            blockLeaf.refs = blockLeaf.refs.filter(ref => {
                if (ref.source !== 'identifier') {
                    return true;
                }
                return !blockLocalVariables.some(localVar => stringEquals(localVar, ref.name, { caseInsensitive: true }));
            });
            this.addRef(blockLeaf.refs);
        }
    }

    public *resolveBlockHierarchy() : Generator<ApexBlock[]> {
        yield [ this.state ];
        for (const block of this.state.blocks ?? []) {
            for (const blocks of new BlockVisitor(block).resolveBlockHierarchy()) {
                yield [ this.state, ...blocks ];
            }
        }
    }
}
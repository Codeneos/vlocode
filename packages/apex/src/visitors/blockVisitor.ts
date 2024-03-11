import { ApexBlock, ApexSourceRange, ApexTypeRef } from "../types";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { BlockContext, IdCreatedNamePairContext, IdPrimaryContext, LocalVariableDeclarationContext } from "../grammar";
import { TypeListVisitor } from "./typeListVisitor";

export class BlockVisitor<T extends ApexBlock = ApexBlock> extends DeclarationVisitor<T> {
    constructor(state: T) {
        super(state);
    }

    public visitBlock(ctx: BlockContext) {
        ctx.statement().forEach(statement => {
            statement.accept(this);
        });
        return this.state;
    }

    public visitLocalVariableDeclaration(ctx: LocalVariableDeclarationContext) {
        const variablesNames = ctx.variableDeclarators()?.variableDeclarator()
            .map(variableDeclarator => variableDeclarator.id() );
        if (variablesNames.length) {
            const variableType = ctx.typeRef()?.accept(new TypeRefVisitor());
            variablesNames.forEach(name => {
                this.addLocalVariable(
                    name.getText(),
                    variableType!,
                    ApexSourceRange.fromToken(name)
                );
            });
        }
        return this.visitChildren(ctx);
    }

    public visitIdPrimary(ctx: IdPrimaryContext) {
        this.addRef(
            ApexTypeRef.fromString(ctx.getText())
        );
        return this.visitChildren(ctx);
    }

    public visitIdCreatedNamePair(ctx: IdCreatedNamePairContext) {
        const typeList = ctx.typeList();
        this.addRef({
            ...ApexTypeRef.fromString(ctx.anyId().getText()),
            genericArguments: (typeList && new TypeListVisitor().visit(typeList)) ?? undefined
        });
        return this.visitChildren(ctx);
    }

    public addLocalVariable(name: string, type: ApexTypeRef, sourceRange: ApexSourceRange) {
        if (!this.state.localVariables) {
            this.state.localVariables = [];
        }
        this.state.localVariables.push({ name, type, sourceRange });        
        this.addRef(type);
    }

    // public visitStatement(ctx: StatementContext) {
    //     this.state.refs.push(...(new TypeRefCollector().visit(ctx) ?? []));
    //     return this.state;
    // }
}
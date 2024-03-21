import { ApexMethod, ApexMethodModifier, ApexSourceRange, ApexTypeRef } from "../types";
import { FormalParameterVisitor } from "./formalParameterVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { AnnotationContext, BlockContext, FormalParametersContext, MethodDeclarationContext, ModifierContext } from "../grammar";
import { BlockVisitor } from "./blockVisitor";

export class MethodDeclarationVisitor extends BlockVisitor<ApexMethod> {
    constructor(state?: ApexMethod) {
        super(state ?? {
            name: '',
            returnType: {
                name: '',
                isSystemType: false
            },
            modifiers: [],
            parameters: [],
            decorators: [],
            localVariables: [],
            refs: [],
            sourceRange: ApexSourceRange.empty,
        });
    }

    public visitBlock(ctx: BlockContext) {
        return new BlockVisitor(this.state).visitChildren(ctx);
    }

    public visitAnnotation(ctx: AnnotationContext | null): ApexMethod {
        if (ctx?.qualifiedName().getText().toLowerCase() === 'istest') {
            this.state.isTest = true;
        }
        return this.state;
    }

    public visitModifier(ctx: ModifierContext) {
        if (ctx.TESTMETHOD()) {
            this.state.isTest = true;
        }
        if (ctx.ABSTRACT()) {
            this.state.isAbstract = true;
        }
        if (ctx.VIRTUAL()) {
            this.state.isVirtual = true;
        }
        if (!this.visitAccessModifier(ctx)) {
            this.state.modifiers.push(ctx.getText() as ApexMethodModifier);
        }
        this.visitAnnotation(ctx.annotation());
        return this.state;
    }

    public visitMethodDeclaration(ctx: MethodDeclarationContext) {
        this.state.name = ctx.id().getText();
        ctx.formalParameters().accept(this);
        ctx.block()?.accept(this);
        if (ctx.VOID()) {
            this.state.returnType = ApexTypeRef.fromString('void');
        } else {
            ctx.typeRef()?.accept(new TypeRefVisitor(this.state.returnType));
        }
        return this.state;
    }

    public visitFormalParameters(ctx: FormalParametersContext) {
        ctx.formalParameterList()?.formalParameter().forEach(parameter => {
            this.state.parameters.push(parameter.accept(new FormalParameterVisitor())!);
        });
        this.addRef(this.state.parameters.map(p => p.type), 'parameter');
        return this.state;
    }
}
import { ApexMethod, ApexMethodModifier } from "../types";
import { FormalParameterVisitor } from "./formalParameterVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { BlockContext, FormalParametersContext, IdContext, MethodDeclarationContext, ModifierContext, StatementContext } from "../grammar";

export class MethodDeclarationVisitor extends DeclarationVisitor<ApexMethod> {
    constructor(state?: ApexMethod) {
        super(state ?? {
            name: '',
            returnType: {
                name: '',
                isSystemType: false
            },
            modifiers: [],
            parameters: [],
            body: '',
            decorators: [],
            refs: []
        });
    }

    public visitModifier(ctx: ModifierContext) {
        if (!this.visitAccessModifier(ctx)) {
            this.state.modifiers.push(ctx.getText() as ApexMethodModifier);
        }
        return this.state;
    }

    public visitMethodDeclaration(ctx: MethodDeclarationContext) {
        ctx.id().accept(this);
        ctx.formalParameters().accept(this);
        ctx.block()?.accept(this);
        if (ctx.VOID()) {
            this.state.returnType.name = 'void';
            this.state.returnType.isSystemType = true;
        } else {
            ctx.typeRef()?.accept(new TypeRefVisitor(this.state.returnType));
        }
        return this.state;
    }

    public visitId(ctx: IdContext) {
        this.state.name = ctx.getText();
        return this.state;
    }

    public visitFormalParameters(ctx: FormalParametersContext) {
        //this.state.refs.push(...new TypeRefCollector().visit(ctx));
        ctx.formalParameterList()?.formalParameter().forEach(parameter => {
            this.state.parameters.push(parameter.accept(new FormalParameterVisitor())!);
        });
        return this.state;
    }

    public visitBlock(ctx: BlockContext) {
        ctx.statement().forEach(statement => {
            statement.accept(this);
        });
        return this.state;
    }

    public visitStatement(ctx: StatementContext) {
        //this.state.refs.push(...new TypeRefCollector().visit(ctx));
        return this.state;
    }
}
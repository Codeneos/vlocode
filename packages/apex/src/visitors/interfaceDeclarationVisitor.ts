import { ApexInterface, ApexSourceRange } from "../types";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { InterfaceBodyContext, InterfaceDeclarationContext, InterfaceMethodDeclarationContext } from "../grammar";

export class InterfaceDeclarationVisitor extends DeclarationVisitor<ApexInterface> {
    constructor(state?: ApexInterface) {
        super(state ?? {
            name: '',
            methods: [],
            refs: [],
            extends: [],
            sourceRange: ApexSourceRange.empty,
        });
    }

    public visitInterfaceDeclaration(ctx: InterfaceDeclarationContext): ApexInterface {
        this.state.name = ctx.id().getText();
        
        if (ctx.EXTENDS()) {
            // Parse `implements XXX, YYY`
            this.state.extends = ctx.typeList()?.typeRef().map(typeRef => new TypeRefVisitor().visit(typeRef)!) ?? [];
            this.addRef(this.state.extends, 'extends');
        }
        
        ctx.interfaceBody().accept(this);
        ctx.modifier().forEach(modifier => modifier.accept(this));
        return this.state;
    }

    public visitInterfaceBody(ctx: InterfaceBodyContext): ApexInterface {
        ctx.interfaceMethodDeclaration().forEach(method => method.accept(this));
        return this.state;        
    }

    public visitInterfaceMethodDeclaration(ctx: InterfaceMethodDeclarationContext) {
        const memberContext = ctx;
        if (memberContext) {
            const visitor = new MethodDeclarationVisitor();
            const method = visitor.visit(memberContext);
            if (method) {
                method.sourceRange = ApexSourceRange.fromToken(memberContext);
                this.addRef(method.returnType);
                this.addRef(method.refs);
                this.state.methods.push(method);
            }
        }
        return this.state;
    }
}
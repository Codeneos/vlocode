import { ApexClass } from "../types";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { FieldDeclarationVisitor } from "./fieldDeclarationVisitor";
import { ClassBodyDeclarationContext, ClassDeclarationContext, FieldDeclarationContext, MethodDeclarationContext, ModifierContext } from "../grammar";

export class ClassDeclarationVisitor extends DeclarationVisitor<ApexClass> {
    constructor(state?: ApexClass) {
        super(state ?? {
            name: '',
            methods: [],
            properties: [],
            fields: [],
            implements: [],
            extends: undefined
        });
    }

    public visitModifier(ctx: ModifierContext) {
        this.visitAccessModifier(ctx) || this.visitSharingModifier(ctx);
        return this.state;
    }

    private visitSharingModifier(ctx: ModifierContext): boolean {
        if (ctx.WITH()) {
            this.state.sharing = 'with';
        } else if (ctx.WITHOUT()) {
            this.state.sharing = 'without';
        } else if (ctx.INHERITED()) {
            this.state.sharing = 'inherited';
        } else if (!ctx.SHARING()) {
            return false;
        }
        return true;
    }

    public visitClassDeclaration(ctx: ClassDeclarationContext): ApexClass {
        this.state.name = ctx.id().getText();
        if (ctx.EXTENDS()) {
            this.state.extends = ctx.typeRef()?.accept(new TypeRefVisitor()) ?? undefined;
        }
        if (ctx.IMPLEMENTS()) {
            this.state.implements = ctx.typeList()?.typeRef().map(typeRef => new TypeRefVisitor().visit(typeRef)!) ?? [];
        }
        ctx.classBody().accept(this);
        return this.state;
    }

    public visitClassBodyDeclaration(ctx: ClassBodyDeclarationContext) {
        const memberDeclaration = ctx.memberDeclaration();
        if (memberDeclaration) {
            memberDeclaration.accept(this);
        }
        return this.state;
    }

    public visitMethodDeclaration(ctx: MethodDeclarationContext) {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            this.state.methods.push(new MethodDeclarationVisitor().visit(memberContext)!);
        }
        return this.state;
    }

    // public visitPropertyDeclaration(ctx: PropertyDeclarationContext) {
    //     const memberContext = ctx.parent?.parent;
    //     if (memberContext) {
    //         this.state.methods.push(memberContext.accept(new MethodDeclarationVisitor()));
    //     }
    // }

    public visitFieldDeclaration(ctx: FieldDeclarationContext) {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            this.state.fields.push(new FieldDeclarationVisitor().visit(memberContext)!);
        }
        return this.state;
    }
}
import { ApexClass } from "../types";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { FieldDeclarationVisitor } from "./fieldDeclarationVisitor";
import { AnnotationContext, ClassBodyDeclarationContext, ClassDeclarationContext, FieldDeclarationContext, MemberDeclarationContext, MethodDeclarationContext, ModifierContext, TypeDeclarationContext } from "../grammar";

export class ClassDeclarationVisitor extends DeclarationVisitor<ApexClass> {
    constructor(state?: ApexClass) {
        super(state ?? {
            name: '',
            methods: [],
            properties: [],
            fields: [],
            implements: [],
            extends: undefined,
            nested: [],
        });
    }

    public visitAnnotation(ctx: AnnotationContext | null): ApexClass | null {
        if (ctx?.qualifiedName().getText().toLocaleLowerCase() === 'istest') {
            this.state.isTest = true;
        }
        return this.state;
    }

    public visitModifier(ctx: ModifierContext) {
        if (ctx.ABSTRACT()) {
            this.state.isAbstract = true;
        }
        if (ctx.VIRTUAL()) {
            this.state.isVirtual = true;
        }
        this.visitAnnotation(ctx.annotation());
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

    public visitMemberDeclaration(ctx: MemberDeclarationContext) {
        const classDeclaration = ctx.classDeclaration();
        if (classDeclaration) {
            this.state.nested.push(new ClassDeclarationVisitor().visit(classDeclaration)!);
            return this.state;
        }
        return this.visitChildren(ctx);
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
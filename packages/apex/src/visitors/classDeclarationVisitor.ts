import { ApexClass, ApexSourceRange, ApexTypeRef } from "../types";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { FieldDeclarationVisitor } from "./fieldDeclarationVisitor";
import { AnnotationContext, ClassBodyDeclarationContext, ClassDeclarationContext, FieldDeclarationContext, MemberDeclarationContext, MethodDeclarationContext, ModifierContext, PropertyDeclarationContext, TypeDeclarationContext } from "../grammar";
import { stringEquals } from "@vlocode/util";
import { PropertyDeclarationVisitor } from "./propertyDeclarationVisitor";

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
            refs: [],
            sourceRange: ApexSourceRange.empty,
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
            // Parse `extends XXX`
            const extendedType = ctx.typeRef()?.accept(new TypeRefVisitor());
            if (extendedType) {
                this.state.extends = extendedType;
                this.addRef(extendedType);
            }
        }

        if (ctx.IMPLEMENTS()) {
            // Parse `implements XXX, YYY`
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
            const nestedClass = new ClassDeclarationVisitor().visit(classDeclaration);
            if (nestedClass) {
                nestedClass.sourceRange = ApexSourceRange.fromToken(classDeclaration);
                this.addRef(nestedClass.refs);
                this.state.nested.push(nestedClass);
            }
            return this.state;
        }
        return this.visitChildren(ctx);
    }

    public visitPropertyDeclaration(ctx: PropertyDeclarationContext): ApexClass | null {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            const property = new PropertyDeclarationVisitor().visit(memberContext);
            if (property) {
                property.sourceRange = ApexSourceRange.fromToken(memberContext);
                this.addRef(property.type);
                this.addRef(property.getter?.refs);
                this.addRef(property.setter?.refs);
                this.state.properties.push(property);
            }
        }
        return this.state;
    }

    public visitMethodDeclaration(ctx: MethodDeclarationContext) {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            const method = new MethodDeclarationVisitor().visit(memberContext);
            if (method) {
                method.sourceRange = ApexSourceRange.fromToken(memberContext);
                this.addRef(method.returnType);
                this.addRef(method.refs);
                this.state.methods.push(method);
            }
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
            const field = new FieldDeclarationVisitor().visit(memberContext);
            if (field) {
                this.addRef(field.type);
                this.state.fields.push(field);
            }
        }
        return this.state;
    }
}
import { ApexClass, ApexSourceRange } from "../types";
import { MethodDeclarationVisitor } from "./methodDeclarationVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";
import { DeclarationVisitor } from "./declarationVisitor";
import { FieldDeclarationVisitor } from "./fieldDeclarationVisitor";
import { AnnotationContext, ClassBodyContext, ClassBodyDeclarationContext, ClassDeclarationContext, FieldDeclarationContext, MemberDeclarationContext, MethodDeclarationContext, ModifierContext, PropertyDeclarationContext } from "../grammar";
import { PropertyDeclarationVisitor } from "./propertyDeclarationVisitor";
import { BlockVisitor } from "./blockVisitor";

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

    public visitAnnotation(ctx: AnnotationContext | null): ApexClass {
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
        this.state.name = ctx.id()?.getText();

        if (ctx.EXTENDS()) {
            // Parse `extends XXX`
            const extendedType = ctx.typeRef()?.accept(new TypeRefVisitor());
            if (extendedType) {
                this.state.extends = extendedType;
                this.addRef(extendedType, 'extends');
            }
        }

        if (ctx.IMPLEMENTS()) {
            // Parse `implements XXX, YYY`
            this.state.implements = ctx.typeList()?.typeRef().map(typeRef => new TypeRefVisitor().visit(typeRef)!) ?? [];
            this.addRef(this.state.implements, 'implements');
        }

        ctx.classBody()?.accept(this);
        ctx.modifier()?.forEach(modifier => modifier.accept(this));
        return this.state;
    }

    public visitClassBody(ctx: ClassBodyContext): ApexClass {
        // Parse all the fields and properties first so that we know which are locals
        new FieldAndPropertyDeclarationVisitor(this.state).visitChildren(ctx);
        // Now visit all members using this visitor
        this.visitChildren(ctx);
        // Update references for all methods and properties
        this.updateReferences();
        return this.state;
    }

    public visitClassBodyDeclaration(ctx: ClassBodyDeclarationContext) {
        ctx.memberDeclaration()?.accept(this);
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

    public visitMethodDeclaration(ctx: MethodDeclarationContext) {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            const visitor = new MethodDeclarationVisitor();
            const method = visitor.visit(memberContext);
            if (method) {
                // Remove references to local variables and properties
                visitor.updateReferences(this.state);
                method.sourceRange = ApexSourceRange.fromToken(memberContext);
                this.addRef(method.returnType);
                this.addRef(method.refs);
                this.state.methods.push(method);
            }
        }
        return this.state;
    }

    public updateReferences() {
        for (const property of this.state.properties) {
            if (property.getter) {
                new BlockVisitor(property.getter).updateReferences(this.state);
                this.addRef(property.getter?.refs);
            }
            if (property.setter) {
                new BlockVisitor(property.setter).updateReferences(this.state);
                this.addRef(property.setter?.refs);
            }
        }
    }
}

class FieldAndPropertyDeclarationVisitor extends DeclarationVisitor<ApexClass> {
    constructor(state: ApexClass) {
        super(state);
    }

    public visitPropertyDeclaration(ctx: PropertyDeclarationContext): ApexClass {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            const property = new PropertyDeclarationVisitor().visit(memberContext);
            if (property) {
                property.sourceRange = ApexSourceRange.fromToken(memberContext);
                this.addRef(property.type, 'property');
                this.state.properties.push(property);
            }
        }
        return this.state;
    }

    public visitFieldDeclaration(ctx: FieldDeclarationContext) {
        const memberContext = ctx.parent?.parent;
        if (memberContext) {
            const field = new FieldDeclarationVisitor().visit(memberContext);
            if (field) {
                this.addRef(field.type, 'field');
                this.state.fields.push(field);
            }
        }
        return this.state;
    }
}
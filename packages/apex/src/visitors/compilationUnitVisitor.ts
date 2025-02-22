import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { ClassDeclarationVisitor } from "./classDeclarationVisitor";
import { ApexClass, ApexCompilationUnit, ApexInterface, ApexSourceRange } from "../types";
import { TypeDeclarationContext } from "../grammar";
import { InterfaceDeclarationVisitor } from "./interfaceDeclarationVisitor";

export class CompilationUnitVisitor extends ApexSyntaxTreeVisitor<ApexCompilationUnit> {
    constructor(state?: ApexCompilationUnit) {
        super(state ?? { classes: [], interfaces: [] });
    }

    public visitTypeDeclaration(ctx: TypeDeclarationContext) {
        if (ctx.classDeclaration()) {
            const classInfo = new ClassDeclarationVisitor().visit(ctx);
            if (classInfo) {
                classInfo.sourceRange = ApexSourceRange.fromToken(ctx);
                this.addClass(classInfo);
            }
        } else if (ctx.interfaceDeclaration()) {
            const interfaceInfo = new InterfaceDeclarationVisitor().visit(ctx);
            if (interfaceInfo) {
                interfaceInfo.sourceRange = ApexSourceRange.fromToken(ctx);
                this.addInterface(interfaceInfo);
            }
        }
        return this.state;
    }

    private addClass(classInfo: ApexClass) {
        this.state.classes.push(classInfo);

        // add nested classes to the top level
        if (classInfo.nested.length) {
            this.state.classes.push(
                ...classInfo.nested.map(nested => ({
                    ...nested,
                    name: `${classInfo.name}.${nested.name}`
                }))
            );
        }
    }

    private addInterface(interfaceInfo: ApexInterface) {
        this.state.interfaces.push(interfaceInfo);
    }
}

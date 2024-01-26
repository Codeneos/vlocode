import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { ClassDeclarationVisitor } from "./classDeclarationVisitor";
import { ApexClass, ApexCompilationUnit, ApexSourceRange } from "../types";
import { TypeDeclarationContext } from "../grammar";

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
}

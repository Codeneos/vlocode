import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { ClassDeclarationVisitor } from "./classDeclarationVisitor";
import { ApexCompilationUnit } from "../types";
import { TypeDeclarationContext } from "../grammar";

export class CompilationUnitVisitor extends ApexSyntaxTreeVisitor<ApexCompilationUnit> {
    constructor(state?: ApexCompilationUnit) {
        super(state ?? { classes: [], interfaces: [] });
    }

    public visitTypeDeclaration(ctx: TypeDeclarationContext) {
        if (ctx.classDeclaration()) {
            this.state.classes.push(new ClassDeclarationVisitor().visit(ctx)!);
        }
        return this.state;
    }
}

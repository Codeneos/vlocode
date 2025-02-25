import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { ClassDeclarationVisitor } from "./classDeclarationVisitor";
import { ApexClass, ApexCompilationUnit, ApexInterface, ApexSourceRange } from "../types";
import { ClassDeclarationContext, InterfaceDeclarationContext, TriggerDeclarationContext } from "../grammar";
import { InterfaceDeclarationVisitor } from "./interfaceDeclarationVisitor";
import { TriggerUnitVisitor } from "./triggerUnitVisitor";

export class CompilationUnitVisitor extends ApexSyntaxTreeVisitor<ApexCompilationUnit> {
    constructor(state?: ApexCompilationUnit) {
        super(state ?? { classes: [], interfaces: [], triggers: [] });
    }

    public visitClassDeclaration(ctx: ClassDeclarationContext): ApexCompilationUnit {
        const classInfo = new ClassDeclarationVisitor().visit(ctx);
        if (classInfo) {
            classInfo.sourceRange = ApexSourceRange.fromToken(ctx);
            this.addClass(classInfo);
        }
        return this.state;
    }

    public visitInterfaceDeclaration(ctx: InterfaceDeclarationContext): ApexCompilationUnit {
        const interfaceInfo = new InterfaceDeclarationVisitor().visit(ctx);
        if (interfaceInfo) {
            interfaceInfo.sourceRange = ApexSourceRange.fromToken(ctx);
            this.addInterface(interfaceInfo);
        }
        return this.state;
    }

    public visitTriggerDeclaration(ctx: TriggerDeclarationContext): ApexCompilationUnit {   
        const trigger = new TriggerUnitVisitor().visit(ctx);
        if (trigger) {
            trigger.sourceRange = ApexSourceRange.fromToken(ctx);
            this.state.triggers?.push(trigger);
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

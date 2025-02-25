import { ApexSourceRange, ApexTrigger, ApexTriggerEventOperation, ApexTriggerEventWhen } from "../types";
import { BlockContext, TriggerDeclarationContext, TriggerEventContext } from "../grammar";
import { BlockVisitor } from "./blockVisitor";

export class TriggerUnitVisitor extends BlockVisitor<ApexTrigger> {
    constructor(state?: ApexTrigger) {
        super(state ?? {
            name: '',
            sobject: '',
            triggerEvents: [],
            localVariables: [],
            refs: [],
            sourceRange: ApexSourceRange.empty,
        });
    }

    public visitBlock(ctx: BlockContext) {
        return new BlockVisitor(this.state).visitChildren(ctx);
    }

    public visitTriggerDeclaration(ctx: TriggerDeclarationContext): ApexTrigger {
        const  [ name, sobject ] = ctx.id();
        this.state.name = name.getText();
        this.state.sobject = sobject.getText();
        ctx.triggerEvent().forEach(triggerCase => triggerCase.accept(this));
        ctx.block().accept(this);
        return this.state;
    }

    public visitTriggerEvent(ctx: TriggerEventContext): ApexTrigger {
        const when = ctx._when?.text?.toLowerCase() as ApexTriggerEventWhen;
        const operation = ctx._operation?.text?.toLowerCase() as ApexTriggerEventOperation;

        this.state.triggerEvents.push({
            type: when === 'before' ? 'before' : 'after',
            operation: operation as 'insert' | 'update' | 'delete' | 'undelete'
        });

        return this.state;
    }
}
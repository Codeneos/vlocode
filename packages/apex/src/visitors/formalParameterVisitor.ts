import { FormalParameterContext, IdContext } from "../grammar";
import { ApexMethodParameter } from "../types";
import { ApexSyntaxTreeVisitor } from "./syntaxTreeVisitor";
import { TypeRefVisitor } from "./typeRefVisitor";

export class FormalParameterVisitor extends ApexSyntaxTreeVisitor<ApexMethodParameter> {
    constructor(state?: ApexMethodParameter) {
        super(state ?? {
            name: '',
            type: {
                name: '',
                isSystemType: false
            }
        });
    }

    public visitFormalParameter(ctx: FormalParameterContext): ApexMethodParameter {
        ctx.id().accept(this);
        ctx.typeRef().accept(new TypeRefVisitor(this.state.type));
        return this.state;
    }

    public visitId(ctx: IdContext) {
        this.state.name = ctx.getText();
        return this.state;
    }
}
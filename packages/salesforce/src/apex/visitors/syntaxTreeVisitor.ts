import { ParserRuleContext, RuleContext } from "antlr4ng";
import { ApexParserVisitor } from "../grammar";
import "../grammar";

export abstract class ApexSyntaxTreeVisitor<T> extends ApexParserVisitor<T> {
    constructor(protected state: T) {
        super();
    }

    public visitChildren(node: RuleContext): T {
        const result = super.visitChildren(node);
        if (Array.isArray(result)) {
            for (const childResult of result) {
                this.aggregateResult(this.state, childResult);
            }
        }
        return this.state;
    }

    /**
     * Aggregates the result of a child node into the state of the visitor. 
     * This method is called by `visitChildren` for each child node.
     * @param aggregate The current state of the visitor
     * @param nextResult The result of the child node
     * @returns The new state of the visitor
     */
    protected aggregateResult(aggregate: T, nextResult: T): T {
        return this.state;
    }

    /**
     * Get the first child of a node of a specific type
     * @param node Node to get the child from
     * @param type Type of the child to get
     * @returns The first child of the specified type or throws an error if no child of the specified type was found
     */
    public getFirstChildOfType<TNode extends RuleContext>(node: ParserRuleContext, type: new (...args: any[]) => TNode): TNode {
        for (const child of node.children ?? []) {
            if (child instanceof type) {
                return child;
            }
        }
        throw new Error(`Expected child node of type: ${type.name}`);
    }

    /**
     * Get all sibling nodes ao the same level as the specified node of a specific type. 
     * Checks the parent node of the specified node.
     * @param node Node to get the siblings from
     * @param type Type of the siblings to get
     * @returns All sibling nodes of the specified type or an empty array if no siblings of the specified type were found
     */
    public getSiblingsOfType<TNode extends RuleContext>(node: ParserRuleContext, type: new (...args: any[]) => TNode): TNode[] {
        const siblings: TNode[] = [];
        for (const child of node.parent?.children ?? []) {
            if (child instanceof type) {
                siblings.push(child);
            }
        }
        return siblings;
    }
}

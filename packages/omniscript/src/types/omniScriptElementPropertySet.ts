export interface RuleGroup {
    group: {
        rules: Array<{
            field: string;
            data: null | string;
            condition: string;
        } | RuleGroup>,
        operator: 'AND' | 'OR'
    }
}

export interface OmniScriptBaseElementPropertySet extends Record<string, any> {
    show?: RuleGroup;
    label?: string;
    HTMLTemplateId?: string;
    rpe?: boolean;
    bus?: boolean;
    controlWidth?: number;
}

export interface OmniScriptStepElementPropertySet extends OmniScriptBaseElementPropertySet {
    allowSaveForLater?: boolean;
    businessCategory?: string;
    businessEvent?: string;
    cancelLabel?: string;
    cancelMessage?: string | null;
    chartLabel?: string | null;
    completeLabel?: string | null;
    completeMessage?: string | null;
    conditionType?: 'Hide if False' | 'Show if True';
    errorMessage?: Record<string, any>;
    instruction?: string;
    instructionKey?: string | null;
    knowledgeOptions?: Record<string, any>;
    label: string;
    message?: Record<string, any>;
    nextLabel: string;
    nextWidth?: string | number;
    previousLabel: string;
    previousWidth?: number;
    pubsub?: boolean;
    remoteClass?: string;
    remoteMethod?: string;
    remoteOptions?: Record<string, any>;
    remoteTimeout?: number;
    saveLabel: string;
    saveMessage: string;
    showPersistentComponent?: Array<boolean>;
}


export interface OmniScriptValidationElementPropertySet extends OmniScriptBaseElementPropertySet {
    hideLabel: boolean;
    disOnTplt: boolean;
    messages?: Array<{
        active: boolean;
        text?: string;
        type: 'Error' | 'Warning' | 'Requirement';
        value: boolean;
    }>;
    validateExpression?: string;
}

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
}
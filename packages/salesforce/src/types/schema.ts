export interface SchemaField {
    readonly array: boolean;
    readonly nullable: boolean;
    readonly optional: boolean;
    readonly type: 'string' | 'number' | 'boolean' | Schema | undefined;
}

export interface Schema {
    readonly name: string;
    readonly extends?: Schema;
    readonly fields: Record<string, SchemaField>;
}
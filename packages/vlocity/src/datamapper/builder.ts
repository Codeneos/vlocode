import type { DataMapperDefinition, DataMapperItem, DataMapperType } from './types';

export interface DataMapperBuilderOptions {
    inputType?: string;
    outputType?: string;
    nullInputsIncludedInOutput?: boolean;
    items?: DataMapperItem[];
    properties?: Record<string, unknown>;
}

export interface DataMapperMapOptions {
    defaultValue?: unknown;
    disabled?: boolean;
    outputCreationSequence?: number;
    outputFieldFormat?: string;
    outputObjectName?: string;
    transformValueMappings?: unknown;
    fields?: Partial<DataMapperItem>;
}

export interface DataMapperFormulaOptions {
    disabled?: boolean;
    outputFieldName?: string;
    outputObjectName?: string;
    sequence?: number;
    fields?: Partial<DataMapperItem>;
}

export interface DataMapperExtractObjectOptions {
    disabled?: boolean;
    outputObjectName?: string;
    sequence?: number;
    fields?: Partial<DataMapperItem>;
}

export interface DataMapperExtractFilterOptions {
    disabled?: boolean;
    filterGroup?: number;
    fields?: Partial<DataMapperItem>;
}

export class DataMapperBuilder {
    private readonly definition: DataMapperDefinition;
    private readonly items: DataMapperItem[];
    private extractSequence = 0;
    private formulaSequence = 0;

    public static extract(options?: DataMapperBuilderOptions): DataMapperBuilder {
        return new DataMapperBuilder('Extract', options);
    }

    public static transform(options?: DataMapperBuilderOptions): DataMapperBuilder {
        return new DataMapperBuilder('Transform', options);
    }

    public constructor(type: DataMapperType, options: DataMapperBuilderOptions = {}) {
        this.items = options.items?.map(item => ({ ...item })) ?? [];
        this.definition = {
            Type: type,
            InputType: options.inputType ?? 'JSON',
            OutputType: options.outputType ?? 'JSON',
            IsNullInputsIncludedInOutput: options.nullInputsIncludedInOutput ?? false,
            ...options.properties,
            OmniDataTransformItem: this.items
        };
    }

    public inputType(inputType: string): this {
        this.definition.InputType = inputType;
        return this;
    }

    public outputType(outputType: string): this {
        this.definition.OutputType = outputType;
        return this;
    }

    public includeNullInputs(include = true): this {
        this.definition.IsNullInputsIncludedInOutput = include;
        return this;
    }

    public property(name: string, value: unknown): this {
        this.definition[name] = value;
        return this;
    }

    public item(item: DataMapperItem): this {
        this.items.push({ ...item });
        return this;
    }

    public extractObject(objectName: string, outputPath: string, options: DataMapperExtractObjectOptions = {}): DataMapperExtractObjectBuilder {
        const sequence = options.sequence ?? ++this.extractSequence;
        const extractObject = new DataMapperExtractObjectBuilder(this, objectName, outputPath, sequence, options.outputObjectName ?? 'json');
        extractObject.define(options);
        return extractObject;
    }

    public map(inputPath: string | undefined, outputPath: string, options: DataMapperMapOptions = {}): this {
        return this.item(definedItem({
            ...options.fields,
            DefaultValue: options.defaultValue,
            InputFieldName: inputPath,
            IsDisabled: options.disabled,
            OutputCreationSequence: options.outputCreationSequence,
            OutputFieldFormat: options.outputFieldFormat,
            OutputFieldName: outputPath,
            OutputObjectName: options.outputObjectName ?? 'json',
            TransformValueMappings: options.transformValueMappings
        }));
    }

    public list(outputPath: string, options: Omit<DataMapperMapOptions, 'outputFieldFormat'> = {}): this {
        return this.map(undefined, outputPath, {
            ...options,
            outputFieldFormat: 'List<Map>'
        });
    }

    public formula(expression: string, resultPath: string, options: DataMapperFormulaOptions = {}): this {
        return this.item(definedItem({
            ...options.fields,
            FormulaExpression: expression,
            FormulaResultPath: resultPath,
            FormulaSequence: options.sequence ?? ++this.formulaSequence,
            IsDisabled: options.disabled,
            OutputFieldName: options.outputFieldName ?? 'Formula',
            OutputObjectName: options.outputObjectName ?? 'Formula'
        }));
    }

    public build(): DataMapperDefinition {
        return {
            ...this.definition,
            OmniDataTransformItem: this.items.map(item => ({ ...item }))
        };
    }
}

export class DataMapperExtractObjectBuilder {
    public constructor(
        private readonly parent: DataMapperBuilder,
        private readonly objectName: string,
        private readonly outputPath: string,
        private readonly sequence: number,
        private readonly outputObjectName: string
    ) {
    }

    public define(options: DataMapperExtractObjectOptions = {}): this {
        return this.addItem({
            ...options.fields,
            IsDisabled: options.disabled
        });
    }

    public filter(fieldName: string, operator: string, value?: string, options: DataMapperExtractFilterOptions = {}): this {
        return this.addItem({
            ...options.fields,
            FilterGroup: options.filterGroup,
            FilterOperator: operator,
            FilterValue: value,
            InputFieldName: fieldName,
            IsDisabled: options.disabled
        });
    }

    public where(fieldName: string, operator: string, value?: string, options?: DataMapperExtractFilterOptions): this {
        return this.filter(fieldName, operator, value, options);
    }

    public orderBy(orderBy: string, options: DataMapperExtractFilterOptions = {}): this {
        return this.addItem({
            ...options.fields,
            FilterOperator: 'ORDER BY',
            FilterValue: orderBy,
            IsDisabled: options.disabled
        });
    }

    public limit(limit: number, options: DataMapperExtractFilterOptions = {}): this {
        return this.addItem({
            ...options.fields,
            FilterOperator: 'LIMIT',
            FilterValue: String(limit),
            IsDisabled: options.disabled
        });
    }

    public offset(offset: number, options: DataMapperExtractFilterOptions = {}): this {
        return this.addItem({
            ...options.fields,
            FilterOperator: 'OFFSET',
            FilterValue: String(offset),
            IsDisabled: options.disabled
        });
    }

    public map(inputFieldName: string, outputPath: string, options?: DataMapperMapOptions): this {
        this.parent.map(this.sourcePath(inputFieldName), outputPath, options);
        return this;
    }

    public list(outputPath: string, options?: Omit<DataMapperMapOptions, 'outputFieldFormat'>): this {
        this.parent.list(outputPath, options);
        return this;
    }

    public formula(expression: string, resultPath: string, options?: DataMapperFormulaOptions): this {
        this.parent.formula(expression, this.sourcePath(resultPath), options);
        return this;
    }

    public child(objectName: string, pathSegment: string, options: DataMapperExtractObjectOptions = {}): DataMapperExtractObjectBuilder {
        const path = pathSegment.includes(':') ? pathSegment : `${this.outputPath}:${pathSegment}`;
        return this.parent.extractObject(objectName, path, options);
    }

    public done(): DataMapperBuilder {
        return this.parent;
    }

    private addItem(fields: Partial<DataMapperItem>): this {
        this.parent.item(definedItem({
            ...fields,
            InputObjectName: this.objectName,
            InputObjectQuerySequence: this.sequence,
            OutputFieldName: this.outputPath,
            OutputObjectName: this.outputObjectName
        }));
        return this;
    }

    private sourcePath(path: string): string {
        return path.includes(':') ? path : `${this.outputPath}:${path}`;
    }
}

function definedItem(item: DataMapperItem): DataMapperItem {
    return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)) as DataMapperItem;
}

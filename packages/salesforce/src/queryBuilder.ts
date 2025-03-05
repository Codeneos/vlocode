import { container } from '@vlocode/core';
import { deepClone, flattenObject } from '@vlocode/util';
import { SalesforceConnectionProvider } from './connection';
import { QueryService } from './queryService';
import { QueryFormatter, QueryParser, SalesforceQueryData } from './queryParser';
import { SalesforceSchemaService } from './salesforceSchemaService';

class QueryBuilderData {
    constructor(protected readonly query: SalesforceQueryData) {
    }

    public getSpec(): SalesforceQueryData {
        return { ...this.query, fieldList: [...new Set(this.query.fieldList)] };
    }

    public getQuery() {
        return QueryFormatter.format(this.getSpec());
    }

    public get fields(): Iterable<string> {
        return new Set(this.query.fieldList);
    }

    public get sobjectType() {
        return this.query.sobjectType;
    }

    public execute<T = any>(executor?: SalesforceConnectionProvider | { query(q: string): Promise<T[]> }) : Promise<T[]> {
        if (!executor) {
            return this.execute(container.get(QueryService));
        }

        if (typeof executor['query'] === 'function') {
            return executor['query'](this.getQuery());
        }

        // @ts-ignore executor is JsForceConnectionProvider
        return new QueryService(executor).query(this.getQuery());
    }

    public async executeTooling<T = any>(executor?: SalesforceConnectionProvider | { queryTooling(q: string): Promise<T[]> }) : Promise<T[]> {
        if (!executor) {
            return this.execute(container.get(QueryService));
        }

        if (typeof executor['queryTooling'] === 'function') {
            return executor['queryTooling'](this.getQuery());
        }

        // @ts-ignore executor is JsForceConnectionProvider
        return new QueryService(executor).queryTooling(this.getQuery());
    }
}

type WhereOperatorType = '=' | '!=' | '>' | '<' | 'like' | 'in' | 'includes';

export interface QueryFilterCondition {
    [field: string]: any | { op: WhereOperatorType, value: any }
}

/**
 * Simple salesforce SOQL builder
 */
export class QueryBuilder extends QueryBuilderData {

    constructor(query: SalesforceQueryData);
    constructor(sobjectType: string, fieldList?: string[]);
    constructor(...args: any[]) {
        super(typeof args[0] === 'object' ? args[0] : { sobjectType: args[0], fieldList: args[1] ?? [ 'Id' ] });
    }

    /**
     * Validate queried fields and remove any unknown field from the query using the schema access provided
     * @param schema Schema access
     */
    public async validateFields(schema: SalesforceSchemaService): Promise<string[]> {
        const removedFields = new Array<string>();
        const resolvedFields = new Array<string>();
        for (const field of this.fields) {
            const fieldDef = await schema.describeSObjectFieldPath(this.sobjectType, field, false);
            if (fieldDef) {
                resolvedFields.push(field);
            } else {
                removedFields.push(field);
            }
        }
        this.query.fieldList = resolvedFields;
        return removedFields;
    }

    public clone() {
        return QueryBuilder.clone(this);
    }

    public static clone(query: QueryBuilder) {
        return new QueryBuilder(deepClone(query.query));
    }

    public static parse(query: string) {
        return new QueryBuilder(QueryParser.parse(query));
    }

    public get where(): QueryConditionBuilder {
        return new QueryConditionBuilder(this.query);
    }

    public filter(filter: QueryFilterCondition): this {
        new QueryConditionBuilder(this.query).fromObject(filter);
        return this;
    }

    public select(...fields: (string | { name: string })[]) {
        this.query.fieldList.push(...fields.map(f => typeof f === 'string' ? f : f.name));
        return this;
    }

    public isSelected(field: string) {
        return this.query.fieldList.includes(field);
    }

    public selectRelated(relationName: string, fields: (string | { name: string })[]) {
        return this.select(...fields.map(f => `${relationName}.${typeof f === 'string' ? f : f.name}`));
    }

    public sortBy(...sortFields: (string | { name: string })[]) : QueryBuilder {
        this.query.orderBy = sortFields.map(f => typeof f === 'string' ? f : f.name);
        return this;
    }

    public sortDirection(direction: 'asc' | 'desc') : QueryBuilder {
        this.query.orderByDirection = direction;
        return this;
    }

    public limit(limit: number, offset?: number) : QueryBuilder {
        this.query.limit = limit;
        if (offset) {
            this.query.offset = offset;
        }
        return this;
    }

    public offset(offset: number) : QueryBuilder {
        this.query.offset = offset;
        return this;
    }
}

export class QueryConditionBuilder extends QueryBuilderData {

    private nextConditionOp?: 'and' | 'or' = 'and';

    public get or() : this {
        this.nextConditionOp = 'or';
        return this;
    }

    public get and() : this {
        this.nextConditionOp = 'and';
        return this;
    }

    public fromObject(values: QueryFilterCondition) : QueryConditionBuilder {
        for (const [field, value] of Object.entries(flattenObject(values, obj => typeof obj?.operator !== 'string'))) {
            const operator = value?.op ?? (Array.isArray(value) ? 'in' : '=');
            const cmpValue = value?.op ? value.value : value;
            this.and.condition(`${field} ${operator} ${Array.isArray(cmpValue) ? `(${cmpValue.map(v => this.formatValue(v)).join(',')})` : this.formatValue(cmpValue)}`);
        }
        return this;
    }

    public condition(condition: string) : this {
        if (!this.query.whereCondition) {
            this.query.whereCondition = condition;
        } else {
            if (!this.nextConditionOp) {
                throw new Error(`No condition operator set; use 'or' or 'and' to join the next part of a where condition`);
            }
            this.query.whereCondition = {
                left: this.query.whereCondition,
                operator: this.nextConditionOp,
                right: condition
            }
            this.nextConditionOp = undefined;
        }
        return this;
    }

    public equals(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} = ${this.formatValue(value)}`);
    }

    public notEquals(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} != ${this.formatValue(value)}`);
    }

    public greaterThan(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} > ${this.formatValue(value)}`);
    }

    public greaterThanOrEquals(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} >= ${this.formatValue(value)}`);
    }

    public lesserThan(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} < ${this.formatValue(value)}`);
    }

    public lesserThanOrEquals(field: (string | { name: string }), value: any) : this {
        return this.condition(`${field} <= ${this.formatValue(value)}`);
    }

    public in(field: (string | { name: string }), values: any[]) : this {
        return this.condition(`${field} in (${values.map(v => this.formatValue(v)).join(',')})`);
    }

    public notIn(field: (string | { name: string }), values: any[]) : this {
        return this.condition(`${field} not in (${values.map(v => this.formatValue(v)).join(',')})`);
    }

    private formatValue(value: any) {
        if (value === null || value === undefined) {
            return null;
        }
        else if (typeof value === 'number' || typeof value === 'boolean') {
            return `${value}`;
        }
        return `'${value}'`;
    }

    public getCondition() {
        return this.query.whereCondition;
    }
}
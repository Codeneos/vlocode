import { container, LogManager } from '@vlocode/core';
import { lazy } from '@vlocode/util';
import { QueryFormatter, QueryParser, SalesforceQueryData } from './queryParser';
import { SalesforceSchemaService } from './salesforceSchemaService';

class QueryBuilderData {
    constructor(protected readonly query: SalesforceQueryData) {
    }

    public getQuery(): SalesforceQueryData {
        return { ...this.query, fieldList: [...new Set(this.query.fieldList)] };
    }

    public toString() {
        return QueryFormatter.format(this.getQuery());
    }

    public get fields(): Iterable<string> {
        return new Set(this.query.fieldList);
    }

    public get sobjectType() {
        return this.query.sobjectType;
    }
}

/**
 * Simple salesforce SOQL builder
 */
export class QueryBuilder extends QueryBuilderData {

    private schema = lazy(() => container.get(SalesforceSchemaService));
    private logger = lazy(() => LogManager.get(QueryBuilder));

    constructor(query: SalesforceQueryData);
    constructor(sobjectType: string, fieldList?: string[]);
    constructor(...args: any[]) {
        super(typeof args[0] === 'object' ? args[0] : { sobjectType: args[0], fieldList: args[1] ?? [ 'Id' ] });
    }

    public static parse(query: string) {
        return new QueryBuilder(QueryParser.parse(query));
    }
    
    public get where() : QueryConditionBuilder {
        return new QueryConditionBuilder(this.query);
    }

    public select(...fields: (string | { name: string })[]) {
        this.query.fieldList.push(...fields.map(f => typeof f === 'string' ? f : f.name));
        return this;
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
        this.query.offset = offset ?? this.query.offset;
        return this;
    }
}

export class QueryConditionBuilder extends QueryBuilderData {

    private nextConditionOp?: 'and' | 'or';

    public get or() : this {
        this.nextConditionOp = 'or';
        return this;
    }

    public get and() : this {
        this.nextConditionOp = 'and';
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
        return this.condition(`${field} in (${values.map(v => this.formatValue(v)).join(',')}`);
    }

    public notIn(field: (string | { name: string }), values: any[]) : this {
        return this.condition(`${field} not in (${values.map(v => this.formatValue(v)).join(',')}`);
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
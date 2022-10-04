import { container, LogManager } from '@vlocode/core';
import { clone, flattenObject, lazy } from '@vlocode/util';
import { Connection, JsForceConnectionProvider } from './connection';
import { QueryService } from './queryService';
import { QueryFormatter, QueryParser, SalesforceQueryData } from './queryParser';
import { SalesforceSchemaService } from './salesforceSchemaService';

type WhereOperatorType = '=' | '!=' | '>' | '<' | 'like' | 'in' | 'includes';

interface FilterCondition {
    [field: string]: any | { op: WhereOperatorType, value: any }
}

/**
 * Simple salesforce SOQL builder
 */
export class QueryBuilder  {

    protected readonly query: SalesforceQueryData

    constructor(query: SalesforceQueryData);
    constructor(sobjectType: string, fieldList?: string[]);
    constructor(...args: any[]) {
        this.query = typeof args[0] === 'object' ? args[0] : { sobjectType: args[0], fieldList: args[1] ?? [ 'Id' ] };
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

    public clone() {
        return QueryBuilder.clone(this);
    }

    public static clone(query: QueryBuilder) {
        return new QueryBuilder(clone(query.query));
    }

    public static parse(query: string) {
        return new QueryBuilder(QueryParser.parse(query));
    }
    
    public get where(): QueryConditionBuilder {
        return new QueryConditionBuilder(this.query);
    }

    public filter(filter: FilterCondition): this {
        new QueryConditionBuilder(this.query).fromObject(filter);
        return this;
    }

    public select(...fields: (string | { name: string })[]) {
        this.query.fieldList.push(...fields.map(f => typeof f === 'string' ? f : f.name));
        return this;
    }

    public selectRelated(relationName: string, fields: (string | { name: string })[]) {
        return this.select(...fields.map(f => `${relationName}.${typeof f === 'string' ? f : f.name}`));
    }

    public sortBy(...sortFields: (string | { name: string })[]) : this {
        this.query.orderBy = sortFields.map(f => typeof f === 'string' ? f : f.name);
        return this;
    }

    public sortDirection(direction: 'asc' | 'desc') : this {
        this.query.orderByDirection = direction;
        return this;
    }

    public limit(limit: number, offset?: number) : this {
        this.query.limit = limit;
        if (offset) {
            this.query.offset = offset;
        }
        return this;
    }

    public offset(offset: number) : this {
        this.query.offset = offset;
        return this;
    }    

    public execute<T = any>(executor?: JsForceConnectionProvider | { query(q: string): Promise<T[]> }) : Promise<T[]> {
        if (!executor) {
            return this.execute(container.get(QueryService));
        }

        if (typeof executor['query'] === 'function') {
            return executor['query'](this.getQuery());
        } 
        
        // @ts-ignore executor is JsForceConnectionProvider
        return new QueryService(executor).query(this.getQuery());
    }

    public async executeTooling<T = any>(executor?: JsForceConnectionProvider | Connection, options?: { chunkSize?: number }) : Promise<T[]> {
        if (!executor) {
            return this.executeTooling(container.get(JsForceConnectionProvider));
        }

        const connection = executor instanceof Connection ? executor : await executor.getJsForceConnection();
        const results = new Array<T>();
        const chunkSize = options?.chunkSize ?? 2000;

        for (let chunkNr = 0; true; chunkNr++) {
            const chunkedQuery = new QueryBuilder(clone(this.query)).limit(chunkSize, chunkNr * chunkSize);  
            const result = await connection.tooling.query<T>(chunkedQuery.getQuery());

            results.push(...result.records);

            if (result.records.length < chunkSize) {
                break;
            }
        }

        return results;
    }
}

class ChainableConditionQueryBuilder extends QueryBuilder {
    constructor(query: SalesforceQueryData){
        super(query);
    }

    public get or() {
        return new QueryConditionBuilder(this.query, 'or');
    }

    public get and() {
        return new QueryConditionBuilder(this.query, 'and');
    }
}

export class QueryConditionBuilder {

    public constructor(private readonly query: SalesforceQueryData, private nextConditionOp: 'and' | 'or' = 'and') {
    }

    public fromObject(values: FilterCondition) : QueryConditionBuilder {
        for (const [field, value] of Object.entries(flattenObject(values, obj => typeof obj?.operator !== 'string'))) {
            const operator = value?.op ?? (Array.isArray(value) ? 'in' : '=');
            const cmpValue = value?.op ? value.value : value;
            this.condition(`${field} ${operator} ${Array.isArray(cmpValue) ? `(${cmpValue.map(v => this.formatValue(v)).join(',')})` : this.formatValue(cmpValue)}`);
        }
        return this;
    }

    public condition(condition: string): { readonly or: QueryConditionBuilder, readonly and: QueryConditionBuilder } & QueryBuilder {
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
        }
        return new ChainableConditionQueryBuilder(this.query);
    }

    public equals(field: (string | { name: string }), value: any) {
        return this.condition(`${field} = ${this.formatValue(value)}`);
    }

    public notEquals(field: (string | { name: string }), value: any)  {
        return this.condition(`${field} != ${this.formatValue(value)}`);
    }

    public greaterThan(field: (string | { name: string }), value: any) {
        return this.condition(`${field} > ${this.formatValue(value)}`);
    }

    public greaterThanOrEquals(field: (string | { name: string }), value: any) {
        return this.condition(`${field} >= ${this.formatValue(value)}`);
    }

    public lesserThan(field: (string | { name: string }), value: any) {
        return this.condition(`${field} < ${this.formatValue(value)}`);
    }

    public lesserThanOrEquals(field: (string | { name: string }), value: any) {
        return this.condition(`${field} <= ${this.formatValue(value)}`);
    }

    public in(field: (string | { name: string }), values: any[]) {
        return this.condition(`${field} in (${values.map(v => this.formatValue(v)).join(',')})`);
    }

    public notIn(field: (string | { name: string }), values: any[]) {
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
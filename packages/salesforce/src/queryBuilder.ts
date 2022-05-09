import { LogManager } from '@vlocode/core';

export interface QueryCondition {
    readonly field: string;
    readonly comparisonOperator: string;
    readonly value: string;
}

export interface SortCondition {
    readonly field: string;
    readonly order: SortOrder;
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

/**
 * Simple salesforce SOQL builder
 */
export class QueryBuilder {

    private readonly fields: string[] = [];
    private readonly conditions: QueryCondition[] = [];
    private readonly sorting: SortCondition[] = [];
    private readonly limit: number;

    constructor(
        private readonly objectType: string,
        private readonly logger = LogManager.get(QueryBuilder)) {
    }

    public select(...fields: (string | { name: string })[]) {
        this.fields.push(...fields.map(f => typeof f === 'string' ? f : f.name));
        return this;
    }

    public sortBy(...sortFields: [string | { name: string }, SortOrder?][] | (string | { name: string })[]) : QueryBuilder {
        sortFields.forEach(sortField => {
            if(Array.isArray(sortField)) {
                this.sorting.push({
                    field: sortField[0].name ?? sortField[0],
                    order: sortField[1] || SortOrder.ASC
                });
            } else {
                this.sorting.push({
                    field: sortField.name ?? sortField,
                    order: SortOrder.ASC
                });
            }
        });
        return this;
    }

    public whereEq(field: (string | { name: string }), value: any) : QueryBuilder {
        return this.where([field, '=', value]);
    }

    public whereNotEq(field: (string | { name: string }), value: any) : QueryBuilder {
        return this.where([field, '!=', value]);
    }

    public where(...conditions: [string | { name: string }, string, any][]) : QueryBuilder {
        conditions.forEach(condition => {
            this.conditions.push({
                field: typeof condition[0] === 'string' ? condition[0] : condition[0].name,
                comparisonOperator: condition[1],
                value: condition[2]
            });
        });
        return this;
    }

    public getQueryString() : string {
        let query = `select ${this.fields.join(',')} `
                  + `from ${this.objectType}`;
        if (this.conditions.length > 0) {
            query += ` where ${this.conditions.map(c => this.formatCondition(c)).join(' and ')}`;
        }
        if (this.sorting.length > 0) {
            query += ` order by ${this.sorting.map(s => this.formatSortCondition(s)).join(',')}`;
        }
        if (this.limit) {
            query += ` limit ${this.limit}`;
        }
        this.logger.verbose(`Build query: ${query}`);
        return query;
    }

    private formatSortCondition(s: SortCondition) {
        return `${s.field} ${s.order}}`;
    }

    private formatCondition(c: QueryCondition) {
        return `${c.field} ${c.comparisonOperator} ${this.formatValue(c.value)}`;
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
}
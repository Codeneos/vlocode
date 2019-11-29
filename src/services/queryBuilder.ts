import { LogManager, Logger } from 'logging';
import * as constants from '@constants';

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
export default class QueryBuilder {  

    private fields: string[] = [];
    private conditions: QueryCondition[] = [];
    private sorting: SortCondition[] = [];
    private limit: number;

    constructor(
        private readonly objectType: string,
        private readonly vlocityNamespace: string = 'vlocity_namespace') {
    }

    private get logger() {
        return LogManager.get(QueryBuilder);
    }

    public select(...fields: string[]) {
        this.fields.push(...fields);
        return this;
    }

    public sortBy(...sortFields: [string, SortOrder?][] | string[]) : QueryBuilder {
        sortFields.forEach(sortField => {
            if(Array.isArray(sortField)) {
                this.sorting.push({ 
                    field: sortField[0], 
                    order: sortField[1] || SortOrder.ASC
                });
            } else {
                this.sorting.push({ 
                    field: sortField, 
                    order: SortOrder.ASC
                });
            }            
        });
        return this;
    }

    public whereEq(field: string, value: any) : QueryBuilder {
        return this.where([field, '=', value]);
    }

    public whereNotEq(field: string, value: any) : QueryBuilder {
        return this.where([field, '!=', value]);
    }    

    public where(...conditions: [string, string, any][]) : QueryBuilder {
        conditions.forEach(condition => {
            this.conditions.push({ 
                field: condition[0], 
                comparisonOperator: condition[1], 
                value: condition[2] 
            });
        });
        return this;
    }

    public build() : string {
        let query = `select ${this.fields.join(',').replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace)} `
                  + `from ${this.objectType.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace)}`;
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
        return `${s.field.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace)} ${s.order}}`;
    }

    private formatCondition(c: QueryCondition) {
        return `${c.field.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace)} ${c.comparisonOperator} ${this.formatValue(c.value)}`;
    }

    private formatValue(value: any) {
        if (value === null || value === undefined) {
            return null;
        }
        return `'${value}'`;
    }
}
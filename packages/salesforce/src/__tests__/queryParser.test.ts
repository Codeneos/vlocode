import 'jest';

import { QueryFormatter, QueryParser } from '../queryParser';

describe('QueryParser2', () => {

    describe('#parseQueryCondition', () => {
        it('should parse single condition as string', async () => {
            expect(QueryParser.parseQueryCondition(`Id = '12345'`)).toStrictEqual(`Id = '12345'`);
        });
        it('should parse multiple conditions as binary', async () => {
            expect(QueryParser.parseQueryCondition(`Id = '12345' and Name = '12345'`)).toStrictEqual({
                left: `Id = '12345'`,
                operator: 'and',
                right: `Name = '12345'`
            });
        });
        it('should parse conditions with keywords', async () => {
            expect(QueryParser.parseQueryCondition(`select_where_or = '12345' and and_form = '12345'`)).toStrictEqual({
                left: `select_where_or = '12345'`,
                operator: 'and',
                right: `and_form = '12345'`
            });
        });
        it('should parse multiple conditions as nested binary', async () => {
            expect(QueryParser.parseQueryCondition(`Id = '12345' and Name = '12345' and LastModifiedBy = '12345'`)).toStrictEqual({
                left: `Id = '12345'`,
                operator: 'and',
                right: {
                    left: `Name = '12345'`,
                    operator: 'and',
                    right: `LastModifiedBy = '12345'`
                }
            });
        });
        it('should parse nested conditions as binary', async () => {
            expect(QueryParser.parseQueryCondition(`( Id = '1' or Id = '2' )  and   (Name = 'a' or  Name = 'b'  )`)).toStrictEqual({
                left: {
                    left: `Id = '1'`,
                    operator: 'or',
                    right: `Id = '2'`
                },
                operator: 'and',
                right: {
                    left: `Name = 'a'`,
                    operator: 'or',
                    right: `Name = 'b'`
                }
            });
        });
        it('should not parse beyond reserved keyword', async () => {
            expect(QueryParser.parseQueryCondition(`(Id = '1' or Id = '2') and Name = 'a' limit 10`)).toStrictEqual({
                left: {
                    left: `Id = '1'`,
                    operator: 'or',
                    right: `Id = '2'`
                },
                operator: 'and',
                right: `Name = 'a'`
            });
        });
        it('should parse deeply nested conditions', async () => {
            expect(QueryParser.parseQueryCondition(`Id = '2' and  (Name = 'a' or Name = 'b' and (Id = '3' or (Name = 'a' or Name = 'b')))`)).toStrictEqual({
                left: `Id = '2'`,
                operator: 'and',
                right: {
                    left: `Name = 'a'`,
                    operator: 'or',
                    right: {
                        left: `Name = 'b'`,
                        operator: 'and',
                        right: {
                            left: `Id = '3'`,
                            operator: 'or',
                            right: {
                                left: `Name = 'a'`,
                                operator: 'or',
                                right: `Name = 'b'`
                            }
                        }
                    }
                }
            });
        });
        it('should parse wrapped conditions', async () => {
            expect(QueryParser.parseQueryCondition(`Id = '2' and (Name = 'a' or Name = 'b') and Id = '4'`)).toStrictEqual({
                left: `Id = '2'`,
                operator: 'and',
                right: {
                    left: {
                        left: `Name = 'a'`,
                        operator: 'or',
                        right: `Name = 'b'`
                    },
                    operator: 'and',
                    right: `Id = '4'`
                }
            });
        });
    });
    describe('#parseFieldsList', () => {
        it('should parse well formated field list', async () => {
            expect(QueryParser.parseFieldsList(`Id, Name, CustomField__c, CustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse densly formated field list', async () => {
            expect(QueryParser.parseFieldsList(`Id,Name,CustomField__c,CustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse field list with line breaks', async () => {
            expect(QueryParser.parseFieldsList(`Id,\nName,\nCustomField__c,\nCustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse field list with keywords in field names', async () => {
            expect(QueryParser.parseFieldsList(`from_select_where, and_or_test`))
                .toStrictEqual([ 'from_select_where', 'and_or_test' ]);
        });
        it('should parse field list with single field', async () => {
            expect(QueryParser.parseFieldsList(`from_select_where`))
                .toStrictEqual([ 'from_select_where' ]);
        });
        it('should break on field reserved keyword', async () => {
            expect(QueryParser.parseFieldsList(`Id, Name from Account`))
                .toStrictEqual([ 'Id', 'Name' ]);
        });
    });
    describe('#parse', () => {
        it('should parse simple query', async () => {
            const { sobjectType, fieldList } = QueryParser.parse(`select Id, Name from account`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
        });
        it('should parse query with condition', async () => {
            const { sobjectType, fieldList, whereCondition } = 
                QueryParser.parse(`select Id, Name from account where Name = 'Test'`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
        });
        it('should parse query with condition and limit', async () => {
            const { sobjectType, fieldList, whereCondition, limit } = 
                QueryParser.parse(`select Id, Name from account where Name = 'Test' limit 10`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
            expect(limit).toBe(10);
        });
        it('should parse query with condition and limit and offset', async () => {
            const { sobjectType, fieldList, whereCondition, limit, offset } = 
                QueryParser.parse(`select Id, Name from account where Name = 'Test' limit 10 offset 20`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
            expect(limit).toBe(10);
            expect(offset).toBe(20);
        });
        it('should parse query with sub-query', async () => {
            const { sobjectType, fieldList } = 
                QueryParser.parse(`select Id, Name, (select Id from Orders) from account`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name', '(select Id from Orders)' ]);
        });
    });
});

describe('QueryFormatter', () => {

    describe('#format', () => {
        it('should format simple query', async () => {
            expect(QueryFormatter.format({
                sobjectType: 'account',                
                fieldList: ['Id', 'Name']
            })).toBe(`select Id, Name from account`);
        });
    });
});
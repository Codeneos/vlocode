import 'jest';

import { QueryFormatter, QueryParser } from '../queryParser';

describe('QueryParser', () => {

    describe('#parseQueryCondition', () => {
        it('should parse single condition as string', () => {
            expect(QueryParser.parseQueryCondition(`Id = '12345'`)).toStrictEqual(`Id = '12345'`);
        });
        it('should parse multiple conditions as binary', () => {
            expect(QueryParser.parseQueryCondition(`Id = '12345' and Name = '12345'`)).toStrictEqual({
                left: `Id = '12345'`,
                operator: 'and',
                right: `Name = '12345'`
            });
        });
        it('should parse conditions with keywords', () => {
            expect(QueryParser.parseQueryCondition(`select_where_or = '12345' and and_form = '12345'`)).toStrictEqual({
                left: `select_where_or = '12345'`,
                operator: 'and',
                right: `and_form = '12345'`
            });
        });
        it('should parse multiple conditions as nested binary', () => {
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
        it('should parse nested conditions as binary', () => {
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
        it('should not parse beyond reserved keyword', () => {
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
        it('should parse deeply nested conditions', () => {
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
        it('should parse wrapped conditions', () => {
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
        it('should parse in condition with braces', () => {
            expect(QueryParser.parseQueryCondition(`isActive = true and (name in ('myname')) or (name not in ('other')) and (name includes ('test'))`)).toStrictEqual({
                left: `isActive = true`,
                operator: 'and',
                right: {
                    left: `name in ('myname')`,
                    operator: 'or',
                    right: {
                        left: `name not in ('other')`,
                        operator: 'and',
                        right: `name includes ('test')`
                    }
                }
            });
        });
        it('should parse not in condition with braces', () => {
            expect(QueryParser.parseQueryCondition(`isActive = true and (name in ('myname'))`)).toStrictEqual({
                left: `isActive = true`,
                operator: 'and',
                right: `name in ('myname')`
            });
        });
        it('should parse not like condition', () => {
            expect(QueryParser.parseQueryCondition(`Account.Status = 'Active' and (NOT Account.Name like 'A Name %')`)).toStrictEqual({
                left: `Account.Status = 'Active'`,
                operator: 'and',
                right: { operator: 'not', right: `Account.Name like 'A Name %'` }
            });
        });
        it('should parse double joined negations in condition', () => {
            expect(QueryParser.parseQueryCondition(`(not (id = 'id1')) and (not (id = 'id2'))`)).toStrictEqual({
                left: { operator: 'not', right: `id = 'id1'` },
                operator: 'and',
                right: { operator: 'not', right: `id = 'id2'` }
            });
        });
        it('should parse condition with joined negations', () => {
            expect(QueryParser.parseQueryCondition(`(not (id = 'id1' and id = 'id2'))`)).toStrictEqual({
                operator: 'not',
                right: {
                    left: `id = 'id1'`,
                    operator: 'and',
                    right: `id = 'id2'`
                }
            });
        });
        it('should parse keywords in condition operands', () => {
            expect(QueryParser.parseQueryCondition(`name = 'order by' or name = 'limit' or name = 'with security enforced'`)).toStrictEqual({
                left: `name = 'order by'`,
                operator: 'or',
                right: {
                    left: `name = 'limit'`,
                    operator: 'or',
                    right: `name = 'with security enforced'`
                }
            });
        });
        it('should not parse keywords after condition', () => {
            expect(QueryParser.parseQueryCondition(`name = 'order by' limit 10 offset 10`)).toStrictEqual(`name = 'order by'`);
        });
    });
    describe('#parseFieldsList', () => {
        it('should parse well formated field list', () => {
            expect(QueryParser.parseFieldsList(`Id, Name, CustomField__c, CustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse densly formated field list', () => {
            expect(QueryParser.parseFieldsList(`Id,Name,CustomField__c,CustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse field list with line breaks', () => {
            expect(QueryParser.parseFieldsList(`Id,\nName,\nCustomField__c,\nCustomField__r.Name`))
                .toStrictEqual([ 'Id', 'Name', 'CustomField__c', 'CustomField__r.Name' ]);
        });
        it('should parse field list with keywords in field names', () => {
            expect(QueryParser.parseFieldsList(`from_select_where, and_or_test`))
                .toStrictEqual([ 'from_select_where', 'and_or_test' ]);
        });
        it('should parse field list with single field', () => {
            expect(QueryParser.parseFieldsList(`from_select_where`))
                .toStrictEqual([ 'from_select_where' ]);
        });
        it('should break on field reserved keyword', () => {
            expect(QueryParser.parseFieldsList(`Id, Name from Account`))
                .toStrictEqual([ 'Id', 'Name' ]);
        });
    });
    describe('#parse', () => {
        it('should parse simple query', () => {
            const { sobjectType, fieldList } = QueryParser.parse(`select Id, Name from account`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
        });
        it('should parse query with condition', () => {
            const { sobjectType, fieldList, whereCondition } =
                QueryParser.parse(`select Id, Name from account where Name = 'Test'`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
        });
        it('should parse query with condition and limit', () => {
            const { sobjectType, fieldList, whereCondition, limit } =
                QueryParser.parse(`select Id, Name from account where Name = 'Test' limit 10`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
            expect(limit).toBe(10);
        });
        it('should parse query with condition and limit and offset', () => {
            const { sobjectType, fieldList, whereCondition, limit, offset } =
                QueryParser.parse(`select Id, Name from account where Name = 'Test' limit 10 offset 20`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name' ]);
            expect(whereCondition).toBe(`Name = 'Test'`);
            expect(limit).toBe(10);
            expect(offset).toBe(20);
        });
        it('should parse query with sub-query', () => {
            const { sobjectType, fieldList } =
                QueryParser.parse(`select Id, Name, (select Id from Orders) from account`);
            expect(sobjectType).toBe('account');
            expect(fieldList).toStrictEqual([ 'Id', 'Name', '(select Id from Orders)' ]);
        });
        it('should parse query with USER_MODE condition', () => {
            const query = QueryParser.parse(`select Id from account with user_mode`);
            expect(query.mode).toBe('user');
        });
        it('should parse query with SYSTEM_MODE condition', () => {
            const query = QueryParser.parse(`select Id from account with system_mode`);
            expect(query.mode).toBe('system');
        });
        it('should parse query with SECURITY_ENFORCED condition', () => {
            const query = QueryParser.parse(`select Id from account with security_enforced`);
            expect(query.securityEnforced).toStrictEqual(true);
        });
    });
});

describe('QueryFormatter', () => {
    describe('#format', () => {
        it('should format query without condition', () => {
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id', 'Name']
            })).toBe(`select Id, Name from account`);
        });
        it('should format condition with and', () => {
            const condition = {
                left: `id = 'id1'`,
                operator: 'and',
                right: `id = 'id2'`
            };
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from account where id = 'id1' and id = 'id2'`);
        });
        it('should format condition with or', () => {
            const condition = {
                left: `id = 'id1'`,
                operator: 'or',
                right: `id = 'id2'`
            };
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from account where id = 'id1' or id = 'id2'`);
        });
        it('should format condition with braces for and with or conditions', () => {
            const condition = {
                left: `id = 'id1'`,
                operator: 'or',
                right: {
                    left: `id = 'id2'`,
                    operator: 'and',
                    right: `id = 'id3'`
                }
            };
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from account where id = 'id1' or (id = 'id2' and id = 'id3')`);
        });
        it('should format condition with braces and or condition', () => {
            const condition = {
                left: `isActive = true`,
                operator: 'and',
                right: {
                    left: `name in ('myname')`,
                    operator: 'or',
                    right: {
                        left: `name not in ('other')`,
                        operator: 'and',
                        right: `name includes ('test')`
                    }
                }
            };
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from account where isActive = true and (name in ('myname') or (name not in ('other') and name includes ('test')))`);
        });
        it('should format condition with double joined negations', () => {
            const condition = {
                left: { operator: 'not', right: `id = 'id1'` },
                operator: 'and',
                right: { operator: 'not', right: `id = 'id2'` }
            };
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from account where (not (id = 'id1')) and (not (id = 'id2'))`);
        });
        it('should format not like condition', () => {
            const condition = {
                left: `Account.Status = 'Active'`,
                operator: 'and',
                right: { operator: 'not', right: `Account.Name like 'A Name %'` }
            };
            expect(QueryFormatter.format({
                sobjectType: 'Order',
                fieldList: ['Id'],
                whereCondition: condition
            })).toBe(`select Id from Order where Account.Status = 'Active' and (not (Account.Name like 'A Name %'))`);
        });
        it('should format query with user_mode condition', () => {
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id', 'Name'],
                mode: 'user'
            })).toBe(`select Id, Name from account with USER_MODE`);
        });
        it('should format query with record visibility condition', () => {
            expect(QueryFormatter.format({
                sobjectType: 'account',
                fieldList: ['Id', 'Name'],
                visibilityContext: 'maxDescriptorPerRecord=100, supportsDomains=true, supportsDelegates=true'
            })).toBe(`select Id, Name from account with RecordVisibilityContext (maxDescriptorPerRecord=100, supportsDomains=true, supportsDelegates=true)`);
        });
    });
});
import 'jest';

import { DataMapperBuilder, DataMapperExecutor, DataMapperFormulaEvaluator, type DataMapperDefinition } from '../datamapper';
import { getDataMapperPathValue } from '../datamapper/path';

describe('DataMapperFormulaEvaluator', () => {
    it('evaluates operators, percent paths and common DataMapper functions', async () => {
        const evaluator = new DataMapperFormulaEvaluator();
        const source = {
            items: [
                { Id: '1', Name: 'One' },
                { Id: '2', Name: 'Duplicate' }
            ]
        };
        const result = await evaluator.evaluate(
            `IF(ISBLANK(%missing%), LISTMERGE('Id', LIST(%items%), LIST(DESERIALIZE('[{"Id":"2","Name":"Two"}]'))), LIST())`,
            {
                source,
                resolvePath(path) {
                    return path === 'missing' ? undefined : source[path as keyof typeof source];
                }
            }
        );

        expect(result).toEqual([
            { Id: '1', Name: 'One' },
            { Id: '2', Name: 'Two' }
        ]);
        expect(await evaluator.evaluate('1 + 2 * 3 = 7 AND SUBSTRING("ABCDE", 2) = "CDE"', {
            source: {},
            resolvePath: () => undefined
        })).toBe(true);
    });

    it('uses Salesforce one-based pipe indexes in DataMapper paths and formulas', async () => {
        const evaluator = new DataMapperFormulaEvaluator();
        const source = {
            SplitedStreet: ['Main', 'Second', 'Third'],
            SBQQ__Quote__c: [{ Id: 'Q1' }],
            currentAccount: [{ Id: 'A1' }, { Id: 'A2' }]
        };
        const context = {
            source,
            resolvePath: (path: string) => getDataMapperPathValue(source, path)
        };

        expect(getDataMapperPathValue(source, 'SBQQ__Quote__c|1:Id')).toBe('Q1');
        expect(getDataMapperPathValue(source, 'SBQQ__Quote__c|2:Id')).toBeUndefined();
        await expect(evaluator.evaluate(
            'IF(LISTSIZE(SBQQ__Quote__c) == 1 && ISBLANK(SBQQ__Quote__c|1:Id), 0, LISTSIZE(currentAccount))',
            context
        )).resolves.toBe(2);
        await expect(evaluator.evaluate(
            'IF(Street1 != %SplitedStreet|3%, %SplitedStreet|3%, \'\')',
            context
        )).resolves.toBe('Third');
    });

    it('reports a missing function argument comma clearly', () => {
        const evaluator = new DataMapperFormulaEvaluator();

        expect(() => evaluator.parse(
            'IF(LISTSIZE(SBQQ__Quote__c) == 1 && ISBLANK(SBQQ__Quote__c|1:Id), 0 LISTSIZE(currentAccount))'
        )).toThrow('Expected comma or ) but found LISTSIZE');
    });

    it('reports the invalid DataMapper formula in execution plan errors', () => {
        const executor = new DataMapperExecutor();

        expect(() => executor.buildExecutionPlan({
            Type: 'Transform',
            OmniDataTransformItem: [formula('IF(true', 'result', 1)]
        })).toThrow('Invalid DataMapper formula "IF(true" for result path "result"');
    });

    it('can report invalid execution plan formulas as warnings', () => {
        const executor = new DataMapperExecutor();
        const warnings = new Array<unknown>();
        const plan = executor.buildExecutionPlan({
            Type: 'Transform',
            OmniDataTransformItem: [formula('IF(true', 'result', 1)]
        }, {
            onWarning: warning => warnings.push(warning)
        });

        expect(plan.formulas).toHaveLength(0);
        expect(warnings).toEqual([
            expect.objectContaining({
                code: 'invalidFormula',
                message: expect.stringContaining('Skipping invalid DataMapper formula "IF(true"')
            })
        ]);
    });

    it('evaluates documented string, list, JSON and date functions', async () => {
        const evaluator = new DataMapperFormulaEvaluator();
        const context = {
            source: {},
            now: new Date('2025-05-10T10:30:15.000Z'),
            resolvePath: () => undefined
        };

        await expect(evaluator.evaluate('SQRT(9) + 2 ^ 3', context)).resolves.toBe(11);
        await expect(evaluator.evaluate('"Alpha" LIKE "alp" AND "Beta" NOTLIKE "alp" AND "ABC" ~= "abc"', context)).resolves.toBe(true);
        await expect(evaluator.evaluate('BASE64ENCODE("abc")', context)).resolves.toBe('YWJj');
        await expect(evaluator.evaluate('STRINGINDEXOF("This is the test string.", "test")', context)).resolves.toBe(12);
        await expect(evaluator.evaluate('SUBSTRING("The string.", "string")', context)).resolves.toBe('string.');
        await expect(evaluator.evaluate('SUBSTRING("abcdef", 1, 4)', context)).resolves.toBe('bcd');
        await expect(evaluator.evaluate('JOIN("a", "b", "|")', context)).resolves.toBe('a|b');
        await expect(evaluator.evaluate('LISTSIZE(LIST("a", "b"))', context)).resolves.toBe(2);
        await expect(evaluator.evaluate('LISTSIZE(6, 7, 8, 9, 10)', context)).resolves.toBe(5);
        await expect(evaluator.evaluate('MAPTOLIST(DESERIALIZE(\'{"a":1,"b":2}\'))', context)).resolves.toEqual([1, 2]);
        await expect(evaluator.evaluate('FILTER(DESERIALIZE(\'[{"amount":5},{"amount":12}]\'), amount > 10)', context)).resolves.toEqual([{ amount: 12 }]);
        await expect(evaluator.evaluate('SORTBY(DESERIALIZE(\'[{"name":"b"},{"name":"a"}]\'), "name", :DSC)', context)).resolves.toEqual([{ name: 'b' }, { name: 'a' }]);
        await expect(evaluator.evaluate('RESERIALIZE(\'{"b":2}\')', context)).resolves.toBe('{"b":2}');
        await expect(evaluator.evaluate('VALUELOOKUP(DESERIALIZE(\'{"Name":{"First":"Ada"}}\'), "Name", "First")', context)).resolves.toBe('Ada');
        await expect(evaluator.evaluate('ADDYEAR("2024-01-01", 1)', context)).resolves.toBe('2025-01-01T00:00:00.000Z');
        await expect(evaluator.evaluate('AGEON("2000-05-10", "2025-05-09")', context)).resolves.toBe(24);
        await expect(evaluator.evaluate('DATEDIFF("02/01/2000", "2001-02-01")', context)).resolves.toBe(366);
        await expect(evaluator.evaluate('DATETIMETOUNIX("1970-01-01T00:00:01Z")', context)).resolves.toBe(1000);
        await expect(evaluator.evaluate('DATETIMETOUNIX("2002-02-01T16:35:30:000")', context)).resolves.toBe(1012581330000);
        await expect(evaluator.evaluate('HOUR("T08:00:59")', context)).resolves.toBe(8);
        await expect(evaluator.evaluate('SECOND("T08:00:59")', context)).resolves.toBe(59);
        await expect(evaluator.evaluate('TIMEDIFF("16:35:30", "08:00:15")', context)).resolves.toBe(30915000);
        await expect(evaluator.evaluate('UNIXTODATETIME(1)', context)).resolves.toBe('1970-01-01T00:00:01.000Z');
        await expect(evaluator.evaluate('FORMATDATETIME("2025-05-10T10:30:15Z", "yyyy-MM-dd HH:mm:ss", "UTC")', context)).resolves.toBe('2025-05-10 10:30:15');
    });

    it('invokes registered FUNCTION formulas with class and method names', async () => {
        const evaluator = new DataMapperFormulaEvaluator();
        await expect(evaluator.evaluate('FUNCTION("ExampleClass", "double", 21)', {
            source: {},
            resolvePath: () => undefined,
            functionRegistry: {
                invoke(name, args) {
                    return name === 'ExampleClass.double' ? Number(args[0]) * 2 : undefined;
                }
            }
        })).resolves.toBe(42);
    });
});

describe('DataMapperExecutor', () => {
    it('executes transform mappers without a query runner', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Transform',
            InputType: 'JSON',
            OutputType: 'JSON',
            OmniDataTransformItem: [
                {
                    InputFieldName: 'account:name',
                    OutputFieldName: 'customer:displayName',
                    OutputObjectName: 'json'
                },
                {
                    InputFieldName: 'account:status',
                    OutputFieldName: 'customer:state',
                    OutputObjectName: 'json',
                    TransformValueMappings: JSON.stringify({ A: 'Active' })
                },
                {
                    InputFieldName: 'account:type',
                    OutputFieldName: 'customer:type',
                    OutputObjectName: 'json',
                    TransformValuesMappings: JSON.stringify({ C: 'Customer' })
                },
                {
                    InputFieldName: 'account:missing',
                    OutputFieldName: 'customer:fallback',
                    OutputObjectName: 'json',
                    DefaultValue: 'default'
                }
            ]
        };

        await expect(new DataMapperExecutor().execute(mapper, {
            account: {
                name: 'Acme',
                status: 'A',
                type: 'C'
            }
        })).resolves.toEqual({
            customer: {
                displayName: 'Acme',
                state: 'Active',
                type: 'Customer',
                fallback: 'default'
            }
        });
    });

    it('maps transform arrays into repeated output objects', async () => {
        const mapper = DataMapperBuilder.transform()
            .map('name', 'accounts:name')
            .map('status', 'accounts:state', {
                transformValueMappings: [
                    { source: 'A', target: 'Active' },
                    { source: 'I', target: 'Inactive' }
                ]
            })
            .build();

        await expect(new DataMapperExecutor().execute(mapper, [
            { name: 'Acme', status: 'A' },
            { name: 'Global Media', status: 'I' }
        ])).resolves.toEqual({
            accounts: [
                { name: 'Acme', state: 'Active' },
                { name: 'Global Media', state: 'Inactive' }
            ]
        });
    });

    it('executes transform formulas before output mappings', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Transform',
            InputType: 'JSON',
            OutputType: 'JSON',
            OmniDataTransformItem: [
                {
                    FormulaExpression: 'CONCAT(account:firstName, " ", account:lastName)',
                    FormulaResultPath: 'account:fullName',
                    FormulaSequence: 1,
                    OutputObjectName: 'Formula',
                    OutputFieldName: 'Formula'
                },
                {
                    InputFieldName: 'account:fullName',
                    OutputFieldName: 'customer:name',
                    OutputObjectName: 'json'
                }
            ]
        };

        await expect(new DataMapperExecutor().execute(mapper, {
            account: {
                firstName: 'Ada',
                lastName: 'Lovelace'
            }
        })).resolves.toEqual({
            customer: {
                name: 'Ada Lovelace'
            }
        });
    });

    it('builds executable transform mappers programmatically', async () => {
        const mapper = DataMapperBuilder.transform()
            .formula('CONCAT(account:firstName, " ", account:lastName)', 'account:fullName')
            .map('account:fullName', 'customer:name')
            .map('account:status', 'customer:status', {
                transformValueMappings: { A: 'Active' }
            })
            .build();

        expect(mapper.Type).toBe('Transform');
        expect(mapper.OmniDataTransformItem).toHaveLength(3);
        await expect(new DataMapperExecutor().execute(mapper, {
            account: {
                firstName: 'Ada',
                lastName: 'Lovelace',
                status: 'A'
            }
        })).resolves.toEqual({
            customer: {
                name: 'Ada Lovelace',
                status: 'Active'
            }
        });
    });

    it('builds executable hierarchical extract mappers programmatically', async () => {
        const account = DataMapperBuilder.extract()
            .extractObject('Account', 'account')
            .where('Id', '=', 'Id')
            .orderBy('Name');
        const mapper = account
            .child('Contact', 'contacts')
            .where('AccountId', '=', 'account:Id')
            .done()
            .map('account:Name', 'accounts:name')
            .map('account:contacts:LastName', 'accounts:contacts:lastName')
            .build();
        const queries = new Array<string>();

        const result = await new DataMapperExecutor().execute(mapper, { Id: 'A1' }, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    if (query.includes('FROM Account')) {
                        return [{ Id: 'A1', Name: 'Acme' }];
                    }
                    if (query.includes('FROM Contact')) {
                        return [{ Id: 'C1', AccountId: 'A1', LastName: 'Lovelace' }];
                    }
                    return [];
                }
            }
        });

        expect(queries[0]).toContain('SELECT Id, Name FROM Account WHERE Id = \'A1\' ORDER BY Name');
        expect(queries[1]).toContain('SELECT AccountId, Id, LastName FROM Contact WHERE AccountId = \'A1\'');
        expect(result).toEqual({
            accounts: [{
                name: 'Acme',
                contacts: [{
                    lastName: 'Lovelace'
                }]
            }]
        });
    });

    it('builds SOQL for friendly extract filter operators, constants and array inputs', async () => {
        const mapper = DataMapperBuilder.extract()
            .extractObject('Account', 'account')
            .where('Id', 'IN', 'ids')
            .where('ParentId', 'Equals', '$Vlocity.NULL')
            .where('Name', 'Contains', 'needle')
            .done()
            .map('account:Name', 'accounts:name')
            .build();
        const queries = new Array<string>();

        await new DataMapperExecutor().execute(mapper, {
            ids: ['A1', 'A2'],
            needle: 'Acme'
        }, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    return [];
                }
            }
        });

        expect(queries[0]).toContain('Id IN (\'A1\', \'A2\')');
        expect(queries[0]).toContain('ParentId = null');
        expect(queries[0]).toContain('Name LIKE \'%Acme%\'');
    });

    it('skips extract queries when a path-shaped filter reference is unresolved', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Extract',
            InputType: 'JSON',
            OutputType: 'JSON',
            OmniDataTransformItem: [
                extract(
                    'QuoteLinerelationship__c',
                    'QuoteLineItemId__c',
                    'SBQQ__Quote__c:SBQQ__QuoteLine__c:Id',
                    'SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c',
                    3
                ),
                map(
                    'SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c:Role__c',
                    'relationships:role'
                )
            ]
        };
        const queries = new Array<string>();
        const warnings = new Array<unknown>();

        const result = await new DataMapperExecutor().execute(mapper, {}, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    return [];
                }
            },
            onWarning: warning => warnings.push(warning)
        });

        expect(queries).toHaveLength(0);
        expect(result).toEqual({});
        expect(warnings).toEqual([
            expect.objectContaining({
                code: 'unresolvedFilter',
                fieldName: 'QuoteLineItemId__c',
                objectName: 'QuoteLinerelationship__c',
                message: expect.stringContaining('SBQQ__Quote__c:SBQQ__QuoteLine__c:Id')
            })
        ]);
    });

    it('keeps quoted path-shaped filter values as constants', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Extract',
            InputType: 'JSON',
            OutputType: 'JSON',
            OmniDataTransformItem: [
                extract(
                    'QuoteLinerelationship__c',
                    'QuoteLineItemId__c',
                    '"SBQQ__Quote__c:SBQQ__QuoteLine__c:Id"',
                    'QuoteLinerelationship__c',
                    1
                )
            ]
        };
        const queries = new Array<string>();

        await new DataMapperExecutor().execute(mapper, {}, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    return [];
                }
            }
        });

        expect(queries[0]).toContain('WHERE QuoteLineItemId__c = \'SBQQ__Quote__c:SBQQ__QuoteLine__c:Id\'');
    });

    it('filters invalid extracted fields from SOQL and resolves them as null for formulas', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Extract',
            InputType: 'JSON',
            OutputType: 'JSON',
            IsNullInputsIncludedInOutput: true,
            OmniDataTransformItem: [
                extract(
                    'QuoteLinerelationship__c',
                    'QuoteLineItemId__c',
                    '"QL1"',
                    'QuoteLinerelationship__c',
                    1
                ),
                formula(
                    'QuoteLinerelationship__c:RelatedQuoteLineItemId__r.Role__c',
                    'QuoteLinerelationship__c:Role__c',
                    1
                ),
                map('QuoteLinerelationship__c:Role__c', 'relationships:role')
            ]
        };
        const queries = new Array<string>();
        const warnings = new Array<unknown>();

        const result = await new DataMapperExecutor().execute(mapper, {}, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    return [{ Id: 'R1', QuoteLineItemId__c: 'QL1' }];
                }
            },
            validateField: (_objectName, fieldName) => fieldName !== 'RelatedQuoteLineItemId__r.Role__c',
            onWarning: warning => warnings.push(warning)
        });

        expect(queries[0]).toContain('SELECT Id, QuoteLineItemId__c FROM QuoteLinerelationship__c');
        expect(queries[0]).not.toContain('RelatedQuoteLineItemId__r.Role__c');
        expect(result).toEqual({
            relationships: [{
                role: null
            }]
        });
        expect(warnings).toEqual([
            expect.objectContaining({
                code: 'invalidField',
                fieldName: 'RelatedQuoteLineItemId__r.Role__c',
                objectName: 'QuoteLinerelationship__c'
            })
        ]);
    });

    it('reports formula evaluation failures as warnings when a warning sink is provided', async () => {
        const mapper: DataMapperDefinition = {
            Type: 'Transform',
            InputType: 'JSON',
            OutputType: 'JSON',
            OmniDataTransformItem: [
                formula('UNKNOWN(account:name)', 'account:bad', 1),
                map('account:bad', 'customer:bad')
            ]
        };
        const warnings = new Array<unknown>();

        const result = await new DataMapperExecutor().execute(mapper, {
            account: {
                name: 'Acme'
            }
        }, {
            onWarning: warning => warnings.push(warning)
        });

        expect(result).toEqual({});
        expect(warnings).toEqual([
            expect.objectContaining({
                code: 'formulaEvaluationFailed',
                expression: 'UNKNOWN(account:name)'
            })
        ]);
    });

    it('executes extract mappers with hierarchical output and formula-created children', async () => {
        const mapper = createQuoteLineExtractMapper();
        const executor = new DataMapperExecutor();
        const plan = executor.buildExecutionPlan(mapper);
        const lineFields = plan.requiredFieldsByObject.get('SBQQ__QuoteLine__c');
        const relationshipFields = plan.requiredFieldsByObject.get('QuoteLinerelationship__c');
        const queries = new Array<string>();

        expect(lineFields).toEqual(expect.arrayContaining([
            'Id',
            'Name',
            'Quote_Line_Status__c',
            'SBQQ__Quote__c',
            'SBQQ__RequiredBy__c',
            'SBQQ__RequiredBy__r.Name',
            'Units__c'
        ]));
        expect(relationshipFields).toEqual(expect.arrayContaining([
            'Id',
            'QuoteLineItemId__c',
            'RelatedQuoteLineItemId__r.Name',
            'Role__c'
        ]));

        const result = await executor.execute(mapper, { Id: 'Q1' }, {
            queryRunner: {
                async query(query) {
                    queries.push(query);
                    if (query.includes('FROM SBQQ__Quote__c')) {
                        return [{ Id: 'Q1', GlobalKey__c: 'quote-global', Name: 'Quote 1' }];
                    }
                    if (query.includes('FROM SBQQ__QuoteLine__c')) {
                        return [
                            {
                                Id: 'QL1',
                                SBQQ__Quote__c: 'Q1',
                                Name: 'LI-0001',
                                Quote_Line_Status__c: 'Add',
                                Units__c: 2,
                                SBQQ__RequiredBy__c: null
                            },
                            {
                                Id: 'QL2',
                                SBQQ__Quote__c: 'Q1',
                                Name: 'LI-0002',
                                Quote_Line_Status__c: 'Change',
                                Units__c: 1,
                                SBQQ__RequiredBy__c: 'QL1',
                                'SBQQ__RequiredBy__r.Name': 'LI-0001'
                            }
                        ];
                    }
                    if (query.includes('FROM QuoteLinerelationship__c')) {
                        return [{
                            Id: 'R1',
                            QuoteLineItemId__c: 'QL1',
                            Role__c: 'reliesOn',
                            'RelatedQuoteLineItemId__r.Name': 'LI-0002'
                        }];
                    }
                    return [];
                }
            }
        });

        expect(queries[0]).toContain('SELECT GlobalKey__c, Id, Name FROM SBQQ__Quote__c WHERE Id = \'Q1\'');
        expect(queries[1]).toContain('SBQQ__RequiredBy__r.Name');
        expect(queries[1]).toContain('WHERE SBQQ__Quote__c = \'Q1\'');
        expect(queries[2]).toContain('WHERE QuoteLineItemId__c IN (\'QL1\', \'QL2\')');
        expect(result).toEqual({
            id: 'quote-global',
            description: 'Quote 1',
            quoteItem: [
                {
                    action: 'Add',
                    id: '0001',
                    quantity: 2,
                    quoteItemRelationship: [{
                        relationshipType: 'reliesOn',
                        id: '0002'
                    }]
                },
                {
                    action: 'Change',
                    id: '0002',
                    quantity: 1,
                    quoteItemRelationship: [{
                        relationshipType: 'bundledBy',
                        id: '0001'
                    }]
                }
            ]
        });
    });

    it('rejects load mappers', async () => {
        await expect(new DataMapperExecutor().execute({ Type: 'Load', OmniDataTransformItem: [] }, {}))
            .rejects.toThrow('Load execution is not supported');
    });
});

function createQuoteLineExtractMapper(): DataMapperDefinition {
    return {
        Type: 'Extract',
        InputType: 'JSON',
        OutputType: 'JSON',
        IsNullInputsIncludedInOutput: false,
        OmniDataTransformItem: [
            extract('SBQQ__Quote__c', 'Id', 'Id', 'SBQQ__Quote__c', 1),
            extract('SBQQ__QuoteLine__c', 'SBQQ__Quote__c', 'SBQQ__Quote__c:Id', 'SBQQ__Quote__c:SBQQ__QuoteLine__c', 2),
            extract('QuoteLinerelationship__c', 'QuoteLineItemId__c', 'SBQQ__Quote__c:SBQQ__QuoteLine__c:Id', 'SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c', 3),
            formula(
                `DESERIALIZE('[{"Id":"bundledBy-' + %SBQQ__Quote__c:SBQQ__QuoteLine__c:Id% + '","RelatedQuoteLineItemId__r.Name":"' + SUBSTRING(%SBQQ__Quote__c:SBQQ__QuoteLine__c:SBQQ__RequiredBy__r.Name%, 3) + '","Role__c":"bundledBy"}]')`,
                'SBQQ__Quote__c:SBQQ__QuoteLine__c:BundleByLinerelationships',
                1
            ),
            formula(
                'IF(ISBLANK(SBQQ__Quote__c:SBQQ__QuoteLine__c:SBQQ__RequiredBy__c), LIST(), LIST(SBQQ__Quote__c:SBQQ__QuoteLine__c:BundleByLinerelationships))',
                'SBQQ__Quote__c:SBQQ__QuoteLine__c:BundleByLinerelationships',
                2
            ),
            formula(
                'SUBSTRING(SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c:RelatedQuoteLineItemId__r.Name, 3)',
                'SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c:RelatedQuoteLineItemId__r.Name',
                3
            ),
            formula(
                "LISTMERGE('Id', LIST(SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationship__c), LIST(SBQQ__Quote__c:SBQQ__QuoteLine__c:BundleByLinerelationships))",
                'SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationships',
                4
            ),
            formula(
                'SUBSTRING(SBQQ__Quote__c:SBQQ__QuoteLine__c:Name, 3)',
                'SBQQ__Quote__c:SBQQ__QuoteLine__c:Name',
                5
            ),
            map('SBQQ__Quote__c:GlobalKey__c', 'id'),
            map('SBQQ__Quote__c:Name', 'description'),
            map('SBQQ__Quote__c:SBQQ__QuoteLine__c:Quote_Line_Status__c', 'quoteItem:action'),
            map('SBQQ__Quote__c:SBQQ__QuoteLine__c:Name', 'quoteItem:id'),
            map('SBQQ__Quote__c:SBQQ__QuoteLine__c:Units__c', 'quoteItem:quantity'),
            {
                OutputObjectName: 'json',
                OutputFieldName: 'quoteItem:quoteItemRelationship',
                OutputFieldFormat: 'List<Map>'
            },
            map('SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationships:Role__c', 'quoteItem:quoteItemRelationship:relationshipType'),
            map('SBQQ__Quote__c:SBQQ__QuoteLine__c:QuoteLinerelationships:RelatedQuoteLineItemId__r.Name', 'quoteItem:quoteItemRelationship:id')
        ]
    };
}

function extract(inputObjectName: string, inputFieldName: string, filterValue: string, outputFieldName: string, sequence: number) {
    return {
        InputObjectName: inputObjectName,
        InputFieldName: inputFieldName,
        FilterOperator: '=',
        FilterValue: filterValue,
        FilterGroup: 0,
        InputObjectQuerySequence: sequence,
        OutputObjectName: 'json',
        OutputFieldName: outputFieldName
    };
}

function formula(expression: string, resultPath: string, sequence: number) {
    return {
        FormulaExpression: expression,
        FormulaResultPath: resultPath,
        FormulaSequence: sequence,
        OutputObjectName: 'Formula',
        OutputFieldName: 'Formula'
    };
}

function map(inputFieldName: string, outputFieldName: string) {
    return {
        InputFieldName: inputFieldName,
        OutputObjectName: 'json',
        OutputFieldName: outputFieldName
    };
}

import { formatJsonLike, mergeJsonStable, updateJsonText, type StableJsonMergeOptions } from '../stableJson';

const byKey: StableJsonMergeOptions = { identity: element => (element as { key?: string })?.key };

describe('stableJson', () => {
    describe('mergeJsonStable', () => {
        it.each([
            ['equal objects', { a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 }],
            ['changed scalar', { a: 1, b: 2 }, { b: 3, a: 1 }],
            ['added and removed keys', { z: 1, a: 1 }, { a: 1, b: 2 }],
            ['type changes', { a: [1], b: { c: 1 }, c: 'x' }, { a: { d: 1 }, b: null, c: 1 }],
            ['records', [{ key: 'b', v: 1 }, { key: 'a', v: 1 }], [{ key: 'a', v: 2 }, { key: 'c', v: 1 }]],
            ['nested records', { items: [{ x: 1, y: [{ z: 1 }] }] }, { items: [{ y: [{ z: 2 }, { z: 3 }], x: 1 }] }],
            ['primitive arrays', ['a', 'b', 'c'], ['c', 'a', 'd']],
            ['different root types', { a: 1 }, [1]]
        ])('should return a value equal to the updated value for %s', (_name, existing, updated) => {
            expect(mergeJsonStable(existing, updated, byKey).value).toEqual(updated);
        });

        it('should return a value equal to the updated value when merging values again after they changed', () => {
            const existing = { a: 1, items: [{ b: 1, c: 1 }] };
            const updated = { a: 1, items: [{ b: 1, c: 1 }] };
            mergeJsonStable(existing, updated);
            updated.a = 2;
            updated.items[0].b = 2;
            const result = mergeJsonStable(existing, updated);
            expect(result.value).toEqual(updated);
            expect(result.changes).toEqual([
                { path: 'a', type: 'changed' },
                { path: 'items[0].b', type: 'changed' }
            ]);
        });

        describe('objects', () => {
            it('should keep the existing value and report no changes when only the key order differs', () => {
                const existing = { b: 1, a: { d: 2, c: 3 } };
                const result = mergeJsonStable(existing, { a: { c: 3, d: 2 }, b: 1 });
                expect(result.value).toBe(existing);
                expect(result.changes).toEqual([]);
            });

            it('should keep the existing key order when updating a value', () => {
                const result = mergeJsonStable({ c: 1, a: 1, b: 1 }, { a: 1, b: 2, c: 1 });
                expect(Object.keys(result.value)).toEqual(['c', 'a', 'b']);
                expect(result.changes).toEqual([{ path: 'b', type: 'changed' }]);
            });

            it('should insert an added key after the key that precedes it in the updated value', () => {
                const result = mergeJsonStable({ z: 1, a: 1, m: 1 }, { a: 1, b: 2, m: 1, n: 3, z: 1 });
                expect(Object.keys(result.value)).toEqual(['z', 'a', 'b', 'm', 'n']);
                expect(result.changes).toEqual([
                    { path: 'b', type: 'added' },
                    { path: 'n', type: 'added' }
                ]);
            });

            it('should insert an added key at the start when no key precedes it', () => {
                const result = mergeJsonStable({ b: 1, c: 1 }, { a: 0, b: 1, c: 1 });
                expect(Object.keys(result.value)).toEqual(['a', 'b', 'c']);
            });

            it.each([null, 0, false, '', {}, []])('should treat %j as a value when adding, removing and changing keys', value => {
                expect(mergeJsonStable({ a: 1 }, { a: 1, b: value }).changes).toEqual([{ path: 'b', type: 'added' }]);
                expect(mergeJsonStable({ a: 1, b: value }, { a: 1 }).changes).toEqual([{ path: 'b', type: 'removed' }]);
                expect(mergeJsonStable({ a: 'x' }, { a: value }).changes).toEqual([{ path: 'a', type: 'changed' }]);
            });

            it('should report changes with the path of the nested value', () => {
                const result = mergeJsonStable({ a: { b: { c: 1, d: 1 } } }, { a: { b: { c: 2 } } });
                expect(result.changes).toEqual([
                    { path: 'a.b.d', type: 'removed' },
                    { path: 'a.b.c', type: 'changed' }
                ]);
            });
        });

        describe('arrays of records', () => {
            it('should keep the existing record order when records are only reordered', () => {
                const existing = [{ v: 2 }, { v: 1 }, { v: 3 }];
                const result = mergeJsonStable(existing, [{ v: 1 }, { v: 2 }, { v: 3 }]);
                expect(result.value).toEqual(existing);
                expect(result.changes).toEqual([]);
            });

            it('should update a record with the same identity in place', () => {
                const existing = [{ key: 'c', v: 1 }, { key: 'b', v: 1 }, { key: 'a', v: 1 }];
                const result = mergeJsonStable(existing, [{ key: 'a', v: 1 }, { key: 'b', v: 2 }, { key: 'c', v: 1 }], byKey);
                expect(result.value).toEqual([{ key: 'c', v: 1 }, { key: 'b', v: 2 }, { key: 'a', v: 1 }]);
                expect(result.changes).toEqual([{ path: '[1].v', type: 'changed' }]);
            });

            it('should insert an added record after the record that precedes it in the updated value', () => {
                const result = mergeJsonStable([{ key: 'c' }, { key: 'a' }], [{ key: 'a' }, { key: 'b' }, { key: 'c' }], byKey);
                expect(result.value).toEqual([{ key: 'c' }, { key: 'a' }, { key: 'b' }]);
                expect(result.changes).toEqual([{ path: '[2]', type: 'added' }]);
            });

            it('should report a removed record with its path in the existing value', () => {
                const result = mergeJsonStable([{ key: 'a' }, { key: 'b' }, { key: 'c' }], [{ key: 'a' }, { key: 'c' }], byKey);
                expect(result.changes).toEqual([{ path: '[1]', type: 'removed' }]);
            });

            it('should never pair records with a different identity', () => {
                const result = mergeJsonStable([{ key: 'a', v: 1, w: 1 }], [{ key: 'b', v: 1, w: 1 }], byKey);
                expect(result.changes).toEqual([
                    { path: '[0]', type: 'removed' },
                    { path: '[0]', type: 'added' }
                ]);
            });

            it('should pair records without identity on similarity regardless of their position', () => {
                const existing = [{ name: 'x', value: 1, type: 'a' }, { name: 'y', value: 1, type: 'b' }];
                const result = mergeJsonStable(existing, [{ name: 'y', value: 2, type: 'b' }, { name: 'x', value: 1, type: 'a' }]);
                expect(result.value).toEqual([{ name: 'x', value: 1, type: 'a' }, { name: 'y', value: 2, type: 'b' }]);
                expect(result.changes).toEqual([{ path: '[1].value', type: 'changed' }]);
            });

            it('should pair the most similar record when several records are similar', () => {
                const existing = [{ a: 1, b: 1, c: 1, d: 1 }, { a: 1, b: 1, c: 2, d: 2 }];
                const result = mergeJsonStable(existing, [{ a: 1, b: 1, c: 2, d: 3 }]);
                expect(result.changes).toEqual([
                    { path: '[0]', type: 'removed' },
                    { path: '[0].d', type: 'changed' }
                ]);
            });

            it('should pair the closest record when records are equally similar', () => {
                const existing = [{ a: 1, b: 1 }, { a: 1, b: 2 }];
                const result = mergeJsonStable(existing, [{ c: 1 }, { a: 1, b: 3 }]);
                expect(result.value).toEqual([{ c: 1 }, { a: 1, b: 3 }]);
                expect(result.changes).toEqual([
                    { path: '[0]', type: 'removed' },
                    { path: '[0]', type: 'added' },
                    { path: '[1].b', type: 'changed' }
                ]);
            });

            it('should replace records that are less similar than the threshold', () => {
                const changed = [{ a: 2, b: 2, c: 1 }];
                const expectedReplace = [{ path: '[0]', type: 'removed' }, { path: '[0]', type: 'added' }];
                expect(mergeJsonStable([{ a: 1, b: 1, c: 1 }], changed).changes).toEqual(expectedReplace);
                expect(mergeJsonStable([{ a: 1, b: 1, c: 1 }], changed, { similarity: 0.3 }).changes).toEqual([
                    { path: '[0].a', type: 'changed' },
                    { path: '[0].b', type: 'changed' }
                ]);
            });

            it('should replace changed records when similarity matching is disabled', () => {
                const result = mergeJsonStable([{ a: 1, b: 1, c: 1 }], [{ a: 1, b: 1, c: 2 }], { similarity: false });
                expect(result.changes).toEqual([
                    { path: '[0]', type: 'removed' },
                    { path: '[0]', type: 'added' }
                ]);
            });

            it('should pair nested arrays on the share of equal elements', () => {
                const result = mergeJsonStable([[1, 2, 3, 4], [5, 6, 7, 8]], [[5, 6, 7, 9], [1, 2, 3, 4]]);
                expect(result.changes).toEqual([
                    { path: '', type: 'reordered' },
                    { path: '[0][3]', type: 'removed' },
                    { path: '[0][3]', type: 'added' }
                ]);
            });
        });

        describe('arrays of primitives', () => {
            it('should follow the updated order and report the reordering', () => {
                const result = mergeJsonStable(['a', 'b'], ['b', 'a']);
                expect(result.value).toEqual(['b', 'a']);
                expect(result.changes).toEqual([{ path: '', type: 'reordered' }]);
            });

            it('should keep the existing order when preserveArrayOrder says so', () => {
                const result = mergeJsonStable(['a', 'b'], ['b', 'a', 'c'], { preserveArrayOrder: () => true });
                expect(result.value).toEqual(['a', 'c', 'b']);
                expect(result.changes).toEqual([{ path: '[1]', type: 'added' }]);
            });
        });
    });

    describe('updateJsonText', () => {
        it('should return the existing text when the documents only differ in order', () => {
            const existing = '{\n  "b": 1,\n  "a": [\n    { "x": 1 }\n  ]\n}';
            const result = updateJsonText(existing, JSON.stringify({ a: [{ x: 1 }], b: 1 }, undefined, 4));
            expect(result).toMatchObject({ text: existing, changed: false, changes: [] });
        });

        it('should write the merged value when the documents differ', () => {
            const result = updateJsonText('{\n    "b": 1,\n    "a": 1\n}\n', '{"a":2,"b":1,"c":null}');
            expect(result.text).toBe('{\n    "b": 1,\n    "c": null,\n    "a": 2\n}\n');
            expect(result.changed).toBe(true);
            expect(result.changes).toEqual([
                { path: 'c', type: 'added' },
                { path: 'a', type: 'changed' }
            ]);
        });

        it.each([
            ['there is no existing document', undefined],
            ['the existing document is not valid JSON', '{ invalid']
        ])('should return the updated text without changes when %s', (_name, existing) => {
            expect(updateJsonText(existing, '{"a":1}')).toEqual({ text: '{"a":1}', value: { a: 1 }, changed: true, changes: [] });
        });

        it('should return the updated text without changes when the updated document is not valid JSON', () => {
            expect(updateJsonText('{"a":1}', '{ invalid')).toEqual({ text: '{ invalid', value: undefined, changed: true, changes: [] });
        });
    });

    describe('formatJsonLike', () => {
        it.each([
            ['four spaces', '{\n    "a": 1\n}', '{\n    "b": [\n        1\n    ]\n}'],
            ['two spaces', '{\n  "a": 1\n}', '{\n  "b": [\n    1\n  ]\n}'],
            ['tabs and CRLF', '{\r\n\t"a": 1\r\n}\r\n', '{\r\n\t"b": [\r\n\t\t1\r\n\t]\r\n}\r\n'],
            ['a byte order mark', '﻿{\n  "a": 1\n}', '﻿{\n  "b": [\n    1\n  ]\n}'],
            ['single-line JSON', '{"a":1}', '{"b":[1]}'],
            ['an empty object', '{}\n', '{\n    "b": [\n        1\n    ]\n}\n']
        ])('should reuse the formatting of a document with %s', (_name, reference, expected) => {
            expect(formatJsonLike(reference, { b: [1] })).toBe(expected);
        });
    });
});

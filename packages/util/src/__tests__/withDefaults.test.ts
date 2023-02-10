/* eslint-disable @typescript-eslint/require-await */
import 'jest';
import { withDefaults } from '../defaults';

describe('withDefaults', () => {
    it('should prefer values when set', () => {
        const defaults = {
            a: 1,
            b: 'b'
        }        

        const sut = withDefaults({ a: 2 }, defaults);

        expect(sut.a).toEqual(2);
        expect(sut.b).toEqual('b');
    });
    it('should merge nested objects with defaults', () => {
        const defaults = {
            nested: {
                a: 'a',
                b: 'b'
            }
        }        

        const sut = withDefaults({ nested: { a: 'b' } }, defaults);

        expect(sut.nested.a).toEqual('b');
        expect(sut.nested.b).toEqual('b');
    });
    it('should set values on original object', () => {
        const defaults = {
            nested: {
                a: 'a',
                b: 'b'
            }
        }        

        const org = { nested: { a: 'b' } };
        const sut = withDefaults(org, defaults);
        sut.nested.a = 'c';
        sut.nested.b = 'c';

        expect(org.nested.a).toEqual('c');
        expect(org.nested['b']).toEqual('c');
        expect(defaults.nested.a).toEqual('a');
        expect(defaults.nested.b).toEqual('b');
        expect(sut.nested.a).toEqual('c');
        expect(sut.nested.b).toEqual('c');
    });
    it('should created nested objects when required', () => {
        const defaults = {
            nested: {
                a: 'a',
                b: 'b'
            }
        }        

        const org = { };
        const sut = withDefaults(org, defaults);
        sut.nested.a = 'c';
        sut.nested.b = 'c';

        expect(org['nested']['a']).toEqual('c');
        expect(org['nested']['b']).toEqual('c');
        expect(defaults.nested.a).toEqual('a');
        expect(defaults.nested.b).toEqual('b');
        expect(sut.nested.a).toEqual('c');
        expect(sut.nested.b).toEqual('c');
    });
});
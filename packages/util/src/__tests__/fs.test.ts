import 'jest';
import { directoryName } from '../fs';

describe('fs', () => {
    describe('#directoryName', () => {
        it('should return parent folder for relative paths', () => {
            expect(directoryName('foo/bar')).toBe('foo');
        });

        it('should return dot for single relative segment', () => {
            expect(directoryName('foo')).toBe('.');
        });

        it('should clamp to drive root for deep traversal', () => {
            expect(directoryName('C:/foo', 2)).toBe('C:/');
            expect(directoryName('C:/foo', 3)).toBe('C:/');
        });

        it('should keep posix root when traversing from absolute path', () => {
            expect(directoryName('/project/foo', 3)).toBe('/');
        });

        it('should keep UNC share root when traversing with depth', () => {
            expect(directoryName('\\\\server\\share\\a\\b', 2)).toBe('\\\\server\\share');
            expect(directoryName('\\\\server\\share\\a\\b', 4)).toBe('\\\\server\\share');
        });

        it('should throw on invalid depth', () => {
            expect(() => directoryName('foo/bar', 0)).toThrow('Invalid depth 0');
        });
    });
});

import 'jest';
import { directoryName, fileName } from '../fs';

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

    describe('#fileName', () => {
        it('should support POSIX and Windows path separators', () => {
            expect(fileName('/project/datapacks/Product.json')).toBe('Product.json');
            expect(fileName('C:\\project\\datapacks\\Product.json')).toBe('Product.json');
        });

        it('should remove only the final extension when requested', () => {
            expect(fileName('/project/Product.pack.json', true)).toBe('Product.pack');
            expect(fileName('Product.json', true)).toBe('Product');
        });

        it('should preserve extension-only file names', () => {
            expect(fileName('/project/.gitignore', true)).toBe('.gitignore');
        });
    });
});

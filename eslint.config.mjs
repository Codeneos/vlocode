import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        linterOptions: {
            reportUnusedDisableDirectives: 'off'
        },
        ignores: [
            '**/.*.js',
            '**/*.d.ts',
            '**/out/**',
            '**/dist/**',
            'lib/**',
            'packages/*/lib/**',
            '**/webpack/**',
            '**/node_modules/**',
            '**/.vscode/**',
            '**/.vscode-test/**',
            'packages/vscode-extension/build/**',
            '**/__mocks__/**',
            'jest.config.ts',
            '**/jest.config.ts'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.es2020,
                ...globals.node,
                ...globals.jest
            },
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/unbound-method': 'warn',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
            'no-cond-assign': 'warn',
            'prefer-spread': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'no-constant-binary-expression': 'off',
            'no-useless-assignment': 'off',
            'prefer-const': 'off',
            'preserve-caught-error': 'off'
        }
    }
);

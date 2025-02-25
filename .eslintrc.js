module.exports = {
    root: true,
    env: {
        es2020: true,
        node: true
    },
    ignorePatterns: [
        "**/.*.js",
        "**/*.d.ts",
        "out",
        "dist",
        "lib",
        "webpack",
        "node_modules/**/*",
        ".vscode/**/*",
        ".vscode-test/**/*",
        "packages/apex/src/grammar",
        "packages/vscode-extension/build",
        "jest.config.ts",
        "**/*/jest.config.ts"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ 
            'packages/**/tsconfig.json'
        ]
    },
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
        // Allow `any` to be used for now
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-unsafe-return": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-argument": 0,
        // To many false-posetives on this rule
        "@typescript-eslint/restrict-template-expressions": 0,
        "@typescript-eslint/no-unused-expressions": 0,
        "@typescript-eslint/unbound-method": 1,
        "@typescript-eslint/no-inferrable-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-namespace": 0,
        "no-cond-assign": 1,
        "prefer-spread": 1,
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [ "error" ]
    }
};

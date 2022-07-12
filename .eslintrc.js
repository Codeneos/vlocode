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
        "jest.config.ts"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
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
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-inferrable-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-namespace": 0
    }
};

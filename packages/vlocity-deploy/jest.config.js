module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ],
  testRegex: [
    "/__tests__/\\.test\\.[jt]sx?$",
    "/__tests__/\\.spec\\.[jt]sx?$"
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
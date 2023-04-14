module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ],
  testRegex: "(\\.)(test)\\.[jt]sx?$",
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
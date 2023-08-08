module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ],
  testRegex: "(\\.)(test)\\.[jt]sx?$",
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
    '\\.yaml$': '<rootDir>/webpack/loaders/yaml.js'
  },
  moduleNameMapper: {
    '^@vlocode/(.*)$': '<rootDir>/../$1/src'
  }
};
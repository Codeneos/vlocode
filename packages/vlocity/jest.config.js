module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts}',
    '!**/node_modules/**'
  ],
  testRegex: "(\\.)(test)\\.[jt]sx?$",
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }]
  }
};
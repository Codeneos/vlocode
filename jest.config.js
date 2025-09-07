/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: 'ts-jest',
  testRegex: "src/.*(\\.)(test)\\.[jt]sx?$",
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: [ 'lcov' ],
  reporters: ['default', 'jest-sonar', ['jest-junit', { outputDirectory: 'coverage' }] ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { esModuleInterop: true, isolatedModules: true }]
  }
};

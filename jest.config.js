/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: 'ts-jest',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: [ 'lcov' ],
  reporters: ['default', 'jest-sonar', ['jest-junit', { outputDirectory: 'coverage' }] ],
  projects: [
    "packages/util",
    "packages/core",
    "packages/salesforce",
    "packages/vlocity-deploy",
    "packages/vscode-extension"
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { esModuleInterop: true, isolatedModules: true }]
  }
};

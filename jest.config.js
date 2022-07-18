/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: [ 'lcov' ],
  reporters: ['default', 'jest-sonar', ['jest-junit', { outputDirectory: 'coverage' }] ],
  projects: [
    "packages/util/src", 
    "packages/core/src", 
    "packages/salesforce/src", 
    "packages/vlocity-deploy/src"
  ]
};

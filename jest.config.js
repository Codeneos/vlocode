/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: 'ts-jest',
  testRegex: "src/.*(\\.)(test)\\.[jt]sx?$",
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: [ 'lcov' ],
  // Regression-prevention baseline set a few points below the measured coverage
  // (statements/lines ~71%, branches ~64%, functions ~30%). Ratchet upwards as
  // coverage improves; it should never be lowered to make a red build pass.
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 58,
      functions: 25,
      lines: 65
    }
  },
  reporters: ['default', 'jest-sonar', ['jest-junit', { outputDirectory: 'coverage' }] ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      esModuleInterop: true,
      tsconfig: {
        module: 'CommonJS',
        moduleResolution: 'node'
      }
    }]
  }
};

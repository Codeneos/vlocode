export default {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverageFrom: [
    'src/**/*.{ts}',
    '!**/node_modules/**'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { esModuleInterop: true, isolatedModules: true }],
    '\\.yaml$': '<rootDir>/jest/yaml-transformer.cjs'
  },
  moduleNameMapper: {
    '^@vlocode/(.*)$': '<rootDir>/../$1/src',
    '^vscode$': '<rootDir>/src/__mocks__/vscode'
  }
};

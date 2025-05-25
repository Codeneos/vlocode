module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverageFrom: [
    'src/**/*.{ts}',
    '!**/node_modules/**'
  ],
  testRegex: "(\\.)(test)\\.[jt]sx?$",
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }],
    '^.+\\.tsx$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }],
    '\\.yaml$': '<rootDir>/webpack/loaders/yaml.js'
  },
  moduleNameMapper: {
    '^@vlocode/(.*)$': '<rootDir>/../$1/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy' // Handle CSS imports
  },
  setupFilesAfterEnv: ['<rootDir>/src/lib/webviews/omniScriptEditor/jest.setup.js']
};
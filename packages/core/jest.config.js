module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverageFrom: [
    'src/**/*.{ts}',
    '!**/node_modules/**'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true, esModuleInterop: true }]
  }
};
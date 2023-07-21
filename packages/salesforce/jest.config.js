module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }]
  }
};
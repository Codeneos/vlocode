module.exports = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
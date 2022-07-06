import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  roots: [ 'src' ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [ '/node_modules/', 'index.ts' ]
};

export default config;

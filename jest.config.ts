import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    "packages/salesforce/src", 
    "packages/util/src"
  ]
};

export default config;

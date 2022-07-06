import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    "packages/util/src", 
    "packages/core/src", 
    "packages/salesforce/src", 
    "packages/vlocity-deploy/src"
  ]
};

export default config;

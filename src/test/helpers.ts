'use strict';
import * as sinon from 'sinon';

/**
 * Helper function to mock class; uses sinon
 * @see https://spin.atomicobject.com/2018/06/13/mock-typescript-modules-sinon/
 * @param moduleToMock 
 * @param defaultMockValuesForMock 
 */
export function mockModule<T extends { [K: string]: any }>(moduleToMock: T, defaultMockValuesForMock: Partial<{ [K in keyof T]: T[K] }>) {
    return (sandbox: sinon.SinonSandbox, returnOverrides?: Partial<{ [K in keyof T]: T[K] }>): void => {
      const functions = Object.keys(moduleToMock);
      const returns = returnOverrides || {};
      functions.forEach((f) => {
        sandbox.stub(moduleToMock, f).callsFake(returns[f] || defaultMockValuesForMock[f]);
      });
    };
  }
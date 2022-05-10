import * as path from 'path';
import * as sinon from 'sinon';

/**
 * Helper function to mock class; uses sinon
 * @see https://spin.atomicobject.com/2018/06/13/mock-typescript-modules-sinon/
 * @param moduleToMock 
 * @param defaultMockValuesForMock 
 */
/* export function mockModule<T extends { [K: string]: any }>(moduleToMock: T, defaultMockValuesForMock: Partial<{ [K in keyof T]: T[K] }>) {
    return (sandbox: sinon.SinonSandbox, returnOverrides?: Partial<{ [K in keyof T]: T[K] }>): void => {
      const functions = Object.keys(moduleToMock);
      const returns = returnOverrides || {};
      functions.forEach((f) => {
        sandbox.stub(moduleToMock, f).callsFake(returns[f] || defaultMockValuesForMock[f]);
      });
    };
  }*/

/**
 * Normalizes a path from windows to unix line separators
 * @param p Path to make 
 */
export function normalizePath(p : string | string[]) {
    if (typeof p == 'string') {
        return p.replace(/[\\/]+/g, '/');
    }
    return p.map(normalizePath);
}

/**
 * Mock dependency using an ES6 Proxy
 */
export function mockDep<T extends { new(): I }, I extends Object>(ctor?: T) : I;
export function mockDep<T extends { new(...args: any[]): I }, I extends Object>(ctor?: T) : I;
export function mockDep<I extends Object>() : I;
export function mockDep<I>() : I {
    return new Proxy({}, {
        get: (target, prop) => {
            console.debug(`mockDep->get(${String(prop)})`);
            return mockDep();
        },
        set: (target, prop, value) => {
            console.debug(`mockDep->set(${String(prop)}) = ${value}`);
            return true;
        },
        apply: (target, thisArg, argumentsList) => {
            console.debug(`mockDep->apply(${String(argumentsList)})`);
            return mockDep();
        }
    }) as any;
}
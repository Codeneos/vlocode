/**
 * This file houses all generic Utility types or type utilities for type script that are not
 * part of the standard TS lib
 */

export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export type AwaitReturnType<T extends (...args: any) => any> = Await<ReturnType<T>>;

export type PropertyKey = string | number | symbol;
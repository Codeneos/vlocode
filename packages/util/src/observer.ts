import { Event, Disposable } from 'vscode';
import { optionalRequire } from 'optional-require';

import type * as vscodeModule from 'vscode';
const vscode: typeof vscodeModule = optionalRequire('vscode');

export interface PropertyChangedEventArgs {
    property: symbol | string | number;
    newValue?: any;
    oldValue?: any;
}

export type Observable<T extends Object> = T & { onPropertyChanged: Event<PropertyChangedEventArgs> } & Disposable;

export interface ArrayChangedEventArgs<T> {
    type: 'add' | 'remove' | 'replace';
    index: number;
    newValues?: T[];
    oldValues?: T[];
}

export type ObservableArray<T> = Array<T> & { onArrayChanged: Event<ArrayChangedEventArgs<T>> } & Disposable;

/**
 * Creates an observer that watches all properties in the target objects, when ever a change is detected it fires the change event triggers
 * @param obj
 */
export function observeObject<T extends Object>(obj: T) : Observable<T> {
    const eventEmitter = new vscode.EventEmitter<PropertyChangedEventArgs>();
    return new Proxy(obj, {
        get(target, property) {
            if (property === 'onPropertyChanged') {
                return eventEmitter.event;
            } else if (property === 'dispose') {
                return function () {
                    eventEmitter.dispose();
                    if (target[property]) {
                        target[property]();
                    }
                };
            }
            const value = target[property];

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                const observable = observeObject(value);
                observable.onPropertyChanged(data => eventEmitter.fire(data));
                return observable;
            }

            return value;
        },
        set(target, property, newValue) {
            if (property === 'onPropertyChanged') {
                return false;
            }
            const oldValue = target[property];
            target[property] = newValue;
            eventEmitter.fire({ property, oldValue, newValue });
            return true;
        }
    }) as Observable<T>;
}

/**
 * Creates an observer that watches psuh, pop, shift and unshift opperations on the target array, when ever a change is detected it fires the change event triggers
 * @param obj
 */
export function observeArray<T>(obj: T[]) : ObservableArray<T> {
    const eventEmitter = new vscode.EventEmitter<ArrayChangedEventArgs<T>>();
    return new Proxy(obj, {
        get(target, property) {
            if (property === 'onArrayChanged') {
                return eventEmitter.event;
            } else if (property === 'dispose') {
                return eventEmitter.dispose.bind(eventEmitter);
            }
            const value = target[property];

            if (typeof value === 'function') {
                if (property == 'push') {
                    return function () {
                        const currentLength = target.length;
                        const result = Array.prototype[property].apply(target, arguments);
                        eventEmitter.fire({ type: 'add',  index: currentLength, newValues: Array.from(arguments) });
                        return result;
                    };
                } else if (property == 'unshift') {
                    return function () {
                        const result = Array.prototype[property].apply(target, arguments);
                        eventEmitter.fire({ type: 'add',  index: 0, newValues: Array.from(arguments) });
                        return result;
                    };
                } else if (property == 'pop') {
                    return function () {
                        const result = Array.prototype[property].apply(target, arguments);
                        eventEmitter.fire({ type: 'remove', index: target.length, oldValues: [ result ] });
                        return result;
                    };
                } else if (property == 'shift') {
                    return function () {
                        const result = Array.prototype[property].apply(target, arguments);
                        eventEmitter.fire({ type: 'remove', index: 0, oldValues: [ result ] });
                        return result;
                    };
                }
            }

            return value;
        },
        set(target, property, newValue) {
            if (property === 'onPropertyChanged') {
                return false;
            }
            const oldValue = target[property];
            target[property] = newValue;
            if (typeof property === 'number') {
                eventEmitter.fire({ type: 'replace', index: property, oldValues: [ oldValue ], newValues: [ newValue ] });
            }
            return true;
        }
    }) as ObservableArray<T>;
}
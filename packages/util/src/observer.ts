import { EventEmitter, Event } from "./events";

export interface PropertyChangedEventArgs {
    property: symbol | string | number;
    newValue?: any;
    oldValue?: any;
}

export type Observable<T extends object> = T & { onPropertyChanged: Event<PropertyChangedEventArgs>; dispose?: () => void };

export interface ArrayChangedEventArgs<T> {
    type: 'add' | 'remove' | 'replace';
    index: number;
    newValues?: T[];
    oldValues?: T[];
}

export type ObservableArray<T> = Array<T> & { onArrayChanged: Event<ArrayChangedEventArgs<T>>; dispose?: () => void };

/**
 * Creates an observer that watches all properties in the target objects, when ever a change is detected it fires the change event triggers
 * @param obj
 */
export function observeObject<T extends object>(obj: T) : Observable<T> {
    const eventEmitter = new EventEmitter<PropertyChangedEventArgs>();
    return new Proxy(obj, {
        get(target, property) {
            if (property === 'onPropertyChanged') {
                return eventEmitter.event;
            } else if (property === 'dispose') {
                return function () {
                    eventEmitter.dispose();
                    if (typeof target['dispose'] === 'function') {
                        target['dispose']();
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
    const eventEmitter = new EventEmitter<ArrayChangedEventArgs<T>>();

    const decoratedArrayFunctions = {
        push: function(...args: T[]) {
            const currentLength = obj.length;
            const result = Array.prototype['push'].apply(obj, args);
            eventEmitter.fire({ type: 'add',  index: currentLength, newValues: args });
            return result;
        },
        unshift: function(...args: T[]) {
            const result = Array.prototype['unshift'].apply(obj, args);
            eventEmitter.fire({ type: 'add',  index: 0, newValues: args });
            return result;
        },
        pop: function() {
            const result = Array.prototype['pop'].apply(obj);
            eventEmitter.fire({ type: 'remove', index: obj.length, oldValues: [ result ] });
            return result;
        },
        shift: function() {
            const result = Array.prototype['shift'].apply(obj);
            eventEmitter.fire({ type: 'remove', index: 0, oldValues: [ result ] });
            return result;
        }   
    }  

    return new Proxy(obj, {
        get(target, property) {
            if (property === 'onArrayChanged') {
                return eventEmitter.event;
            } else if (property === 'dispose') {
                return function () {
                    eventEmitter.dispose();
                    if (typeof (target as any).dispose === 'function') {
                        (target as any).dispose();
                    }
                };
            } else if (typeof decoratedArrayFunctions[property] === 'function' ) {
                return decoratedArrayFunctions[property];
            }
            return target[property];
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
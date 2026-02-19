export type WrapperType<T, W extends T = T> = new (inner: T) => W;

function wrapValue<T, W extends T>(value: T, wrapperType: WrapperType<T, W>): T {
    if (value === undefined || value === null || value instanceof wrapperType) {
        return value;
    }
    return new wrapperType(value);
}

/**
 * Wraps a property value in a wrapper type.
 *
 * Works standalone (without DI) by wrapping assigned values.
 * When composed with other property decorators that define accessors, place `@wrap(...)` above them
 * so it runs last and can wrap the resolved getter value.
 */
export function wrap<T, W extends T>(wrapperType: WrapperType<T, W>): PropertyDecorator {
    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor => {
        const valueKey = Symbol(`__wrap_value_${String(propertyKey)}`);
        const cacheKey = Symbol(`__wrap_cache_${String(propertyKey)}`);

        if (descriptor?.get || descriptor?.set) {
            return {
                configurable: descriptor.configurable ?? true,
                enumerable: descriptor.enumerable ?? true,
                get(this: any) {
                    const value = descriptor.get ? descriptor.get.call(this) : this[valueKey];
                    const wrapped = wrapValue(value, wrapperType);

                    if (wrapped !== value) {
                        const cache = this[cacheKey];
                        if (cache?.raw === value) {
                            return cache.wrapped;
                        }
                        this[cacheKey] = { raw: value, wrapped };
                    }

                    return wrapped;
                },
                set(this: any, value: T) {
                    const wrapped = wrapValue(value, wrapperType);
                    this[cacheKey] = undefined;

                    if (descriptor.set) {
                        descriptor.set.call(this, wrapped);
                        return;
                    }
                    this[valueKey] = wrapped;
                }
            };
        }

        return {
            configurable: true,
            enumerable: true,
            get(this: any) {
                return this[valueKey];
            },
            set(this: any, value: T) {
                this[valueKey] = wrapValue(value, wrapperType);
            }
        };
    };
}

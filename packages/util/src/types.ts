export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ValueType<Type> =
    Type extends readonly (infer ElementType)[] ? ElementType
    : Type extends Set<(infer SetType)> ? SetType
    : Type extends Map<unknown, (infer MapType)> ? MapType
    : Type;

export type PropertyAccessor = string | number | symbol;

export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export type AwaitReturnType<T extends (...args: any) => any> = Await<ReturnType<T>>;
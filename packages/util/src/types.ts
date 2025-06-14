export type ArrayElement<ArrayType> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ValueType<Type> =
    Type extends readonly (infer ElementType)[] ? ElementType
    : Type extends Set<(infer SetType)> ? SetType
    : Type extends Map<unknown, (infer MapType)> ? MapType
    : Type;

export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export type AwaitReturnType<T extends (...args: any) => any> = Await<ReturnType<T>>;

type ExtractPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T];

/**
 * Extracts all properties from a type that are not functions
 */
export type ExtractProperties<T> = Pick<T, ExtractPropertyNames<T>>;

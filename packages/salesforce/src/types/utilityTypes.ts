export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type PropertyAccessor = string | number | symbol;

export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export type AwaitReturnType<T extends (...args: any) => any> = Await<ReturnType<T>>;
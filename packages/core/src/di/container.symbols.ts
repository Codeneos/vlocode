export const IsDecorated = Symbol('Injectable');
export const TypeIdentity = Symbol('InjectableIdentity');
export const OriginalCtor = Symbol('InjectableOriginalCtor');
export const DecoratedCtor = Symbol('InjectableDecoratedCtor');

/**
 * Symbol used to store the container instance on the container that 
 * is used to resolve the container instance. 
 */
export const Container = Symbol('Container');

/**
 * Symbol used to store the service GUID on the container.
 */
export const ServiceGuid = Symbol('Container:ServiceGuid');

/**
 * Symbol used to mark the root container
 */
export const ContainerRoot = Symbol('Container:IsRoot');
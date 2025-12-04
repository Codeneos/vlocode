/**
 * @packageDocumentation
 * @module @vlocode/core
 * Vlocode's core module contains core functionality such as the IoC container framework, log manager and FS abstraction layer.
 */
export * from './di/container';
export * from './di/injectable.decorator';
export * from './di/inject.decorator';
export * from './fs';
export * from './logging';
export * from './logging/writers';
export * from './deferredWorkQueue';
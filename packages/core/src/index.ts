/**
 * @packageDocumentation
 * @module @vlocode/core
 * @description Vlocode's core module contains core functionality such as the IoC container framework, log manager and FS abstraction layer. 
 */
export * from './container';
export * from './inject';
export * from './fs';
export * from './logging';
export * from './logging/writers';
export * from './deferredWorkQueue';
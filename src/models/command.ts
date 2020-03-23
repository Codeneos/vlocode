/**
 * Defines an executable command that
 */
export interface Command {
    execute(... args: any[]): void | Promise<void>;
    validate?(... args: any[]): void | Promise<void>;
}
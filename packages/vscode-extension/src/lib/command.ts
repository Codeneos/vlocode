/**
 * Defines an executable command that
 */
export interface Command {
    execute(... args: any[]): any | Promise<any>;
    validate?(... args: any[]): any | Promise<any>;
    initialize?(): any | Promise<any>;
}
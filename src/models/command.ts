/**
 * Defines an execurable command that
 */
export interface Command {
    name: string;
    execute(... args: any[]): void;
}

/**
 * Describes a hash-map of commands index by command name
 */
export interface CommandMap {
    [commandName: string] : Command;
}

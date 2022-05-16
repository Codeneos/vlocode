import { Argument, Option, Command as Program } from 'commander';
export { Argument, Option } from 'commander';

export abstract class Command {    
    public static args: Argument[] = [];
    public static options: Option[] = []
    public static description: String;
    public static command: String;

    protected options!: {};
    protected args!: [];

    abstract run(...args: any[]) : void | Promise<void>;
}
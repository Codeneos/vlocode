import { Logger } from '@vlocode/core';
import { Argument, Option } from 'commander';
export { Argument, Option } from 'commander';

export abstract class Command {    
    public static args: Argument[] = [];
    public static options: Option[] = []
    public static description: string;
    public static command: string;

    protected options!: any;
    protected args!: any;

    abstract run(...args: any[]) : void | Promise<void>;
}
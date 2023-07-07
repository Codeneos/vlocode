import * as vscode from 'vscode';

import { Logger, LogManager } from '@vlocode/core';
import { Command } from '../lib/command';
import { CommandOptions } from './commandRouter';

export class CommandExecutor implements Command {

    constructor(
        public readonly name: string,
        public readonly command: Command,        
        public readonly options?: CommandOptions,
        public readonly logger: Logger = LogManager.get(CommandExecutor)
    ) { }

    public async execute(...args: any[]): Promise<void> {
        this.logger.verbose(`Running command ${this.name}`);

        try {
            if (this.options?.executeParams) {
                args = [...this.options?.executeParams, ...args];
            }
            if (this.options?.focusLog) {
                this.logger.focus();
            }
            if (typeof this.command.validate === 'function') {
                await this.command.validate(...args);
            }
            await this.command.execute(...args);
            this.logger.verbose(`Execution of command ${this.name} done`);
        } catch (err) {
            console.error(err);
            this.logger.error(`${this.name}:`, err);
            this.logger.focus();
            void vscode.window.showErrorMessage(err.message || err);
        }
    }

    public validate(...args: any[]): Promise<void> | void {
        if (this.options?.executeParams) {
            args = [...this.options?.executeParams, ...args];
        }
        return this.command.validate?.(...args);
    }

    public initialize(): Promise<void> | void {
        return this.command.initialize?.();
    }
}

import * as vscode from 'vscode';

import { Container, container, Logger, LogManager } from '@vlocode/core';
import { Command } from '../lib/command';
import { CommandOptions } from './commandRouter';
import { SalesforceService } from '@vlocode/salesforce';

export class CommandExecutor implements Command {

    constructor(
        public readonly name: string,
        public readonly command: Command,
        public readonly options?: CommandOptions,
        public readonly logger: Logger = LogManager.get(CommandExecutor)
    ) { }

    public get salesforce() {
       return container.get(SalesforceService)
    }

    public async execute(...args: any[]): Promise<void> {
        this.logger.verbose(`Running command ${this.name}`);

        // Prevent prod deployment if not intended
        if (this.options?.showProductionWarning && await this.salesforce.isProductionOrg()) {
            if (!await this.showProductionWarning()) {
                this.logger.warn('Operation cancelled due to production warning');
                void vscode.window.showErrorMessage('Operation cancelled due to production warning');
                return
            } else {
                this.logger.info('Product org execution confirmed through user prompt');
            }
        }

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

    /**
     * Show a warning message about making changes to a production org allowing
     * the user to cancel the operation in case it was unintended.
     *
     * By default this method will throw an exception if the user cancels the operation, use overload with the `throwException` parameter to change this behavior.
     */
    protected async showProductionWarning() : Promise<never | boolean> {
        const productionWarning = await vscode.window.showWarningMessage(
            'Make changes to production org?',
            {
                detail: 'You are about to make changes to the currently selected production org. It is not recommended to direcly make changes to a production org from vscode, doing so may cause instability for end-users. Are you sure you want to continue?',
                modal: true,
            }, 'Yes', 'No'
        );
        return productionWarning === 'Yes';
    }
}

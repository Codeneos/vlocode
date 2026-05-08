import 'jest';

import * as vscode from 'vscode';

import { CommandBase } from '../commandBase';

class UnnamedOutputCommand extends CommandBase {
    public execute() {
        return undefined;
    }

    public writeOutput() {
        this.output.appendLine('message');
    }
}

class NamedOutputCommand extends CommandBase {
    protected outputChannelName = 'Command Base Test Output';

    public execute() {
        return undefined;
    }

    public writeOutput() {
        this.output.appendLine('message');
    }
}

describe('CommandBase', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('requires command output to use a named output channel', () => {
        expect(() => new UnnamedOutputCommand().writeOutput()).toThrow(
            'UnnamedOutputCommand uses command output without a named output channel'
        );
        expect(vscode.window.createOutputChannel).not.toHaveBeenCalled();
    });

    it('creates the configured named output channel', () => {
        new NamedOutputCommand().writeOutput();

        expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Command Base Test Output', undefined);
    });
});

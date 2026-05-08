import 'jest';

import * as vscode from 'vscode';
import { DateTime } from 'luxon';
import { LogLevel } from '../logging';
import { OutputChannelWriter } from '../logging/writers/outputChannelWriter';

jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn()
    }
}), { virtual: true });

const createOutputChannel = vscode.window.createOutputChannel as jest.Mock;

describe('OutputChannelWriter', () => {
    const time = new Date('2026-05-07T10:20:30.456Z');
    const timestamp = DateTime.fromJSDate(time).toFormat('yyyy-MM-dd HH:mm:ss.SSS');
    let appendLine: jest.Mock;

    beforeEach(() => {
        appendLine = jest.fn();
        createOutputChannel.mockReset();
        createOutputChannel.mockReturnValue({
            appendLine,
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        });
    });

    it('creates output channels with the configured language id', () => {
        const writer = new OutputChannelWriter('Vlocode', { languageId: 'vlocode-log' });

        writer.write({ level: LogLevel.info, time, category: 'core', message: 'started' });

        expect(createOutputChannel).toHaveBeenCalledWith('Vlocode', 'vlocode-log');
    });

    it.each([
        [LogLevel.debug, 'dbg'],
        [LogLevel.verbose, 'vrb'],
        [LogLevel.info, 'log'],
        [LogLevel.warn, 'wrn'],
        [LogLevel.error, 'err'],
        [LogLevel.fatal, 'ftl'],
    ])('formats %s severity as %s', (level, severity) => {
        const writer = new OutputChannelWriter('Vlocode', { componentWidth: 8 });

        writer.write({ level, time, category: 'core', message: 'message' });

        expect(appendLine).toHaveBeenCalledWith(`${timestamp} |     core | ${severity} | message`);
    });

    it('left-pads components so messages stay in a fixed column', () => {
        const writer = new OutputChannelWriter('Vlocode', { componentWidth: 12 });

        writer.write({ level: LogLevel.info, time, category: 'vlocode', message: 'ready' });

        expect(appendLine).toHaveBeenCalledWith(`${timestamp} |      vlocode | log | ready`);
    });

    it('shortens long components in the middle without changing the message column', () => {
        const writer = new OutputChannelWriter('Vlocode', { componentWidth: 12 });

        writer.write({ level: LogLevel.warn, time, category: 'VeryLongComponentName', message: 'truncated' });

        expect(appendLine).toHaveBeenCalledWith(`${timestamp} | VeryL...Name | wrn | truncated`);
    });

    it('uses a 26 character component column by default', () => {
        const writer = new OutputChannelWriter('Vlocode');

        writer.write({ level: LogLevel.info, time, category: 'VlocodeService', message: 'ready' });

        expect(appendLine).toHaveBeenCalledWith(`${timestamp} | ${'VlocodeService'.padStart(OutputChannelWriter.COMPONENT_WIDTH)} | log | ready`);
    });

    it('writes each line of a multi-line message with the same prefix', () => {
        const writer = new OutputChannelWriter('Vlocode', { componentWidth: 8 });

        writer.write({ level: LogLevel.error, time, category: 'deploy', message: 'line 1\r\nline 2\nline 3' });

        expect(appendLine.mock.calls).toEqual([
            [`${timestamp} |   deploy | err | line 1`],
            [`${timestamp} |   deploy | err | line 2`],
            [`${timestamp} |   deploy | err | line 3`]
        ]);
    });
});

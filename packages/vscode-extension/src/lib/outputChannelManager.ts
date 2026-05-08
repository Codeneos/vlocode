import * as vscode from 'vscode';

/**
 * Manages the creation and retrieval of output channels in VS Code.
 */
export class OutputChannelManager {
    private static outputChannels: Map<string, vscode.OutputChannel> = new Map();

    /**
     * Retrieves an output channel with the specified name. If the output channel does not exist,
     * it creates a new one and adds it to the collection of output channels.
     * @param name The name of the output channel.
     * @returns The output channel with the specified name.
     */
    public static get(name: string, languageId?: string) : vscode.OutputChannel {
        let outputChannel = this.outputChannels.get(name);
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel(name, languageId);
            this.outputChannels.set(name, outputChannel);
        }
        return outputChannel;
    }
}

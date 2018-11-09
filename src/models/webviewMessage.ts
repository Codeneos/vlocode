/**
 * Describes the message structure used for extening data between a webview and the extension.
 */
export default interface WebviewMessage {
    command: string;
    data?: any;
}
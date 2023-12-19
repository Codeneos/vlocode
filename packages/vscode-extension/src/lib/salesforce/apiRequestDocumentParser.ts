import * as vscode from 'vscode';
import { HttpMethod, HttpRequestInfo } from '@vlocode/salesforce';

/**
 * Parser for SF HTTP request documents
 */
export class ApiRequestDocumentParser {

    private readonly documentHeaderRegex = /^(GET|POST|PUT|DELETE|PATCH) (.*)$/i;
    private readonly documentHttpHeaderRegex = /^([a-z0-9-]+): (.*)$/i;

    private readonly document: vscode.TextDocument;
    private nextLine: number = 0;

    private url: string;
    private body: string;
    private method: HttpMethod;
    private headers: Record<string, string> = {};

    /**
     * Parse a HTTP request document into a HttpRequestInfo object.
     * Will throw an error if the document is not a valid HTTP request document.
     * @param document VSCode document to parse
     * @returns Parsed HttpRequestInfo object
     */
    public static async parse(document: vscode.TextDocument) {
        const parser = new ApiRequestDocumentParser(document);
        await parser.parseRequestMethodAndUrl();
        await parser.parseHeaders();
        await parser.parseBody();
        return parser.toRequestInfo();
    }

    private constructor(document: vscode.TextDocument) {
        this.document = document;
    }

    private toRequestInfo() : HttpRequestInfo {
        return {
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body
        };
    }

    private hasMoreLines() {
        return this.nextLine < this.document.lineCount;
    }

    private getNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error('No more lines to read, reached end of document');
        }
        return this.document.lineAt(this.nextLine++);
    }

    private async parseRequestMethodAndUrl() {
        while(this.hasMoreLines()) {
            const line = this.getNextLine();
            const match = line.text.match(this.documentHeaderRegex);

            if (match) {
                this.url = match[2];
                this.method = match[1] as HttpMethod;
                break;
            } else if (line.text) {
                throw new Error(`Expected document to start with HTTP method and URL, got ${line.text} at line ${line.lineNumber}`);
            }
        }
    }

    private async parseHeaders() {
        while(this.hasMoreLines()) {
            const line = this.getNextLine();
            const match = line.text.match(this.documentHttpHeaderRegex);

            if (match) {
                this.headers[match[1].trim()] = match[2].trim();
            } else if (!line.text) {
                this.nextLine--;
                break;
            } else {
                break;
            }
        }
    }

    private async parseBody() {
        this.body = this.document.getText(new vscode.Range(this.nextLine, 0, this.document.lineCount, 0));
    }
}
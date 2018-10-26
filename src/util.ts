'use strict';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ExecpResult {
    stdout: Buffer;
    stderr: Buffer;
    err: Error;
}

/**
 * Start child process and capture output; returns a promise that is resolved once the child process exits
 * @param {String} cmd 
 * @param {child_process::ExecOptions} opts 
 */
export async function execp(cmd: string, opts : any) : Promise<ExecpResult> {
    opts || (opts = {});
    return new Promise<ExecpResult>((resolve, reject) => {
        const child = exec(cmd, opts,
            (err, stdout, stderr) => resolve({
                stdout: stdout,
                stderr: stderr,
                err: err
            }));

        if (opts.stdout) {
            child.stdout.pipe(opts.stdout);
        }
        if (opts.stderr) {
            child.stderr.pipe(opts.stderr);
        }
    });
} 

/**
 * 
 * @param srcDir Source directory to execute the SFDX comand on
 */
export async function getSfdxOrgDetails(srcDir: string) : Promise<any> {
    const sfdxDisplayOrgCmd = 'sfdx force:org:display --json';
    console.log('Requesting auth token from SFDX...');
    try {
        let sfdxProc = await execp(sfdxDisplayOrgCmd, { cwd: srcDir });
        let parsed = JSON.parse(sfdxProc.stdout.toString());
        if(parsed.status == 0 && parsed.result) {
            return parsed.result;
        }
        throw parsed.status + ': unabled to retrieve SFDX org deplays';
    } catch (err) {
        console.log('Unabled to retrieve SFDX: ' + err);
        process.exit(0);
    }
}

export function readFileAsync(file: vscode.Uri) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(file.fsPath, (err, data) => {
            if(err) reject(err);
            else resolve(data.toString());
        })
    });
}

export async function requireHtml(filepath: string) {
    return await readFileAsync(vscode.Uri.file(path.join(__dirname, filepath)));
}
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

export async function getDocumentBodyAsString(file: vscode.Uri) : Promise<string> {
    let doc = vscode.workspace.textDocuments.find(doc => doc.fileName == file.fsPath);
    if (doc) return doc.getText();
    return await readFileAsync(file);
}

export function promisify<T1, T2, T3>(func: (arg1: T2, arg2: T2, cb: (err: any, result: T1) => void) => void, thisArg?: any) : (arg1: T2, arg2: T2) => Promise<T1>;
export function promisify<T1, T2>(func: (arg1: T2, cb: (err: any, result: T1) => void) => void, thisArg?: any) : (arg1: T2) => Promise<T1>;
export function promisify<T1>(func: (...args: any[]) => void, thisArg: any = null) : (...args: any[]) => Promise<T1> {
    return (...args: any[]) : Promise<T1> => {
        return new Promise<T1>((resolve, reject) => { 
            var callbackFunc = (err, ...args: any[]) => {
                if(err) reject(err);
                else resolve.apply(null, args);
            };
            func.apply(thisArg, args.concat(callbackFunc));
        });
    };
}

var _readFileAsync = promisify(fs.readFile);
export function readFileAsync(file: vscode.Uri) : Promise<string> {
    return _readFileAsync(file.fsPath).then(buffer => buffer.toString());
}

var _fstatAsync = promisify(fs.stat);
export function fstatAsync(file: vscode.Uri) : Promise<fs.Stats> {
    return promisify(fs.stat)(file.fsPath);
}

var _readdirAsync = promisify(fs.readdir);
export function readdirAsync(path: string) : Promise<string[]> {
    return promisify(fs.readdir)(path);
}

export function unique<T>(arr: T[], uniqueKeyFunc: (T) => any) : T[] {
    let unqiueSet = new Set();
    return arr.filter(item => {
        let k = uniqueKeyFunc(item);
        return unqiueSet.has(k) ? false : unqiueSet.add(k);
    });
}
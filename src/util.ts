import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as expressions from "angular-expressions";

export async function getDocumentBodyAsString(file: string) : Promise<string> {
    const doc = vscode.workspace.textDocuments.find(doc => doc.fileName == file);
    if (doc) { return doc.getText(); }
    return (await vscode.workspace.fs.readFile(vscode.Uri.file(file))).toString();
}

export function existsAsync(path: fs.PathLike) : Promise<boolean> {
    return new Promise(resolve => {
        // tslint:disable-next-line: deprecation
        fs.exists(path, result => resolve(result));
    });
}

export function unique<T>(arr: T[], uniqueKeyFunc: (T) => any) : T[] {
    const uniqueSet = new Set();
    return arr.filter(item => {
        const k = uniqueKeyFunc(item);
        return uniqueSet.has(k) ? false : uniqueSet.add(k);
    });
}

/**
 * Removes any double or trailing slashes from the path
 * @param pathStr path string
 */
export function sanitizePath(pathStr: string) {
    if (!pathStr) {
        return pathStr;
    }
    pathStr = pathStr.replace(/^[\/\\]*(.*?)[\/\\]*$/g, '$1');
    pathStr = pathStr.replace(/[\/\\]+/g,path.sep);
    return pathStr;
}

export interface StackFrame {
    functionName: string;
    modulePath: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
}

/**
 * Gets a single stack frame from the current call stack.
 * @param stackFrame The frame number to get
 * @returns A stack frame object that describes the request stack frame or undefined when the stack frame does not exist
 */
export function getStackFrameDetails(frameNumber: number) : StackFrame | undefined {
    const stackLineCaller = new Error().stack.split('\n');
    if(stackLineCaller.length < frameNumber + 4) {
        return;
    }
    // frameNumber +2 as we want to exlcude our self and the first line of the split which is not stackframe
    const stackFrameString = stackLineCaller.slice(frameNumber+2, frameNumber+3)[0];
    const [,,callerName,path,basename,line,column] = stackFrameString.match(stackLineRegex);
    return {
        functionName: callerName,
        modulePath: path,
        fileName: basename,
        lineNumber: Number.parseInt(line),
        columnNumber: Number.parseInt(column)
    };
}
const stackLineRegex = /at\s*(module\.|exports\.|object\.)*(.*?)\s*\((.*?([^:\\/]+)):([0-9]+):([0-9]+)\)$/i;

/**
 * Loop over all own properties in an object.
 * @param obj Object who's properties to loop over.
 * @param cb for-each function called for each property of the object
 */
export function forEachProperty<T>(obj: T, cb: (key: string, value: any, obj: T) => void) : void {
    Object.keys(obj).forEach(key => {
        cb(key, obj[key], obj);
    });
}

export function getProperties(obj: any) : { readonly key: string, readonly value: any }[] {
    return Object.keys(obj).map(key => { 
        return Object.defineProperties({},{
            key: { value: key, },
            value: { get: () => obj[key] }
        });
    });
}

/**
 * Execute callback async in sequence on each of the items in the specified array
 * @param array Array to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsync<T>(array: T[], callback: (item: T, index?: number, array?: T[]) => Thenable<any>) : Promise<T[]> {
    let foreachPromise = Promise.resolve();
    for (let i = 0; i < array.length; i++) {
        foreachPromise = foreachPromise.then(_r => callback(array[i], i, array));
    }
    return foreachPromise.then(_r => array);
}

/**
 * Execute callback async in parallel on each of the items in the specified array
 * @param array Array to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsyncParallel<T>(array: T[], callback: (item: T, index?: number, array?: T[]) => Thenable<any>) : Promise<T[]> {
    const tasks : Thenable<any>[] = [];
    for (let i = 0; i < array.length; i++) {
        tasks.push(callback(array[i], i, array));
    }
    return Promise.all(tasks).then(_r => array);
}

/**
 * Execute the map callback async in sequence on each of the items in the specified Iterable
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function mapAsync<T,R>(array: Iterable<T>, callback: (item: T) => Thenable<R>) : Promise<R[]> {
    let mapPromise = Promise.resolve(new Array<R>());
    for (const value of array) {
        mapPromise = mapPromise.then(async result => result.concat(await callback(value)));
    }
    return mapPromise;
}

/**
 * Iterable helper includes an index on the IterableIterator return value
 * @param iterable The iterable object
 * @yields {[number, T]}
 */
function* enumerateWithIndex<T>(iterable: Iterable<T>) : IterableIterator<[number, T]> {
    let i = 0;
    for (const x of iterable) {
        yield [i++, x];
    }
}

/**
 * Execute the map callback async in parallel on each of the items in the specified Iterable
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function mapAsyncParallel<T,R>(iterable: Iterable<T>, callback: (item: T) => Thenable<R>, parallelism = 2) : Promise<R[]> {
    const tasks : Thenable<R[]>[] = new Array(parallelism).fill(Promise.resolve(new Array<R>()));
    for (const [index, value] of enumerateWithIndex(iterable)) {
        tasks[index % parallelism] = tasks[index % parallelism].then(async result => result.concat(await callback(value)));
    }
    return Promise.all(tasks).then(results => results.flat());
}

/**
 * Execute the filter callback async in parallel on each of the items in the specified array
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export async function filterAsyncParallel<T>(array: Iterable<T>, callback: (item: T) => Thenable<boolean>, parallelism = 2) : Promise<T[]> {
    const result = [];
    await mapAsyncParallel(array, async item => !(await callback(item)) || result.push(item), parallelism);
    return result;
}

/**
 * Match all expressions in target string s 
 * @param s input string on which to run match
 * @param r return array of matches as RegExpMatchArray's
 */
export function matchAll(s: string, r: RegExp) : RegExpMatchArray[] {
    const regex = new RegExp(r);
    let matches: RegExpMatchArray[], match: RegExpMatchArray;
    while(match = regex.exec(s)) {
        (matches || (matches = [])).push(match);
    }
    return matches;
}

/**
 * Evaluates an angular expression on the specified scope.
 * @param expr Format string
 * @param contextValues context values supplied
 */
export function evalExpr(expr: string, contextValues: any) : string {
    return expressions.compile(expr)(contextValues);
}

/**
 * Format string using the specified context values; format: 'Bar ${foo}', with context values {foo: 'bar'} results in 'Bar bar'
 * @param stringFormat Format string
 * @param contextValues context values supplied
 */
export function formatString(stringFormat: string, contextValues: {}) : string {
    return stringFormat.replace(/\${(.+?(.*?))}/gm, match => {
        const key = /\${(.+?(.*?))}/g.exec(match)[1]; 
        return contextValues[key] === undefined ? match : contextValues[key];
    });
}

/**
 * Groups an array into key accessible groups of objects
 * @param array Array to group
 * @param predicate function to get the group by key
 */
export function groupBy<T>(array: T[], keySelector: (item: T) => string | undefined) : { [objectKey: string]: T[] } {
    return array.reduce(
        (arr, item) => {
            const key = keySelector(item);
            arr[key] = arr[key] || [];
            arr[key].push(item);
            return arr;
        }, {}
    );
}

/**
 * Compare 2 strings for equality.
 * @param a String a
 * @param b String b
 * @param insensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function stringEquals(a : string, b: string, insensitive?: boolean) : boolean {
    if (a === b) {
        return true;
    }
    if (a === null || a === undefined) {
        return false;
    }
    if (b === null || b === undefined) {
        return false;
    }
    if (insensitive) {
        return b.toLowerCase() == a.toLowerCase();
    }
    return false;
}

/**
 * Get all primitive non-object values in the specified object hiearchy up to the specified depth.
 * @param obj Object from which to get the values
 * @param depth Max object depth to go down the tree
 */
export function getObjectValues(obj: Object, depth = -1) : any[] {
    const properties = [];
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            if (depth != 0) {
                properties.push(...getObjectValues(obj[key], depth-1));
            }
        } else {
            properties.push(obj[key]);
        }
    });
    return properties;
}

/**
 * Wait for the specified number of seconds and the return.
 * @param ms Time in milliseconds to wait
 */
export async function wait(ms: number) : Promise<boolean> {
    return new Promise<boolean>(resolve => { setTimeout(() => resolve(true), ms); });
}

/**
 * Simpel check if the specified XML file starts with a valid XML header.
 * @param file Text file to check
 */
export async function hasXmlHeader(file: string) {
    const body = await getDocumentBodyAsString(file);
    if (body) { 
        const startsWithXmlHeader = body.trimStart().startsWith('<?xml ');
        return startsWithXmlHeader;
    }
    return false;
}

/**
 * Simple function that registers any instance of a class as single and creates it when it is not existing. Instances are stored as globals which is the closest we can get to a real singleton. *
 * @param indent The unique indemnifier under which this property can be accessed.
 * @param factory The factory method that creates the instance when it does not exist.
 */
export function asSingleton<T>(indent: string, factory: () => T) :T {
    const singletonGlobalKey = `$asSingleton.vlocode.${indent}`;
    if (!global[singletonGlobalKey]) {
        global[singletonGlobalKey] = factory();
    }
    return global[singletonGlobalKey];
}
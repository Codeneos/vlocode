
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
    const errorObj = new Error();
    const stackLineCaller = errorObj.stack?.split('\n');
    if(!stackLineCaller || stackLineCaller.length < frameNumber + 4) {
        return;
    }
    // frameNumber +2 as we want to exlcude our self and the first line of the split which is not stackframe
    const stackFrameString = stackLineCaller.slice(frameNumber+2, frameNumber+3)[0];
    const [,,callerName,path,basename,line,column] = stackFrameString.match(stackLineRegex) ?? [];
    return {
        functionName: callerName,
        modulePath: path,
        fileName: basename,
        lineNumber: Number.parseInt(line, 10),
        columnNumber: Number.parseInt(column, 10)
    };
}
const stackLineRegex = /at\s*(module\.|exports\.|object\.)*(.*?)\s*\((.*?([^:\\/]+)):([0-9]+):([0-9]+)\)$/i;
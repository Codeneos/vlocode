import * as vscode from 'vscode';
import * as s from '../singleton';
import * as l from '../loggers';

export default class CommandHelper  {

    public static showMsgWithRetry<T>(
        msgFunc : (msg : String, options: vscode.MessageOptions, ...args: vscode.MessageItem[]) => Thenable<T>, 
        errorMsg : string, 
        retryCallback: (...args) => Promise<T>, 
        thisArg?: any,
        args? : IArguments) : Thenable<T> {
        return msgFunc(errorMsg, { modal: false }, { title: 'Retry' })
                .then(value => {
                    if (value) {
                        if (args !== undefined) {
                            return retryCallback.apply(thisArg || null, Array.from(args));
                        } else {
                            return retryCallback();
                        }
                    }
                });
    }
    
    public static showErrorWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, args? : IArguments) : Thenable<T> {
        return CommandHelper.showMsgWithRetry<T>(vscode.window.showErrorMessage, errorMsg, retryCallback, thisArg, args);
    }
    
    public static showWarningWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, args? : IArguments) : Thenable<T> {
        return CommandHelper.showMsgWithRetry<T>(vscode.window.showWarningMessage, errorMsg, retryCallback, thisArg, args);
    }
}


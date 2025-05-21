export type ErrorOptions = Record<string, string | number | boolean | undefined> &{
    name?: string;
    code?: string;
    cause?: unknown;
}

/**
 * Custom error object that extends the default Error but has a more versatile constructor that allows setting additional
 * standard error fields such as name while also allowing setting of custom fields through the constructor making it easier to include
 * extra detail into the error
 */
export class CustomError extends Error {

    /**
     * Optional code of the error
     */
    public readonly code?: string;

    constructor(message: string, options?: ErrorOptions | Error) {
        super(message, { cause: options?.cause });
        if (options) {
            if (options['code'] && !options['name']) {
                options['name'] = options['code'];
            }
            Object.assign(this, options);
            if (options['stack']) {
                this.stack = `${this.stack}\n\n${options['stack']}`;
            }
        }
    }
}

/**
 * Validate that the specified object is a CustomError
 * @param error 
 * @returns 
 */
export function isCustomError(error: unknown): error is CustomError {
    return (error instanceof CustomError);
}
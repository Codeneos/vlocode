/**
 * Custom error object that extends the default Error but has a more versatile constructor that allows setting additional
 * standard error fields such as name while also allowing setting of custom fields through the constructor making it easier to include
 * extra detail into the error
 */
export class CustomError extends Error {
    constructor(message: string, options?: ({ name?: string, code?: string } & object) | Error) {
        super(message);
        if (options) {
            Object.assign(this, options);
        }
    }
}
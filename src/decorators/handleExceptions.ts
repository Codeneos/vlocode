/**
 * Wrap function in a try-catch block to handle all exceptions; return undefined when an exception occurs.
 * @param logExceptions Wether or not to log exceptions to the console.
 */
export default function handleExceptions(logExceptions: boolean = true) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function(...args : any[]) {
            try {
                return originalMethod.apply(this, args);
            } catch(err) {
                if (logExceptions) {
                    console.error(err);
                }
            }
        };
    };
}
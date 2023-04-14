import { injectable, LifecyclePolicy, Logger } from "@vlocode/core";
import { SalesforceConnectionProvider } from "@vlocode/salesforce";
import { removeUndefinedProperties } from "@vlocode/util";
import { VlocityNamespaceService } from "./vlocityNamespaceService";

/**
 * Class to invoke methods on APEX classes that implement a VlocityObjectInterface in Salesforce using the Salesforce REST API.
 */
@injectable({ lifecycle: LifecyclePolicy.singleton })
export class VlocityInterfaceInvoker {

    private readonly endPoint = '/services/apexrest/{vlocity_namespace}/v1/invoke';

    constructor(
        private readonly logger: Logger,
        private readonly namespaceProvider: VlocityNamespaceService,
        private readonly connectionProvider: SalesforceConnectionProvider) {
    }

    /**
     * Invoke a Vlocity interface method in Salesforce with the specified input and options.
     * If the method invocation results in an exception this method will throw an error.
     * @param methodSpec The method to invoke. Can be a string in the format 'class.method' or an object with className and methodName properties.
     * @param input Input to pass to the method
     * @param options Options to pass to the method
     * @returns The result of the method invocation
     * @example
     * // Invoke a method with a string
     * const result = await invoker.invoke('MyClass.myMethod', { input: 'value' });
     */
    public async invoke<T = any>(methodSpec: string | { className: string, methodName: string }, input?: object | undefined, options?: object | undefined): Promise<T> {
        const classMethod = typeof methodSpec === 'string' ? this.parseMethod(methodSpec) : methodSpec;
        const payload = removeUndefinedProperties({
            sClassName : classMethod.className,
            sMethodName : classMethod.methodName,
            input,
            options
        });

        const connection = await this.connectionProvider.getJsForceConnection();
        this.logger.verbose(`Invoking Vlocity Open Interface '${classMethod.className}.${classMethod.methodName}' with input:`, input);
        let result = await connection.request({
            method: 'POST',
            url: this.namespaceProvider.updateNamespace(this.endPoint),
            body: JSON.stringify(payload)
        });

        if (typeof result === 'string') {
            try {
                result = JSON.parse(result);
            } catch (err) {
                this.logger.warn(`Failed to parse result from '${classMethod.className}.${classMethod.methodName}' as JSON:`, result);
            }
        }

        if (typeof result === 'object' && (result['error'] || result['errorCode'])) {
            if (result['errorCode'] === 'INVOKECLASS-404') {
                throw new Error(`No such class or method '${classMethod.className}.${classMethod.methodName}' found in Salesforce`);
            } else if (result['errorCode'] !== 'INVOKE-200' || result['error'] !== 'OK') {
                throw new Error(`Error invoking '${classMethod.className}.${classMethod.methodName}' in Salesforce: ${result['error']}`);
            }
        }

        return result;
    }

    private parseMethod(methodSpec: string) {
       const [ className, methodName ] = methodSpec.split('.');
       return { className, methodName };
    }
}
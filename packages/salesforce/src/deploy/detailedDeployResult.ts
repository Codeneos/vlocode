import type { DeployResult } from 'jsforce';

export type DetailedDeployResult = DeployResult & {
    details?: {
        componentFailures: FailureDeployMessage[];
        componentSuccesses: DeployMessage[];
    };
};

export interface DeployMessage {
    /**
     * ID of the component being deployed.
     */
    id: string;
    /**
     * The metadata type of the component in this deployment. This field is available in API version 30.0 and later.
     */
    componentType: string;
    /**
     * The name of the file in the .zip file used to deploy this component.
     */
    fileName: string;
    /**
     * The full name of the component.
     * Inherited from Metadata, this field is defined in the WSDL for this metadata type. It must be specified when creating, updating, or deleting. See createMetadata() to see an example of this field specified for a call.
     */
    fullName: string;
    /**
     * Indicates whether the component was successfully deployed (true) or not (false).
     */
    success: boolean;
    /**
     * If true, the component was changed as a result of this deployment. If false, the deployed component was the same as the corresponding component already in the organization.
     */
    changed: boolean;
    /**
     * If true, the component was deleted as a result of this deployment. If false, the component was either new or modified as result of the deployment.
     */
    deleted: boolean;
    /**
     * If true, the component was created as a result of this deployment. If false, the component was either deleted or modified as a result of the deployment.
     */
    created: boolean;
}

export interface FailureDeployMessage extends DeployMessage {
    problem: string;
    problemType: 'Warning' | 'Error';
    columnNumber: string;
    lineNumber: string;
}

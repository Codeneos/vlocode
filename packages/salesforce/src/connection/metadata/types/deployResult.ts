import { RetrieveResult } from "./retrieveResult";

export type DeployStatus = 'Pending' |
    'InProgress' |
    'Succeeded' |
    'SucceededPartial' |
    'Failed' |
    'Canceling' |
    'Canceled';

/**
 * Contains information about the success or failure of the associated deploy() call.
 * 
 * The asynchronous metadata call checkDeployStatus() returns a DeployResult object.
 */
export interface DeployResult {
    id: string,
    done: boolean,
    success: boolean,
    retrieveResult: RetrieveResult,
    checkOnly: boolean,
    ignoreWarnings: boolean,
    rollbackOnError: boolean,
    status: DeployStatus,
    numberComponentsDeployed: number | null,
    numberComponentsTotal: number | null,
    numberComponentErrors: number | null,
    numberTestsCompleted: number | null,
    numberTestsTotal: number | null,
    numberTestErrors: number | null,
    details: DeployResultDetails | null,
    createdDate: string | null,
    startDate: string | null,
    lastModifiedDate: string | null,
    completedDate: string | null,
    errorStatusCode: string | null,
    errorMessage: string | null,
    stateDetail: string | null,
    createdBy: string | null,
    createdByName: string | null,
    canceledBy: string | null,
    canceledByName: string | null,
    runTestResult: string | null,
    runTestsEnabled: boolean
}

export interface DeployResultDetails {
    componentFailures: Array<FailureDeployMessage>;
    componentSuccesses: Array<DeployMessage>;
    allComponentMessages: Array<DeployMessage | FailureDeployMessage>;
    runTestResult: RunTestsResult
}

export interface RunTestsResult {
    /**
     * The ID of an ApexLog object that is created at the end of a test run. 
     * The ApexLog object is created if there is an active trace flag 
     * on the user running an Apex test, or on a class or trigger being executed.
     */
    apexLogId: string | null,
    /**
     * An array of one or more RunTestSuccess objects that contain 
     * information about successes, if there are any.
     */
    successes: Array<RunTestSuccess>,
    /**
     * An array of one or more RunTestFailure objects that contain 
     * information about the unit test failures, if there are any.
     */
    failures: Array<RunTestFailure>,
    /**
     * An array of one or more CodeCoverageResult objects that contains the 
     * details of the code coverage for the specified unit tests.
     */
    codeCoverage: Array<CodeCoverageResult>
    /**
     * An array of one or more code coverage warnings for the test run. 
     * The results include both the total number of lines that could have been executed, 
     * as well as the number, line, and column positions of code that was not executed.
     */
    codeCoverageWarnings: Array<CodeCoverageWarning>,
    flowCoverage: Array<any>,
    flowCoverageWarnings: Array<any>,
    numTestsRun: number,
    numFailures: number,
    totalTime: number,
}

export interface RunTestSuccess {
    id: string,
    message: string,
    methodName: string,
    name: string,
    seeAllData: boolean,
    time: number
}

export interface RunTestFailure extends RunTestSuccess {
    seeAllData: boolean,
}

export interface CodeCoverageWarning {
    id: string,
    message: string,
    methodName: string,
    name: string
}

/**
 * The RunTestsResult object contains this object. It contains information about whether or 
 * not the compile of the specified Apex and run of the unit tests was successful.
 */
export interface CodeCoverageResult {
    /**
     * For each class or trigger tested, for each portion of code tested, 
     * this property contains the DML statement locations, the number of times the code was executed, 
     * and the total cumulative time spent in these calls. 
     * This can be helpful for performance monitoring.
     */
    dmlInfo: Array<CodeLocation>,
    /**
     * For each class or trigger tested, the location of SOQL statements in the code, 
     * the number of times this code was executed, and the total cumulative time spent in these calls. 
     * This can be helpful for performance monitoring.
     */
    soqlInfo: Array<CodeLocation>,
    /**
     * For each class or trigger tested, if any code is not covered, 
     * the line and column of the code not tested, and the number 
     * of times the code was executed.
     */
    locationsNotCovered: Array<CodeLocation>,
    /**
     * For each class or trigger tested, the method invocation locations, 
     * the number of times the code was executed, and the total cumulative time spent in these calls. 
     * This can be helpful for performance monitoring.
     */
    methodInfo: Array<CodeLocation>,
    /**
     * The name of the class or trigger covered.
     */
    name: string,
    /**
     * The namespace that contained the unit tests, if one is specified.
     */
    namespace?: string,
    /**
     * The total number of code locations.
     */
    numLocations: number,
    /**
     * @deprecated Do not use. In early, unsupported releases, used to specify class or package.
     */
    type?: string,
}

export interface CodeLocation {    
    column: number,
    line: number,
    /**
     * The number of times the Apex was executed in the test run.
     */
    numExecutions: number,
    /**
     * The total cumulative time spent at this location. 
     * This can be helpful for performance monitoring.
     */
    time: number,
}

export interface DeployMessage {
    /**
     * ID of the component being deployed.
     */
    id: string | null;
    /**
     * The metadata type of the component in this deployment. 
     * This field is available in API version 30.0 and later.
     */
    componentType: string;
    /**
     * The name of the file in the .zip file used to deploy this component.
     */
    fileName: string;
    /**
     * The full name of the component.
     * Inherited from Metadata, this field is defined in the WSDL for this metadata type. 
     * It must be specified when creating, updating, or deleting. 
     * See createMetadata() to see an example of this field specified for a call.
     */
    fullName: string;
    /**
     * Indicates whether the component was successfully deployed (`true`) or not (`false`).
     */
    success: boolean;
    /**
     * If `true`, the component was changed as a result of this deployment. 
     * If `false`, the deployed component was the same as the corresponding component already in the organization.
     */
    changed: boolean;
    /**
     * If `true`, the component was deleted as a result of this deployment. 
     * If `false`, the component was either new or modified as result of the deployment.
     */
    deleted: boolean;
    /**
     * If `true`, the component was created as a result of this deployment. 
     * If `false`, the component was either deleted or modified as a result of the deployment.
     */
    created: boolean;
    requiresProductionTestRun: boolean;
    createdDate: string;
    knownPackagingProblem: boolean;
    forPackageManifestFile: boolean;
}

export interface FailureDeployMessage extends DeployMessage {
    /**
     * If an error or warning occurred, this field contains 
     * a description of the problem that caused the compile to fail.
     */
    problem: string;
    /**
     * Indicates the problem type. The problem details are tracked in the problem field.
     */
    problemType: 'Warning' | 'Error';
    /**
     * Each component is represented by a text file. If an error occurred during deployment, 
     * this field represents the column of the text file where the error occurred.
     */
    columnNumber: number | null;
    /**
     * Each component is represented by a text file. If an error occurred during deployment, 
     * this field represents the line number of the text file where the error occurred.
     */
    lineNumber: number | null;
}

export interface DeployOptions {
    checkOnly?: boolean;
    runTests?: string[];
    testLevel?: string;
    singlePackage?: boolean;
    allowMissingFiles?: boolean;    
    performRetrieve?: boolean;
    autoUpdatePackage?: boolean;
    rollbackOnError?: boolean;
    ignoreWarnings?: boolean;
    purgeOnDelete?: boolean;
    runAllTests?: boolean;
}

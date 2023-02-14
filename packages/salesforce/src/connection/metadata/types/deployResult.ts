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
    /**
     * Defaults to `false`. Set to true to perform a test deployment (validation) 
     * of components without saving the components in the target org. 
     * 
     * A validation enables you to verify the results of tests that would be 
     * generated in a deployment, but doesn’t commit any changes. 
     * After a validation finishes with passing tests, sometimes it 
     * can qualify for deployment without rerunning tests
     * 
     * @default false
     */
    checkOnly?: boolean;
    /**
     * A list of Apex tests to run during deployment. Specify the class name, one name per instance. 
     * The class name can also specify a namespace with a dot notation. 
     * 
     * __To use this option, set {@link testLevel} to `RunSpecifiedTests`.__
     */
    runTests?: string[];
    /**
     * Optional. Specifies which tests are run as part of a deployment. 
     * The test level is enforced regardless of the types of components 
     * that are present in the deployment package.
     * 
     * __If you don’t specify a test level, the default test execution behavior is used__
     * 
     * _Note: Apex tests that run as part of a deployment always run synchronously and serially._
     */
    testLevel?: 'NoTestRun' | 'RunSpecifiedTests' | 'RunLocalTests' | 'RunAllTestsInOrg';
    /**
     * Indicates whether the specified .zip file points to a directory 
     * structure with a single package (`true`) or a set of packages (`false`).
     */
    singlePackage?: boolean;
    /**
     * If files that are specified in `package.xml` are not in the .zip file, 
     * specifies whether a deployment can still succeed.
     * 
     * __Do not set this argument for deployment to production orgs.__
     */
    allowMissingFiles?: boolean;  
    /**
     * Indicates whether a `retrieve()` call is performed immediately after the deployment (`true`) or not (`false`). 
     * Set to `true` to retrieve whatever was just deployed.
     */  
    performRetrieve?: boolean;
    /**
     * If a file is in the .zip file but not specified in `package.xml`, 
     * specifies whether the file is automatically added to the package. 
     * 
     * A `retrieve()` is issued with the updated package.xml that includes the .zip file.
     */
    autoUpdatePackage?: boolean;
    /**
     * Indicates whether any failure causes a complete rollback (`true`) or not (`false`). 
     * If `false`, whatever actions can be performed without errors are performed, 
     * and errors are returned for the remaining actions. 
     * 
     * __This parameter must be set to true if you are deploying to a production org.__
     * 
     * @default false
     */
    rollbackOnError?: boolean;
    /**
     * Indicates whether deployments with warnings complete successfully (`true`) or not (`false`).
     * 
     * The DeployMessage object for a warning contains the following values:
     * - problemType—Warning
     * - problem—The text of the warning
     * 
     * If a warning occurs and ignoreWarnings is set to `true`, the success field in DeployMessage is `true`. 
     * 
     * If ignoreWarnings is set to false, success is set to false and the warning is treated like an error.
     * 
     * @default false
     */
    ignoreWarnings?: boolean;
    /**
     * If `true`, the deleted components in the `destructiveChanges.xml` manifest 
     * file aren't stored in the Recycle Bin. Instead, 
     * they become immediately eligible for deletion.
     * 
     * __This option only works in Developer Edition or sandbox orgs. It doesn’t work in production orgs.__
     */
    purgeOnDelete?: boolean;
    /**
     * @deprecated Only available in API version `33.0` and earlier.
     */
    runAllTests?: boolean;
}

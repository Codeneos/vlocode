import { Package } from "jsforce";
import { SalesforceMetadata } from "./metadataInfo";

export interface RetrieveRequest {
    apiVersion: string | number;
    /**
     * A list of package names to be retrieved. If you are retrieving only `unpackaged` components, 
     * do not specify a name here. You can retrieve `packaged` and `unpackaged` components in the same retrieve.
     */
    packageNames?: string[];
    /**
     * Specifies whether only a single package is being retrieved (`true`) or not (`false`). 
     * If `false`, then more than one package is being retrieved.
     */
    singlePackage?: boolean;
    /**
     * A list of file names to be retrieved. If a value is specified for this property, 
     * packageNames must be set to null and singlePackage must be set to true.
     */
    specificFiles?: string[];
    /**
     * A list of components to retrieve that are not in a package.
     */
    unpackaged?: RetrievePackage;
}

interface RetrievePackage {
    /**
     * Package components have access via dynamic Apex and the API to standard 
     * and custom objects in the organization where they are installed.
     * Administrators who install packages may wish to restrict this access 
     * after installation for improved security. The valid values are:      
     * - `Unrestricted` Package components have the same API access to standard objects as 
     *   the user who is logged in when the component sends a request to the API.
     * - `Restricted` The administrator can select which standard objects the components can access. 
     *   Further, the components in restricted packages can only access custom objects in the 
     *   current package if the user's permissions allow access to them.
     * 
     * For more information, see “About API and Dynamic Apex Access in Packages” in the Salesforce online help.
     */
    apiAccessLevel?: 'Unrestricted' | 'Restricted';
    /**
     * A short description of the package.
     */
    description?: string;
    /**
     * The package name used as a unique identifier for API access. 
     * The fullName can contain only underscores and alphanumeric characters. 
     * It must be unique, begin with a letter, not include spaces, 
     * not end with an underscore, and not contain two consecutive underscores. 
     * This field is inherited from the Metadata component.
     */
    fullName?: string;
    /**
     * The namespace of the developer organization where the package was created.
     */
    namespacePrefix?: string;
    /**
     * Indicates which objects are accessible to the package, 
     * and the kind of access available (`create`, `read`, `update`, `delete`).
     */
    objectPermissions?: ProfileObjectPermissions[];
    /**
     * The name of the Apex class that specifies the actions to execute after 
     * the package has been installed or upgraded. The Apex class must be a member 
     * of the package and must implement the Apex `InstallHandler` interface. 
     * 
     * In patch upgrades, you can't change the class name in this field but you 
     * can change the contents of the Apex class. 
     * 
     * The class name can be changed in major upgrades.
     */
    postInstallClass?: string;
    /**
     * The name of the Apex class that specifies the actions to execute after 
     * the package has been uninstalled or upgraded. The Apex class must be a member 
     * of the package and must implement the Apex `UninstallHandler ` interface. 
     * 
     * In patch upgrades, you can't change the class name in this field but you 
     * can change the contents of the Apex class. 
     * 
     * The class name can be changed in major upgrades.     */
    uninstallClass?: string | undefined;
    /**
     * The weblink used to describe package installation.
     */
    setupWeblink?: string;
    /**
     * The type of component being retrieved.
     */
    types: PackageTypeMembers[];
    /**
     * Required. The version of the component type.
     */
    version: string;
}

interface PackageTypeMembers {
    /**
     * One or more named components, or the wildcard character (`*`) to 
     * retrieve all metadata components of the type specified in the `<name>` element. 
     * To retrieve a standard object, specify it by name. For example, 
     * `<members>Account</members>` retrieves the standard Account object.
     */
    members: string[];
    /**
     * The type of metadata component to be retrieved. 
     * For example, `<name>CustomObject</name>` retrieves one or more 
     * custom objects as specified in the `<members>` element.
     */
    name: string;
}

interface ProfileObjectPermissions {
    /**
     * Required. The name of the object whose permissions are altered by this profile, for example, `MyCustomObject__c`.
     */
    object: string;
    allowCreate: boolean;
    allowDelete: boolean;
    allowEdit: boolean;
    allowRead: boolean;
    modifyAllRecords?: boolean;
    viewAllRecords?: boolean;
}
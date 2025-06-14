import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { SalesforceConnectionProvider } from './connection';
import { SalesforceProfile } from './salesforceProfile';
import { cache } from '@vlocode/util';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class SalesforceProfileService {
    constructor (
        private readonly salesforce: SalesforceConnectionProvider,
        private readonly logger: Logger
    ) {
    }

    @cache()
    /**
     * Retrieves the profile ID of the currently authenticated Salesforce user.
     * 
     * This method establishes a connection to Salesforce, fetches the identity
     * information of the current user, and queries the user's profile ID using
     * the Tooling API.
     * 
     * @returns A promise that resolves to the profile ID of the current user.
     * @throws Will throw an error if the connection or query fails.
     */
    public async currentUserProfileId() {
        const connection = await this.salesforce.getJsForceConnection();
        const id = await connection.identity();
        const user = await connection.sobject('User').findOne<{ ProfileId: string }>({ Id: id.user_id }, [ 'ProfileId' ]);
        return user!.ProfileId
    }

    /**
     * Retrieves the profile information of the currently authenticated Salesforce user.
     * 
     * @returns A promise that resolves to the `SalesforceProfile` object representing the current user's profile.
     */
    public async currentUserProfile(): Promise<SalesforceProfile> {
        return this.getProfile(await this.currentUserProfileId());
    }

    /**
     * Retrieves a list of profile developer names from Salesforce using the Tooling API.
     * 
     * @returns {Promise<string[]>} A promise that resolves to an array of profile developer names.
     * @throws Will throw an error if the connection to Salesforce fails or if the query encounters an issue.
     */
    public async listProfiles(): Promise<string[]> {
        const connection = await this.salesforce.getJsForceConnection();
        const profiles = await connection.metadata.list([ { type: 'Profile' } ]);
        return profiles.map(profile => profile.fullName);
    }

    /**
     * Adds record type visibility to a specified Salesforce profile.
     * 
     * This method ensures that a given record type is visible to a specified profile.
     * If the record type is identified by its ID, the method resolves its object type
     * and developer name to construct the full record type name.
     * 
     * @param recordTypeIdOrName - The ID or full name of the record type to add visibility for.
     *                             If an ID is provided, it must start with '012' and will be resolved
     *                             to its full name using the Salesforce Tooling API.
     * @param profile - An optional object containing the profile's ID or name. If not provided,
     *                  the method will use the default profile.
     *                  - `id` (optional): The ID of the profile.
     *                  - `name` (optional): The **developer** name of the profile.
     * 
     * @returns A promise that resolves when the record type visibility has been successfully added.
     * 
     * @throws {Error} If the record type ID is provided but cannot be resolved to a valid record type.
     */
    public async addRecordTypeVisibility(recordTypeIdOrName: string, profile?: { id?: string, name?: string }): Promise<void> {
        const connection = await this.salesforce.getJsForceConnection();
        if (recordTypeIdOrName.startsWith('012')) {
            const recordType = await connection.sobject('RecordType').findOne<{ 
                    SobjectType: string, 
                    DeveloperName: string,
                    NamespacePrefix?: string
                }>({ Id: recordTypeIdOrName }, [ 'SobjectType', 'DeveloperName', 'NamespacePrefix' ]);
            if (!recordType) {
                throw new Error(`RecordType with ID '${recordTypeIdOrName}' not found`);
            }
            recordTypeIdOrName = `${
                recordType.SobjectType}.${
                recordType.NamespacePrefix ? `${recordType.NamespacePrefix}__` : ''}${
                recordType.DeveloperName
            }`;
        }
       
        const userProfile = await this.getProfile(profile?.name || profile?.id);
        userProfile.setRecordTypeVisibility(recordTypeIdOrName, true);
        await userProfile.save(connection);
    }

    /**
     * Retrieves a Salesforce profile by its **developer** name or ID. If no name or ID is provided,
     * the current user's profile is returned.
     *
     * @param profileNameOrId - The **developer** name or ID of the Salesforce profile to retrieve. 
     *                          If omitted, the current user's profile is returned.
     * @returns A promise that resolves to a `SalesforceProfile` object representing the retrieved profile.
     * @throws An error if the profile with the specified name or ID is not found.
     */
    public async getProfile(profileNameOrId?: string): Promise<SalesforceProfile> {
        if (!profileNameOrId) {
            return this.currentUserProfile();
        }

        this.logger.verbose(`Retrieving Salesforce profile: %s`, profileNameOrId);
        const connection = await this.salesforce.getJsForceConnection();

        if (profileNameOrId.startsWith('00e')) {
            const profile = await connection.tooling.sobject('Profile').findOne<{ FullName: string }>({ Id: profileNameOrId }, [ 'FullName' ]);
            if (!profile) {
                throw new Error(`Profile with ID '${profileNameOrId}' not found`);
            }
            profileNameOrId = profile.FullName;
        }
        
        const profileMetadata = await connection.metadata.read('Profile', profileNameOrId);
        if (!profileMetadata) {
            throw new Error(`Profile with name '${profileNameOrId}' not found`);
        }

        return new SalesforceProfile(
            profileNameOrId,
            profileMetadata,
        );
    }

    private async getProfileId(profileName: string): Promise<string> {
        const connection = await this.salesforce.getJsForceConnection();
        const profile = await connection.tooling.sobject('Profile').findOne({ Name: profileName }, [ 'Id' ]);
        if (!profile) {
            throw new Error(`Profile with name '${profileName}' not found`);
        }
        return profile.Id!;
    }
}
import { ProfileMetadata, ProfileRecordTypeVisibility } from './types';
import { SalesforceUserPermissions } from './salesforceUserPermissions';

export class SalesforceProfile extends SalesforceUserPermissions {

    constructor(developerName: string, metadata?: ProfileMetadata) {
        super('Profile', developerName, metadata);
    }

    /**
     * Load a profile from XML buffer or string that repeats the profile metadata
     * @param name Name of the profile; for metadata this is the file name without extension.
     * @param profileXmlBody String or buffer containing the profile XML
     * @returns A profile object
     */
    public static fromXml(name: string, profileXmlBody: string | Buffer) : SalesforceProfile {
        return new SalesforceProfile(name).load(profileXmlBody);
    }

    public setRecordTypeVisibility(recordTypeName: string | { objectType: string, name: string }, visible: boolean = true) {
        super.setRecordTypeVisibility(recordTypeName, visible);
        const typeName = typeof recordTypeName === 'string' ? recordTypeName.split('.')[0] : recordTypeName.objectType;
        this.validateDefaultRecordTypeAssignment(typeName);
    }

    /**
     * Validates and ensures the correct default record type assignment for a given object type.
     * 
     * This method checks the record types associated with the specified object type and ensures
     * that the default record type is properly assigned based on visibility rules:
     * - If there are visible record types, exactly one of them must be marked as the default.
     * - If no record types are visible, no default should be assigned.
     * 
     * If the current default assignment is invalid, this method updates the record type visibilities
     * to ensure compliance with the rules. It assigns the first visible record type as the default
     * if necessary.
     * 
     * @param objectType - The API name of the object type for which to validate default record type assignment.
     */
    public validateDefaultRecordTypeAssignment(objectType: string) {
        const recordTypes = this.recordTypes.filter(c => c.recordType.startsWith(objectType)) as ProfileRecordTypeVisibility[];

        const hasVisibleRecordTypes = recordTypes.some(c => c.visible === true);
        const defaultRecordTypeVisible = recordTypes.some(c => c.default === true && c.visible === true);
        const validDefault = recordTypes.filter(c => c.default === true).length === (hasVisibleRecordTypes ? 1 : 0);
        
        if (hasVisibleRecordTypes && defaultRecordTypeVisible && validDefault) {
            return;
        }

        recordTypes.forEach(c => c.default !== false && this.update('recordTypeVisibilities', { ...c, default: false } ));
        const firstVisibleRecordType = recordTypes.find(c => c.visible === true);
        if (firstVisibleRecordType) {
            this.update('recordTypeVisibilities', { ...firstVisibleRecordType, default: true } );
        }
    }
}
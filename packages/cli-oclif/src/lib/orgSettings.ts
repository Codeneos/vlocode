import { Logger, LogManager } from '@vlocode/core';
import { SalesforceConnection, SalesforceDeployment, SalesforcePackage } from '@vlocode/salesforce';

import { CustomSettingStore } from './customSettingStore';

const ORG_SETTING_OBJECT = 'OrgSetting__c';

/**
 * Metadata definition of the `OrgSetting__c` List Custom Setting shipped with the CLI, deployed
 * on demand when the target org does not have the object yet.
 */
const ORG_SETTING_DEFINITION = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <customSettingsType>List</customSettingsType>
    <label>Org Setting</label>
    <visibility>Public</visibility>
    <fields>
        <fullName>Value__c</fullName>
        <label>Value</label>
        <length>255</length>
        <required>false</required>
        <type>Text</type>
        <unique>false</unique>
    </fields>
</CustomObject>`;

/**
 * Simple string key/value store backed by the org's `OrgSetting__c` List Custom Setting, used to
 * persist deployment state (deployed branch/revision) between CLI runs.
 *
 * When the setting object does not exist in the target org, the shipped {@link ORG_SETTING_DEFINITION}
 * is deployed once and the operation is retried.
 */
export class OrgSettingsStore {

    private readonly store: CustomSettingStore<{ value: string }>;
    private provisioned = false;

    constructor(
        private readonly connection: SalesforceConnection,
        private readonly prefix?: string,
        private readonly logger: Logger = LogManager.get(OrgSettingsStore),
    ) {
        this.store = new CustomSettingStore(ORG_SETTING_OBJECT, connection);
    }

    public async get(key: string): Promise<string | undefined> {
        try {
            return (await this.store.get(this.scopedKey(key)))?.value;
        } catch (err) {
            if (this.isMissingObjectError(err)) {
                // Object not deployed yet: no settings stored either.
                return undefined;
            }
            throw err;
        }
    }

    public async set(key: string, value: string): Promise<void> {
        try {
            await this.store.set(this.scopedKey(key), { value });
        } catch (err) {
            if (!this.isMissingObjectError(err) || this.provisioned) {
                throw err;
            }
            await this.deployDefinition();
            await this.store.set(this.scopedKey(key), { value });
        }
    }

    private scopedKey(key: string): string {
        return this.prefix ? `${this.prefix}_${key}` : key;
    }

    private isMissingObjectError(err: unknown): boolean {
        const message = err instanceof Error ? err.message : String(err);
        return /INVALID_TYPE|NOT_FOUND|not supported|does not exist|no such column/i.test(message);
    }

    /**
     * Deploy the shipped `OrgSetting__c` definition to the connected org.
     */
    private async deployDefinition(): Promise<void> {
        this.provisioned = true;
        this.logger.info(`${ORG_SETTING_OBJECT} does not exist in the target org; deploying the setting object...`);

        const sfPackage = new SalesforcePackage(this.connection.version);
        sfPackage.add({
            componentType: 'CustomObject',
            componentName: ORG_SETTING_OBJECT,
            packagePath: `objects/${ORG_SETTING_OBJECT}.object`,
            data: ORG_SETTING_DEFINITION,
        });

        const deployment = new SalesforceDeployment(sfPackage);
        await deployment.start();
        const result = await deployment.getResult();
        if (!result.success) {
            const problem = (result.details?.componentFailures as any)?.[0]?.problem ?? result.status;
            throw new Error(`Failed to deploy ${ORG_SETTING_OBJECT} to the target org: ${problem}`);
        }
        this.store.clearCache();
        this.logger.info(`Deployed ${ORG_SETTING_OBJECT} to the target org`);
    }
}

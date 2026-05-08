import { Logger, injectable } from '@vlocode/core';
import { QueryBuilder, SalesforceService } from '@vlocode/salesforce';
import { DatapackTypeDefinition, SalesforceUrlType } from '@vlocode/vlocity';
import { getErrorMessage } from '@vlocode/util';

import VlocodeService from '../vlocodeService';

const omniStudioDesignerDatapackTypes = new Set([
    'DataRaptor',
    'FlexCard',
    'IntegrationProcedure',
    'OmniScript',
    'VlocityCard'
]);

const nativeOmniStudioDesignerSObjects = new Set([
    'OmniDataTransform',
    'OmniProcess',
    'OmniUiCard'
]);

const managedPackageDesignerSettingName = 'ManagedPackageDesigner';

@injectable.transient()
export class OmniStudioDesignerService {

    private managedPackageDesignerDisabled?: Promise<boolean>;
    private readonly accessibleSObjects = new Map<string, Promise<boolean>>();

    constructor(
        private readonly salesforce: SalesforceService,
        private readonly vlocode: VlocodeService,
        private readonly logger: Logger
    ) {
    }

    public isOmniStudioDesignerDatapack(typeDef: DatapackTypeDefinition): boolean {
        return omniStudioDesignerDatapackTypes.has(typeDef.datapackType);
    }

    public async getPreferredDesigner(record: any, typeDef: DatapackTypeDefinition): Promise<SalesforceUrlType> {
        if (this.isNativeOmniStudioDefinition(typeDef) || this.isManagedUsingStandardDesigner(record) || await this.isManagedPackageDesignerDisabled()) {
            return 'standard';
        }

        if (typeDef.datapackType === 'OmniScript' && this.isLwcEnabledOmniScript(record)) {
            return 'lwc';
        }

        return 'classic';
    }

    public isManagedUsingStandardDesigner(record: any): boolean {
        return this.toBoolean(record?.IsManagedUsingStdDesigner ?? record?.isManagedUsingStdDesigner) === true;
    }

    public async isManagedPackageDesignerDisabled(): Promise<boolean> {
        this.managedPackageDesignerDisabled ??= this.determineManagedPackageDesignerDisabled();
        return this.managedPackageDesignerDisabled;
    }

    private async determineManagedPackageDesignerDisabled(): Promise<boolean> {
        if (!this.vlocode.isVlocityAvailable) {
            return true;
        }

        const managedPackageDesignerEnabled = this.toBoolean(await this.getVlocitySetting(managedPackageDesignerSettingName));
        if (managedPackageDesignerEnabled !== undefined) {
            this.logger.debug(`OmniStudio setting ${managedPackageDesignerSettingName}=${managedPackageDesignerEnabled}`);
            return !managedPackageDesignerEnabled;
        }

        return false;
    }

    private isNativeOmniStudioDefinition(typeDef: DatapackTypeDefinition): boolean {
        return nativeOmniStudioDesignerSObjects.has(typeDef.source.sobjectType);
    }

    private isLwcEnabledOmniScript(record: any): boolean {
        return this.toBoolean(
            record?.IsLwcEnabled__c ??
            record?.IsLwcEnabled ??
            record?.IsWebCompEnabled ??
            record?.isLwcEnabled
        ) === true;
    }

    private async getVlocitySetting(settingName: string): Promise<string | null> {
        return await this.getNativeOmniStudioSetting(settingName) ?? await this.getManagedPackageSetting(settingName);
    }

    private async getNativeOmniStudioSetting(settingName: string): Promise<string | null> {
        if (!await this.isSObjectAccessible('OmniInteractionConfig')) {
            return null;
        }

        try {
            const [record] = await this.salesforce.query<{ Value?: string }>(
                `SELECT Value FROM OmniInteractionConfig WHERE DeveloperName = '${this.escapeSoql(settingName)}' LIMIT 1`
            );
            return record?.Value ?? null;
        } catch (error) {
            this.logger.debug(`Unable to read OmniInteractionConfig setting ${settingName}: ${getErrorMessage(error)}`);
            return null;
        }
    }

    private async getManagedPackageSetting(settingName: string): Promise<string | null> {
        const sobjectType = this.salesforce.updateNamespace('%vlocity_namespace%__GeneralSettings__c');
        const valueField = this.salesforce.updateNamespace('%vlocity_namespace%__Value__c');

        if (!await this.isSObjectAccessible(sobjectType)) {
            return null;
        }

        try {
            const [record] = await this.salesforce.query<Record<string, string>>(
                `SELECT ${valueField} FROM ${sobjectType} WHERE Name = '${this.escapeSoql(settingName)}' LIMIT 1`
            );
            return record?.[valueField] ?? null;
        } catch (error) {
            this.logger.debug(`Unable to read ${sobjectType} setting ${settingName}: ${getErrorMessage(error)}`);
            return null;
        }
    }

    private isSObjectAccessible(sobjectType: string): Promise<boolean> {
        const existing = this.accessibleSObjects.get(sobjectType);
        if (existing) {
            return existing;
        }

        const result = this.salesforce.schema.describeSObject(sobjectType, false).then(describe => describe !== undefined);
        this.accessibleSObjects.set(sobjectType, result);
        return result;
    }

    private toBoolean(value: unknown): boolean | undefined {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value !== 'string') {
            return undefined;
        }

        switch (value.trim().toLowerCase()) {
            case '1':
            case 'enabled':
            case 'true':
            case 'yes':
                return true;
            case '0':
            case 'disabled':
            case 'false':
            case 'no':
                return false;
            default:
                return undefined;
        }
    }

    private escapeSoql(value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
}

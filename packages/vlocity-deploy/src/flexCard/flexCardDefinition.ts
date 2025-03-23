import { injectable } from "@vlocode/core";
import { QueryBuilder, RecordFactory, SalesforceService } from "@vlocode/salesforce";
import { asString } from "@vlocode/util";
import { VlocityDatapack } from "@vlocode/vlocity";

export interface FlexCardDefinition {
    SObjectType: string;
    ActivationField: string;
    Name: string;
    Id: string;
    AuthorName: string;
    VersionNumber: number;
    IsActive: boolean;
    IsChildCard?: boolean;
    Type?: 'flex' | 'classic';
    UniqueName?: string;
    PropertySetConfig: string | object;
    StylingConfiguration?: any;
    Attachments?: any[];
    Label?: Record<string, string>;
}

interface OmniUiCardRecord {
    Name: string;
    Id: string;
    AuthorName: string;
    VersionNumber: number;
    IsActive: boolean;
    OmniUiCardType?: 'parent' | 'child';
    UniqueName?: string;
    PropertySetConfig: string | object;
    StylingConfiguration?: string;
}

interface VlocityCardRecord {
    Name: string;
    Id: string;
    Author: string;
    Active: boolean;
    Version: number;
    IsChildCard: boolean;
    CardType: 'flex' | 'classic';
    Definition: string | object;
    Styles?: string;
}

export namespace FlexCardDefinition {
    export const OmniCardFields = [
        'Id', 
        'Name', 
        'AuthorName',
        'VersionNumber',
        'IsActive', 
        'OmniUiCardType', 
        'UniqueName', 
        'PropertySetConfig', 
        'StylingConfiguration'
    ];
    
    export const VlocityCardFields = [
        'Id', 
        'Name', 
        '%vlocity_namespace%__Version__c', 
        '%vlocity_namespace%__Author__c', 
        '%vlocity_namespace%__Active__c', 
        '%vlocity_namespace%__CardType__c', 
        '%vlocity_namespace%__IsChildCard__c',
        '%vlocity_namespace%__Definition__c', 
        '%vlocity_namespace%__Styles__c',
        '%vlocity_namespace%__Type__c'
    ];

    export function fromDatapack(datapack: VlocityDatapack): FlexCardDefinition {
        const record = RecordFactory.create(datapack.data);
        if (datapack.sobjectType === 'OmniUiCard') {
            return fromOmniCard(record as OmniUiCardRecord);
        } 
        if (datapack.sobjectType === '%vlocity_namespace%__VlocityCard__c') {
            return fromVlocityCard(record as VlocityCardRecord);
        }
        throw new Error(`Unsupported datapack type: ${datapack.sobjectType}`);
    }

    export function fromOmniCard(record: OmniUiCardRecord): FlexCardDefinition {
        return {
            SObjectType: 'OmniUiCard',
            ActivationField: 'IsActive',
            Name: record.Name,
            Id: record.Id,
            VersionNumber: record.VersionNumber,
            AuthorName: record.AuthorName,
            IsActive: record.IsActive === undefined ? true : record.IsActive,
            IsChildCard: record.OmniUiCardType === 'child',
            Type: 'flex',
            UniqueName: record.UniqueName,
            PropertySetConfig: asString(record.PropertySetConfig),
            StylingConfiguration: asString(record.StylingConfiguration)
        };
    }

    export function fromVlocityCard(record: VlocityCardRecord): FlexCardDefinition {
        return {
            SObjectType: '%vlocity_namespace%__VlocityCard__c',
            ActivationField: '%vlocity_namespace%__Active__c',
            Name: record.Name,
            Id: record.Id,
            VersionNumber: record.Version,
            AuthorName: record.Author,
            IsActive: record.Active === undefined ? true : record.Active,
            IsChildCard: record.IsChildCard,
            Type: record.CardType,
            PropertySetConfig: asString(record.Definition),
            StylingConfiguration: asString(record.Styles)
        };
    }
}

export type FlexCardIdentifier = string | { name: string, isChildCard?: boolean, author?: string, version?: number, active?: boolean };

@injectable.singleton()
export class FlexCardDefinitionAccess {

    constructor(private readonly salesforceService: SalesforceService) {        
    }

    /**
     * Retrieves flex card definitions based on the provided criteria.
     * 
     * This method fetches both OmniCard and VlocityCard records matching the criteria,
     * converts them to FlexCardDefinition objects, and returns them as a Map keyed by card name.
     * 
     * When multiple definitions exist for the same card name, the method prioritizes:
     * 1. Active cards over inactive ones
     * 2. Cards with lower version numbers when comparing cards of the same active status
     * 
     * @param criteria - Optional identifier to filter the flex cards
     * @returns A Promise resolving to a Map of card names to their corresponding FlexCardDefinition
     */
    public async getFlexCardDefinitions(criteria?: FlexCardIdentifier): Promise<Map<string, FlexCardDefinition>> {
        const cards: FlexCardDefinition[] = [];
        for (const record of await this.queryOmniCardRecords(criteria)) {
            cards.push(FlexCardDefinition.fromOmniCard(record));
        }
        for (const record of await this.queryVlocityCardRecords(criteria)) {
            cards.push(FlexCardDefinition.fromVlocityCard(record));
        }
        const cardsByName = new Map<string, FlexCardDefinition>();
        for (const card of cards) {
            const currentEntry = cardsByName.get(card.Name);
            if (currentEntry && ((!currentEntry.IsActive && card.IsActive) || currentEntry.VersionNumber > card.VersionNumber)) {
                continue;
            }
            cardsByName.set(card.Name, card);
        }
        return cardsByName;
    }

    /**
     * Retrieves flex card definitions based on optional filter criteria.
     * This method queries both OmniScript and Vlocity card records and converts them to FlexCardDefinition instances.
     * 
     * @param filter - Optional identifier to filter specific cards
     * @returns Promise resolving to an array of FlexCardDefinition objects
     */
    public async filterCardDefinitions(filter?: FlexCardIdentifier): Promise<FlexCardDefinition[]> {
        const cards: FlexCardDefinition[] = [];
        for (const record of await this.queryOmniCardRecords(filter)) {
            cards.push(FlexCardDefinition.fromOmniCard(record));
        }
        for (const record of await this.queryVlocityCardRecords(filter)) {
            cards.push(FlexCardDefinition.fromVlocityCard(record));
        }
        return cards;
    }

    /**
     * Finds a FlexCard definition based on the provided identifier.
     * This method first checks for OmniScript card records, then falls back to Vlocity card records.
     * 
     * @param id - The identifier used to locate the FlexCard
     * @returns A Promise that resolves to the found FlexCardDefinition
     * @throws Error when no FlexCard record is found for the provided identifier
     */
    public async findCardDefinition(id: FlexCardIdentifier): Promise<FlexCardDefinition> {
        const omniCardRecords = await this.queryOmniCardRecords(id);
        if (omniCardRecords.length) {
            return FlexCardDefinition.fromOmniCard(omniCardRecords[0]);
        }

        const vlocityCardRecords = await this.queryVlocityCardRecords(id);
        if (vlocityCardRecords.length) {
            return FlexCardDefinition.fromVlocityCard(vlocityCardRecords[0]);
        }

        throw new Error(`No FlexCard record found for ID: ${JSON.stringify(id)}`);
    }

    private async queryOmniCardRecords(card?: FlexCardIdentifier): Promise<OmniUiCardRecord[]> {
        const query = new QueryBuilder('OmniUiCard').select(...FlexCardDefinition.OmniCardFields)
            .sortBy('VersionNumber', 'desc');

        if (typeof card === 'string') {
            query.filter({ Id: card });
        } else if (card !== undefined) {
            query.filter({ 
                Name: card.name, 
                AuthorName: card.author, 
                VersionNumber: card.version, 
                OmniUiCardType: card.isChildCard ? 'child' : undefined,
                IsActive: card.active !== false 
            }, { 
                ignoreUndefined: true 
            });
        }

        return query.execute<OmniUiCardRecord>(this.salesforceService);
    }

    private queryVlocityCardRecords(card?: FlexCardIdentifier): Promise<VlocityCardRecord[]> {
        const query = new QueryBuilder('%vlocity_namespace%__VlocityCard__c').select(...FlexCardDefinition.VlocityCardFields)
            .sortBy('%vlocity_namespace%__Version__c', 'desc');

        if (typeof card === 'string') {
            query.filter({ Id: card });
        } else if (card !== undefined) {
            query.filter({ 
                Name: card.name, 
                '%vlocity_namespace%__Author__c': card.author, 
                '%vlocity_namespace%__IsChildCard__c': card.isChildCard, 
                '%vlocity_namespace%__Version__c': card.version, 
                '%vlocity_namespace%__Active__c': card.active !== false 
            }, { 
                ignoreUndefined: true 
            });
        }

        return query.execute<VlocityCardRecord>(this.salesforceService);
    }
}
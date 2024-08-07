import { Logger, injectable, DeferredWorkQueue, WorkItemResult } from '@vlocode/core';
import { cache, forEachAsyncParallel, mapKeys, Timer } from '@vlocode/util';
import { QueryBuilder } from '../queryBuilder';
import { EntityDefinition } from './types/entityDefinition';
import { FieldDefinition } from './types/fieldDefinition';
import { SchemaDataStore } from './schemaDataStore';
import { QueryService } from '../queryService';

/**
 * Lazy access to Salesforce schema objects, instead of pre-loading all schema data schema and describe calls are made when needed. This speeds up initial loading time but the total time needed
 * for describing all objects will be significantly higher.
 */
@injectable.singleton()
export class ToolingApiSchemaAccess {

    public fieldDefinition = {
        name: 'FieldDefinition',
        fields: [
            'fields(standard)',
            'isFlsEnabled',
            'ValueType.DeveloperName',
            'EntityDefinition.DurableId'
        ]
    };

    public entityDefinition = {
        name: 'EntityDefinition',
        fields: [
            'fields(standard)',
            'isFlsEnabled',
            '(select FieldId, IsRestrictedDelete, IsCascadeDelete, JunctionIdListNames from ChildRelationships)',
            '(select Name from Layouts)'
        ],
        filter: {
            IsDeprecatedAndHidden: false,
            IsEverCreatable: true,
            IsQueryable: true,
            KeyPrefix: { op: '!=', value: null }
        }
    };

    private readonly fieldDefinitionObjectName = 'FieldDefinition';
    private readonly fieldDefinitionObjectFields = [
        'fields(standard)',
        'isFlsEnabled',
        'ValueType.DeveloperName',
        'EntityDefinition.DurableId'
    ];

    private readonly entityDefinitionObjectName = 'EntityDefinition';
    private readonly entityDefinitionObjectFields = [
        'fields(standard)',
        'isFlsEnabled',
        '(select FieldId, IsRestrictedDelete, IsCascadeDelete, JunctionIdListNames from ChildRelationships)',
        '(select Name from Layouts)'
    ];

    private readonly entityDefinitionFilter = {
        IsDeprecatedAndHidden: false,
        IsEverCreatable: true,
        IsQueryable: true,
        KeyPrefix: { op: '!=', value: null }
    };

    /**
     * Default chunk size for fetching entities
     */
    public chunkSize = 50;

    /**
     * Number of parallel processing threads for fetching entity definitions from the server
     */
    public parallelism = 5;

    private readonly objectListChunkSize = 2000;
    private readonly excludedObjectListPostFixes = [
        'ChangeEvent', 'Share', 'Feed', 'History', '__hd', '__ViewStat', '__VoteStat', '__ka', '__kav', '__OwnerSharingRule'
    ];

    private readonly deferredProcessor = new DeferredWorkQueue(this.getEntityDefinitions, this);
    @injectable.property private readonly logger!: Logger;

    constructor(private readonly queryService: QueryService, private readonly schemaStore: SchemaDataStore) {
    }

    @cache({ unwrapPromise: true })
    public async listObjectTypes(chunkSize = this.objectListChunkSize) {
        const entities = new Array<string>();

        // eslint-disable-next-line no-constant-condition
        for (let chunkNr = 0; true; chunkNr++) {
            const chunk = await new QueryBuilder(this.entityDefinitionObjectName, [ 'QualifiedApiName', 'KeyPrefix' ])
                .limit(chunkSize, chunkNr * chunkSize)
                .filter(this.entityDefinitionFilter)
                .executeTooling(this.queryService);

            const validObjects = chunk.filter(e => !this.excludedObjectListPostFixes.some(postFix => e.QualifiedApiName.endsWith(postFix)));
            entities.push(...validObjects.map(e => e.QualifiedApiName));

            if (!chunk.length || chunk.length < chunkSize) {
                break;
            }
        }

        return entities;
    }

    public async getEntityDefinition(type: string): Promise<EntityDefinition | undefined> {
        if (!this.schemaStore.get(type)?.tooling) {
            await this.enqueue(type);
        }
        return this.schemaStore.get(type)?.tooling;
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private enqueue(sobjectType: string) {
        return this.deferredProcessor.enqueue(sobjectType);
    }

    private async getEntityDefinitions(sobjectTypes: string[], chunkSize = this.chunkSize) {
        const results = new Array<WorkItemResult>();
        const objectNameChunks = Array<Array<string>>();
        for (let index = 0; index < sobjectTypes.length; index += chunkSize) {
            objectNameChunks.push(sobjectTypes.slice(index, index + chunkSize));
        }

        const timer = new Timer();
        let readCount = 0;

        await forEachAsyncParallel(objectNameChunks, async (chunk, chunkNr) => {
            this.logger.verbose(`Describing ${chunk.join(', ')} ${readCount += chunk.length}/${sobjectTypes.length}`);

            const entityDefQuery = new QueryBuilder(this.entityDefinitionObjectName, this.entityDefinitionObjectFields)
                .filter(this.entityDefinitionFilter);
            const fieldDefQuery = new QueryBuilder(this.fieldDefinitionObjectName, this.fieldDefinitionObjectFields);

            const [entityResult, fieldsResult] = await Promise.all([
                this.executeToolingQuery<EntityDefinition>(entityDefQuery, 'QualifiedApiName', chunk),
                this.executeToolingQuery<FieldDefinition>(fieldDefQuery, 'EntityDefinition.QualifiedApiName', chunk)
            ]);

            chunk.forEach((type, i) => {
                const entityInfo = entityResult.find(e => e.qualifiedApiName.toLowerCase() === type.toLowerCase());
                if (entityInfo) {
                    entityInfo.fields = fieldsResult.filter(f => f.entityDefinition.durableId === entityInfo.durableId);
                }

                results[(chunkNr * chunkSize) + i] = {
                    status: 'fulfilled',
                    value: !!entityInfo
                };

                if (entityInfo) {
                    this.schemaStore.addEntityDefinition(entityInfo);
                }
            });

        }, Math.min(objectNameChunks.length, this.parallelism));

        this.logger.info(`Load entity definitions for ${sobjectTypes.length} objects in ${timer}`);
        return results;
    }

    private async executeToolingQuery<T extends object>(query: QueryBuilder, field: string, chunk: string[]) : Promise<T[]> {
        const results = new Array<T>();

        try {
            const chunkQuery = query.clone().filter({ [field]: chunk });
            const normalizedResults = await chunkQuery.executeTooling<T>(this.queryService);
            results.push(...normalizedResults);
        } catch(err) {
            // For some objects we get unknown errors even when the query is fine
            // to avoid excluding specific objects we try to isolate the object causing the issue
            const connectionReset = err?.message?.includes('read ECONNRESET');
            const limitError = err?.message?.includes('EXCEEDED_ID_LIMIT');
            const unexpectedError = err?.message?.includes('An unexpected error occurred. Please include this ErrorId if you contact support');

            if (!unexpectedError && !connectionReset && !limitError) {
                // Throw the Error when we retrying is meaningless due to query errors etc
                throw err;
            }

            if (chunk.length == 1) {
                return results;
            }

            const workItems = Array.from(chunk);
            const chunkSize = chunk.length <= 5 ? 1 : Math.round(chunk.length / 2);

            while(workItems.length) {
                results.push(...await this.executeToolingQuery<T>(query, field, workItems.splice(0, chunkSize)));
            }
        }

        return results;
    }

    private normalize(obj: any): any {
        if (typeof obj !== 'object') {
            return obj;
        }

        if (obj.done === true && Array.isArray(obj.records)) {
            return obj.records.map(this.normalize, this);
        }

        const normalized = mapKeys(obj, (key: string) => `${key[0].toLowerCase()}${key.substring(1)}`);
        for (const key of Object.keys(normalized)) {
            if (Array.isArray(normalized[key])) {
                normalized[key] = normalized[key].map(this.normalize, this);
            } else if (normalized[key] === null) {
                normalized[key] = undefined;
            } else {
                normalized[key] = this.normalize(normalized[key]);
            }
        }
        return normalized;
    }
}
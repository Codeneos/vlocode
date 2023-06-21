import { injectable } from '@vlocode/core';
import { cache } from '@vlocode/util';
import { DescribeSObjectResult, Field } from '../types';
import { DescribeSchemaAccess } from './describeSchemaAccess';
import { SchemaDataStore } from './schemaDataStore';
import { ToolingApiSchemaAccess } from './toolingApiSchemaAccess';
import { EntityDefinition } from './types/entityDefinition';
import { FieldDefinition } from './types/fieldDefinition';

@injectable()
export class CompositeSchemaAccess {

    constructor(
        private readonly schemaStore: SchemaDataStore,
        private readonly toolingAccess: ToolingApiSchemaAccess,
        private readonly describeAccess: DescribeSchemaAccess) {
    }

    public listObjectTypes() {
        return this.describeAccess.listObjectTypes();
    }

    public async describe(type: string): Promise<DescribeSObjectResult | undefined>;
    public async describe(type: string, field: string): Promise<Field | undefined>;
    public async describe(type: string, field?: string): Promise<Field | DescribeSObjectResult | undefined> {
        if (!this.schemaStore.get(type)?.describe) {
            await this.enqueue(type);
        }
        return this.schemaStore.get(type, field)?.describe;
    }

    public async getEntityDefinition(type: string): Promise<EntityDefinition| undefined>{
        if (!this.schemaStore.get(type)?.tooling) {
            await this.enqueue(type);
        }
        return this.schemaStore.get(type)?.tooling;
    }

    public async getFieldDefinition(type: string, field: string): Promise<FieldDefinition| undefined>{
        if (!this.schemaStore.get(type)?.tooling) {
            await this.enqueue(type);
        }
        return this.schemaStore.get(type, field)?.tooling;
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private async enqueue(sobjectType: string) {
        const [ describe, entity ] = await Promise.allSettled([
            this.describeAccess.describe(sobjectType),
            this.toolingAccess.getEntityDefinition(sobjectType)
        ]);

        if (describe.status === 'rejected' && entity.status === 'fulfilled') {
            throw new Error(`SObject ${sobjectType} is not accessible by the current user`);
        } else if (describe.status === 'rejected') {
            throw describe.reason;
        }
    }
}
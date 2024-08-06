import { Container, container, injectable } from '@vlocode/core';
import { cache } from '@vlocode/util';
import { DescribeSObjectResult, Field } from '../types';
import { DescribeSchemaAccess } from './describeSchemaAccess';
import { SchemaDataStore } from './schemaDataStore';
import { ToolingApiSchemaAccess } from './toolingApiSchemaAccess';
import { EntityDefinition } from './types/entityDefinition';
import { FieldDefinition } from './types/fieldDefinition';

@injectable.singleton()
export class CompositeSchemaAccess {

    constructor(
        private readonly schemaStore: SchemaDataStore,
        private readonly toolingAccess: ToolingApiSchemaAccess,
        private readonly describeAccess: DescribeSchemaAccess) {
    }

    public dispose() {
        const owner = Container.get(this) ?? container;
        owner.removeInstance(this.toolingAccess);
        owner.removeInstance(this.describeAccess);
        owner.removeInstance(this.schemaStore);
    }

    public listObjectTypes() {
        return this.describeAccess.listObjectTypes();
    }

    public async describe(type: string): Promise<DescribeSObjectResult | undefined>;
    public async describe(type: string, field: string): Promise<Field | undefined>;
    public async describe(type: string, field?: string): Promise<Field | DescribeSObjectResult | undefined> {
        if (!this.schemaStore.get(type)?.describe) {
            await this.enqueueDescribe(type);
        }
        return this.schemaStore.get(type, field)?.describe;
    }

    public async getEntityDefinition(type: string): Promise<EntityDefinition| undefined>{
        if (!this.schemaStore.get(type)?.tooling) {
            await this.enqueueTooling(type);
        }
        return this.schemaStore.get(type)?.tooling;
    }

    public async getFieldDefinition(type: string, field: string): Promise<FieldDefinition| undefined>{
        if (!this.schemaStore.get(type)?.tooling) {
            await this.enqueueTooling(type);
        }
        return this.schemaStore.get(type, field)?.tooling;
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private async enqueueTooling(sobjectType: string) {
        await this.toolingAccess.getEntityDefinition(sobjectType);
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private async enqueueDescribe(sobjectType: string) {
        await this.describeAccess.describe(sobjectType);
    }
}
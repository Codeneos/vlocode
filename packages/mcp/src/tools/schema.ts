import type { Container } from '@vlocode/core';
import { SalesforceSchemaService } from '@vlocode/salesforce';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const schemaTools: Tool[] = [
    {
        name: 'list_sobjects',
        description:
            'List all Salesforce objects (SObjects) available in the connected org. ' +
            'Returns the API names and labels for all standard and custom objects.',
        inputSchema: {
            type: 'object',
            properties: {
                filter: {
                    type: 'string',
                    description:
                        'Optional case-insensitive substring filter applied to object API names and labels. ' +
                        'For example, "Account" returns objects whose name or label contains "Account".',
                },
            },
        },
    },
    {
        name: 'describe_sobject',
        description:
            'Describe a Salesforce object (SObject) including all its fields, relationships, ' +
            'and metadata. Useful for understanding the structure of a Salesforce record type.',
        inputSchema: {
            type: 'object',
            properties: {
                objectType: {
                    type: 'string',
                    description:
                        'The API name of the Salesforce object to describe (e.g. "Account", "Contact", "vlocity_cmt__OmniScript__c").',
                },
                includeFields: {
                    type: 'boolean',
                    description:
                        'Include field-level details (type, label, required, etc.) in the result. Defaults to true.',
                    default: true,
                },
            },
            required: ['objectType'],
        },
    },
    {
        name: 'describe_sobject_field',
        description:
            'Describe a specific field on a Salesforce object. ' +
            'Returns detailed metadata including type, label, picklist values, and relationship details.',
        inputSchema: {
            type: 'object',
            properties: {
                objectType: {
                    type: 'string',
                    description: 'The API name of the Salesforce object (e.g. "Account").',
                },
                fieldName: {
                    type: 'string',
                    description: 'The API name of the field to describe (e.g. "Name", "OwnerId").',
                },
            },
            required: ['objectType', 'fieldName'],
        },
    },
];

export async function executeSchemaTool(
    name: string,
    args: Record<string, unknown>,
    localContainer: Container
) {
    if (name === 'list_sobjects') {
        return listSObjects(args, localContainer);
    }
    if (name === 'describe_sobject') {
        return describeSObject(args, localContainer);
    }
    if (name === 'describe_sobject_field') {
        return describeSObjectField(args, localContainer);
    }
    throw new Error(`Unknown schema tool: ${name}`);
}

async function listSObjects(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const filter = (args['filter'] as string | undefined)?.toLowerCase();
    const schemaService = localContainer.get(SalesforceSchemaService);
    const sobjects = await schemaService.describeSObjects();

    const filtered = filter
        ? sobjects.filter(
              (o) =>
                  o.name.toLowerCase().includes(filter) ||
                  o.label.toLowerCase().includes(filter)
          )
        : sobjects;

    const lines = filtered.map((o) => `${o.name} — ${o.label}`);

    return {
        content: [
            {
                type: 'text' as const,
                text:
                    lines.length > 0
                        ? lines.join('\n')
                        : 'No objects found matching the filter.',
            },
        ],
    };
}

async function describeSObject(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const objectType = args['objectType'] as string;
    const includeFields = (args['includeFields'] as boolean) ?? true;

    const schemaService = localContainer.get(SalesforceSchemaService);
    const describe = await schemaService.describeSObject(objectType);

    const lines: string[] = [
        `Object: ${describe.name}`,
        `Label: ${describe.label}`,
        `Label (plural): ${describe.labelPlural}`,
        `Key prefix: ${describe.keyPrefix ?? 'n/a'}`,
        `Custom: ${describe.custom}`,
        `Queryable: ${describe.queryable}`,
        `Createable: ${describe.createable}`,
        `Updateable: ${describe.updateable}`,
        `Deletable: ${describe.deletable}`,
        `Fields: ${describe.fields.length}`,
    ];

    if (includeFields) {
        lines.push('', 'Fields:');
        for (const field of describe.fields) {
            const attrs: string[] = [field.type];
            if (field.length) attrs.push(`length: ${field.length}`);
            if (!field.nillable) attrs.push('required');
            if (field.externalId) attrs.push('externalId');
            if (field.unique) attrs.push('unique');
            lines.push(
                `  ${field.name} (${field.label}) [${attrs.join(', ')}]`
            );
        }
    }

    return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
}

async function describeSObjectField(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const objectType = args['objectType'] as string;
    const fieldName = args['fieldName'] as string;

    const schemaService = localContainer.get(SalesforceSchemaService);
    const field = await schemaService.describeSObjectField(objectType, fieldName);

    const lines: string[] = [
        `Field: ${field.name}`,
        `Label: ${field.label}`,
        `Type: ${field.type}`,
        `Length: ${field.length ?? 'n/a'}`,
        `Required: ${!field.nillable}`,
        `Unique: ${field.unique}`,
        `External ID: ${field.externalId}`,
        `Createable: ${field.createable}`,
        `Updateable: ${field.updateable}`,
        `Filterable: ${field.filterable}`,
        `Sortable: ${field.sortable}`,
        `Calculated: ${field.calculated}`,
    ];

    if (field.referenceTo && field.referenceTo.length > 0) {
        lines.push(`References: ${field.referenceTo.join(', ')}`);
        lines.push(`Relationship name: ${field.relationshipName ?? 'n/a'}`);
    }

    if (field.picklistValues && field.picklistValues.length > 0) {
        lines.push('', 'Picklist values:');
        for (const pv of field.picklistValues) {
            const parts = [pv.value];
            if (pv.label !== pv.value) parts.push(`(${pv.label})`);
            if (pv.defaultValue) parts.push('[default]');
            if (!pv.active) parts.push('[inactive]');
            lines.push(`  ${parts.join(' ')}`);
        }
    }

    return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
}

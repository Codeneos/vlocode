import type { Container } from '@vlocode/core';
import {
    SalesforceProfileService,
    SalesforceConnectionProvider,
    SalesforceFieldPermission,
} from '@vlocode/salesforce';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const profileTools: Tool[] = [
    {
        name: 'list_profiles',
        description:
            'List all Salesforce profiles available in the connected org. ' +
            'Returns the developer name (fullName) for each profile.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'add_fls_to_profile',
        description:
            'Add or update Field Level Security (FLS) permissions for one or more fields on a Salesforce profile. ' +
            'Each field can be set to "editable" (read + write), "readable" (read-only), or "none" (no access).',
        inputSchema: {
            type: 'object',
            properties: {
                profile: {
                    type: 'string',
                    description:
                        'The developer name (fullName) of the profile to update (e.g. "Admin", "Standard"). ' +
                        'If omitted, the current user\'s profile is updated.',
                },
                fields: {
                    type: 'array',
                    description:
                        'List of field permission entries to apply to the profile.',
                    items: {
                        type: 'object',
                        properties: {
                            field: {
                                type: 'string',
                                description:
                                    'The fully qualified field API name in the format "ObjectType.FieldName" ' +
                                    '(e.g. "Account.Name", "Contact.Phone").',
                            },
                            access: {
                                type: 'string',
                                enum: ['editable', 'readable', 'none'],
                                description:
                                    '"editable" grants read + write, "readable" grants read-only, "none" removes all access.',
                            },
                        },
                        required: ['field', 'access'],
                    },
                    minItems: 1,
                },
            },
            required: ['fields'],
        },
    },
];

export async function executeProfileTool(
    name: string,
    args: Record<string, unknown>,
    localContainer: Container
) {
    if (name === 'list_profiles') {
        return listProfiles(localContainer);
    }
    if (name === 'add_fls_to_profile') {
        return addFlsToProfile(args, localContainer);
    }
    throw new Error(`Unknown profile tool: ${name}`);
}

async function listProfiles(localContainer: Container) {
    const profileService = localContainer.get(SalesforceProfileService);
    const profiles = await profileService.listProfiles();

    return {
        content: [
            {
                type: 'text' as const,
                text:
                    profiles.length > 0
                        ? profiles.join('\n')
                        : 'No profiles found.',
            },
        ],
    };
}

async function addFlsToProfile(
    args: Record<string, unknown>,
    localContainer: Container
) {
    const profileName = args['profile'] as string | undefined;
    const fields = args['fields'] as Array<{ field: string; access: string }>;

    const profileService = localContainer.get(SalesforceProfileService);
    const profile = await profileService.getProfile(profileName);

    for (const { field, access } of fields) {
        if (access === 'none') {
            profile.removeField(field);
        } else {
            profile.addField(
                field,
                access === 'editable'
                    ? SalesforceFieldPermission.editable
                    : SalesforceFieldPermission.readable
            );
        }
    }

    if (!profile.hasChanges) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `Profile '${profile.developerName}': no changes needed (permissions already match).`,
                },
            ],
        };
    }

    const connection = await localContainer
        .get(SalesforceConnectionProvider)
        .getJsForceConnection();
    await profile.save(connection);

    return {
        content: [
            {
                type: 'text' as const,
                text: [
                    `Profile '${profile.developerName}' updated successfully.`,
                    `Fields updated (${fields.length}):`,
                    ...fields.map((f) => `  ${f.field} → ${f.access}`),
                ].join('\n'),
            },
        ],
    };
}

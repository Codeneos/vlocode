/**
 * Profile/PermissionSet permission validator.
 *
 * Provides a config-table of rules where each rule stores an evaluator that accepts:
 *  - The `SalesforceUserPermissions` instance being scanned
 *  - The profile item being evaluated (e.g. a field-permission or object-permission entry)
 *  - The item type (e.g. `'fieldPermission'`, `'objectPermission'`)
 *  - The rule's own metadata
 *
 * Two scanning modes are available:
 *  - `validate(profile)` — structural checks that run without org access
 *  - `validateAgainstOrg(profile, schemaService)` — org-level checks (unknown fields/objects)
 */

import { SalesforceUserPermissions } from './salesforceUserPermissions';
import { SalesforceSchemaService } from './salesforceSchemaService';
import type { ProfileObjectPermissions, PermissionSetObjectPermissions } from './types';

type AnyObjectPermission = ProfileObjectPermissions | PermissionSetObjectPermissions;

// ─── Problem model ────────────────────────────────────────────────────────────

export type ProfileValidationSeverity = 'error' | 'warning' | 'info';
export type ProfileValidationCategory = 'structural' | 'org-validation' | 'deployment';
export type ProfileValidationItemType =
    | 'objectPermission'
    | 'fieldPermission'
    | 'classAccess'
    | 'pageAccess'
    | 'general';

export interface ProfileValidationProblem {
    /** Unique rule id + item name, e.g. `"field-editable-not-readable:Account.Name"` */
    id: string;
    ruleId: string;
    severity: ProfileValidationSeverity;
    category: ProfileValidationCategory;
    itemType: ProfileValidationItemType;
    /** API name of the affected item, e.g. `"Account"` or `"Account.Name"` */
    itemName: string;
    message: string;
    docsUrl?: string;
    /** Whether a Fix action can auto-resolve this problem */
    fixable: boolean;
    /** Hint for the consumer on how to fix (e.g. `'remove'`, `'grant-read'`) */
    fixAction?: string;
}

// ─── Rule infrastructure ──────────────────────────────────────────────────────

export interface ProfileValidationRuleMetadata {
    title: string;
    description: string;
    docsUrl?: string;
    severity: ProfileValidationSeverity;
    fixable?: boolean;
    fixAction?: string;
}

/**
 * Pre-computed indexes passed to each evaluator to avoid repeated linear scans.
 */
export interface ProfileValidationContext {
    /** Object permissions indexed by object name for O(1) lookup */
    objectPermissionsByName: Map<string, AnyObjectPermission>;
}

export interface ProfileValidationRule<TItem = unknown> {
    id: string;
    type: ProfileValidationItemType;
    metadata: ProfileValidationRuleMetadata;
    /**
     * Evaluate a single item against this rule.
     * @param profile  - The full profile/permset being validated.
     * @param item     - The individual permission entry (field, object, class, …).
     * @param itemType - The item type string (mirrors `this.type`).
     * @param meta     - This rule's own metadata, for convenience.
     * @param ctx      - Pre-computed indexes for efficient lookups.
     * @returns A `ProfileValidationProblem` if the rule is violated, or `null`.
     */
    evaluate(
        profile: SalesforceUserPermissions,
        item: TItem,
        itemType: ProfileValidationItemType,
        meta: ProfileValidationRuleMetadata,
        ctx: ProfileValidationContext
    ): ProfileValidationProblem | null;
}

// ─── Config table ─────────────────────────────────────────────────────────────

function makeProblem(
    ruleId: string,
    meta: ProfileValidationRuleMetadata,
    itemType: ProfileValidationItemType,
    itemName: string,
    message: string,
    category: ProfileValidationCategory = 'structural'
): ProfileValidationProblem {
    return {
        id: `${ruleId}:${itemName}`,
        ruleId,
        severity: meta.severity,
        category,
        itemType,
        itemName,
        message,
        docsUrl: meta.docsUrl,
        fixable: meta.fixable ?? false,
        fixAction: meta.fixAction
    };
}

type AnyRule = ProfileValidationRule<any>;

/**
 * Built-in structural rules, organised by item type.
 * Add new rules here to extend the validator without touching any other code.
 */
const PROFILE_VALIDATION_RULES: Record<string, AnyRule> = {

    // ── Object permission rules ───────────────────────────────────────────────

    'obj-editable-not-readable': {
        id: 'obj-editable-not-readable',
        type: 'objectPermission',
        metadata: {
            severity: 'error',
            title: 'Edit without Read',
            description: 'An object with Create, Edit, or Delete access must also have Read access.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if ((item.allowCreate || item.allowEdit || item.allowDelete) && !item.allowRead) {
                return makeProblem(this.id, meta, itemType, item.object,
                    `Object "${item.object}" has Create/Edit/Delete but not Read access.`);
            }
            return null;
        }
    },

    'obj-viewall-not-readable': {
        id: 'obj-viewall-not-readable',
        type: 'objectPermission',
        metadata: {
            severity: 'error',
            title: 'View All without Read',
            description: 'View All Records requires Read access on the object.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (item.viewAllRecords && !item.allowRead) {
                return makeProblem(this.id, meta, itemType, item.object,
                    `Object "${item.object}" has View All Records but not Read access.`);
            }
            return null;
        }
    },

    'obj-modifyall-incomplete': {
        id: 'obj-modifyall-incomplete',
        type: 'objectPermission',
        metadata: {
            severity: 'error',
            title: 'Modify All requires all CRUD + View All',
            description: 'Modify All Records requires Read, Create, Edit, Delete, and View All Records.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-all'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (item.modifyAllRecords &&
                !(item.allowRead && item.allowCreate && item.allowEdit && item.allowDelete && item.viewAllRecords)) {
                return makeProblem(this.id, meta, itemType, item.object,
                    `Object "${item.object}" has Modify All Records but is missing required lower-level permissions.`);
            }
            return null;
        }
    },

    'obj-no-permissions': {
        id: 'obj-no-permissions',
        type: 'objectPermission',
        metadata: {
            severity: 'info',
            title: 'Empty object permission entry',
            description: 'This object permission has no access flags set. Consider removing it.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'remove'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (!item.allowRead && !item.allowCreate && !item.allowEdit &&
                !item.allowDelete && !item.viewAllRecords && !item.modifyAllRecords) {
                return makeProblem(this.id, meta, itemType, item.object,
                    `Object "${item.object}" has no permissions set.`);
            }
            return null;
        }
    },

    // ── Field permission rules ────────────────────────────────────────────────

    'field-editable-not-readable': {
        id: 'field-editable-not-readable',
        type: 'fieldPermission',
        metadata: {
            severity: 'error',
            title: 'Editable field is not Readable',
            description: 'A field cannot be editable without also being readable.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (item.editable && !item.readable) {
                return makeProblem(this.id, meta, itemType, item.field,
                    `Field "${item.field}" is editable but not readable.`);
            }
            return null;
        }
    },

    'field-no-object-read': {
        id: 'field-no-object-read',
        type: 'fieldPermission',
        metadata: {
            severity: 'warning',
            title: 'Field permission without object Read access',
            description: 'This field has permissions defined, but the parent object has no Read access.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: false
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (!item.readable && !item.editable) return null;
            const objectName = item.field.split('.')[0];
            // Use O(1) context Map instead of O(n) find
            const objectPerm = ctx.objectPermissionsByName.get(objectName);
            if (!objectPerm?.allowRead) {
                return makeProblem(this.id, meta, itemType, item.field,
                    `Field "${item.field}" has FLS defined but object "${objectName}" has no Read access.`);
            }
            return null;
        }
    },
    'field-no-permissions': {
        id: 'field-no-permissions',
        type: 'fieldPermission',
        metadata: {
            severity: 'info',
            title: 'Empty field permission entry',
            description: 'This field has neither Read nor Edit access. Consider removing the entry.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: true,
            fixAction: 'remove'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (!item.readable && !item.editable) {
                return makeProblem(this.id, meta, itemType, item.field,
                    `Field "${item.field}" has no access (neither readable nor editable).`);
            }
            return null;
        }
    },

    // ── Class access rules ────────────────────────────────────────────────────

    'class-disabled': {
        id: 'class-disabled',
        type: 'classAccess',
        metadata: {
            severity: 'info',
            title: 'Disabled class access entry',
            description: 'This Apex class access entry is explicitly disabled. Consider removing it.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#classAccesses',
            fixable: true,
            fixAction: 'remove'
        },
        evaluate(profile, item, itemType, meta, ctx) {
            if (!item.enabled) {
                return makeProblem(this.id, meta, itemType, item.apexClass,
                    `Apex class "${item.apexClass}" is explicitly set to disabled.`);
            }
            return null;
        }
    }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates a Salesforce Profile or PermissionSet for structural permission inconsistencies.
 *
 * Rules are defined in `PROFILE_VALIDATION_RULES` (a config-table of evaluators).
 * Each evaluator receives `(profile, item, itemType, ruleMeta)` and returns a problem or null.
 *
 * @example
 * ```typescript
 * const problems = SalesforceProfileValidator.validate(profile);
 * // → [{ id: 'field-editable-not-readable:Account.Name', severity: 'error', … }]
 * ```
 */
export class SalesforceProfileValidator {

    /**
     * The built-in rule config table.  Consumers can add custom rules by mutating
     * or spreading this object before calling `validate`.
     */
    static readonly rules: Record<string, AnyRule> = PROFILE_VALIDATION_RULES;

    /**
     * Run all structural rules (no org connection required).
     */
    static validate(profile: SalesforceUserPermissions): ProfileValidationProblem[] {
        const problems: ProfileValidationProblem[] = [];

        // Build context once for O(1) lookups in evaluators
        const ctx: ProfileValidationContext = {
            objectPermissionsByName: new Map<string, AnyObjectPermission>(
                (profile.objects ?? []).map(op => [op.object, op] as const)
            )
        };

        for (const rule of Object.values(this.rules)) {
            const items = SalesforceProfileValidator.getItemsForType(profile, rule.type);
            for (const item of items) {
                const problem = rule.evaluate(profile, item, rule.type, rule.metadata, ctx);
                if (problem) problems.push(problem);
            }
        }

        return problems;
    }

    /**
     * Run org-level validation (requires a schema service connection).
     * Checks for non-existing objects and fields in the connected org.
     */
    static async validateAgainstOrg(
        profile: SalesforceUserPermissions,
        schemaService: SalesforceSchemaService
    ): Promise<ProfileValidationProblem[]> {
        const problems: ProfileValidationProblem[] = [];

        // Check object permissions against org object list
        try {
            const allObjects = await schemaService.describeSObjects();
            const validObjects = new Set(allObjects.map(o => o.name));
            for (const op of profile.objects ?? []) {
                if (!validObjects.has(op.object)) {
                    problems.push({
                        id: `org-unknown-object:${op.object}`,
                        ruleId: 'org-unknown-object',
                        severity: 'warning',
                        category: 'org-validation',
                        itemType: 'objectPermission',
                        itemName: op.object,
                        message: `Object "${op.object}" does not exist in this org.`,
                        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
                        fixable: true,
                        fixAction: 'remove'
                    });
                }
            }
        } catch {
            // If describe fails, skip object validation
        }

        // Check field permissions against org field list — run all describe calls in parallel
        const objectNamesInFields = [
            ...new Set((profile.fields ?? []).map(f => f.field.split('.')[0]))
        ];

        const describeResults = await Promise.allSettled(
            objectNamesInFields.map(name => schemaService.describeSObject(name, false))
        );

        for (let i = 0; i < objectNamesInFields.length; i++) {
            const result = describeResults[i];
            if (result.status === 'rejected') continue;
            const describe = result.value;
            if (!describe?.fields?.length) continue;

            const objectName = objectNamesInFields[i];
            const validFields = new Set(describe.fields.map(f => `${objectName}.${f.name}`));

            for (const fp of profile.fields ?? []) {
                if (fp.field.startsWith(`${objectName}.`) && !validFields.has(fp.field)) {
                    problems.push({
                        id: `org-unknown-field:${fp.field}`,
                        ruleId: 'org-unknown-field',
                        severity: 'warning',
                        category: 'org-validation',
                        itemType: 'fieldPermission',
                        itemName: fp.field,
                        message: `Field "${fp.field}" does not exist on ${objectName} in this org.`,
                        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
                        fixable: true,
                        fixAction: 'remove'
                    });
                }
            }
        }

        return problems;
    }

    private static getItemsForType(
        profile: SalesforceUserPermissions,
        type: ProfileValidationItemType
    ): unknown[] {
        switch (type) {
            case 'objectPermission': return profile.objects ?? [];
            case 'fieldPermission':  return profile.fields ?? [];
            case 'classAccess':      return profile.classes ?? [];
            case 'pageAccess':       return profile.pages ?? [];
            default:                 return [];
        }
    }
}

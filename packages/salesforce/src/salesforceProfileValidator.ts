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

import { PermissionNameFields, SalesforceUserPermissions, type PermissableSubtype, type PermissionPropertyType, type UserPermissionMetadata } from './salesforceUserPermissions';
import { SalesforceSchemaService } from './salesforceSchemaService';
import type { ProfileObjectPermissions, PermissionSetObjectPermissions } from './types';
import { forEachAsyncParallel, type ArrayElement } from '@vlocode/util';

type AnyObjectPermission = ProfileObjectPermissions | PermissionSetObjectPermissions;

// ─── Problem model ────────────────────────────────────────────────────────────

export type ProfileValidationSeverity = 'error' | 'warning' | 'info';
export type ProfileValidationCategory = 'structural' | 'org-validation' | 'deployment';

// ─── Rule infrastructure ──────────────────────────────────────────────────────

export interface ProfileValidationRuleMetadata {
    title: string;
    description: string;
    docsUrl?: string;
    severity: ProfileValidationSeverity;
}

/**
 * Pre-computed indexes passed to each evaluator to avoid repeated linear scans.
 */
export interface ProfileValidationContext {
    /** Object permissions indexed by object name for O(1) lookup */
    objectPermissionsByName: Map<string, AnyObjectPermission>;
}

export interface PermissionFixFunction<
    TType extends PermissionPropertyType
> {
    /**
     * Apply a fix to the given item in the profile. The profile instance is mutable and changes will be reflected in the caller.
      * @param profile  - The full profile/permset being fixed.
      * @param item     - The individual permission entry to fix (field, object, class, …).
      * @param itemType - The item type string (mirrors `this.type`).
     */
    (
        profile: SalesforceUserPermissions, 
        item: PermissableSubtype<TType>, 
        itemType: TType
    ): void | Promise<void>;
}

export interface PermissionValidationEvalFunction<
    TType extends PermissionPropertyType
> {
    /**
     * Evaluate a single item against this rule.
     * @param profile  - The full profile/permset being validated.
     * @param item     - The individual permission entry (field, object, class, …).
     * @param itemType - The item type string (mirrors `this.type`).
     * @param meta     - This rule's own metadata, for convenience.
     * @param ctx      - Pre-computed indexes for efficient lookups.
     * @returns A `ProfileValidationProblem` if the rule is violated, or `null`.
     */
    (
        ctx:
        {
            item: PermissableSubtype<TType>,
            profile: SalesforceUserPermissions, 
            type: TType, 
            rule: ProfileValidationRuleMetadata
        }
    ): string | ProfileValidationProblem | null;
}

export interface ProfileValidationRule<
    TType extends PermissionPropertyType = PermissionPropertyType
> extends ProfileValidationRuleMetadata{
    id: string;
    type: TType;
    evaluate: PermissionValidationEvalFunction<TType>;
    fixAction?: PermissionFixFunction<TType>;
}

function defineProfileValidationRule<
    const TType extends PermissionPropertyType
>(rule: ProfileValidationRule<TType>): ProfileValidationRule<TType> {
    return rule;
}

function getPermissionItemName<
    TType extends PermissionPropertyType
>(type: TType, item: PermissableSubtype<TType>): string {
    const nameField = PermissionNameFields[type] as unknown as keyof PermissableSubtype<TType>;
    return String(item[nameField]);
}

export interface ProfileValidationProblem {
    /** Unique rule id + item name, e.g. `"field-editable-not-readable:Account.Name"` */
    id: string;
    severity: ProfileValidationSeverity;
    category: ProfileValidationCategory;
    itemType: PermissionPropertyType;
    /** API name of the affected item, e.g. `"Account"` or `"Account.Name"` */
    itemName: string;
    message: string;
    docsUrl?: string;
    /** Whether a Fix action can auto-resolve this problem */
    fixAction?: PermissionFixFunction<any>;
}

/**
 * Built-in structural rules, organised by item type.
 * Add new rules here to extend the validator without touching any other code.
 */
const PROFILE_VALIDATION_RULES = {

    // ── Object permission rules ───────────────────────────────────────────────

    'obj-editable-not-readable': defineProfileValidationRule({
        id: 'obj-editable-not-readable',
        type: 'objectPermissions',
        severity: 'error',
        title: 'Edit without Read',
        description: 'An object with Create, Edit, or Delete access must also have Read access.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
        evaluate({ item }) {
            if ((item.allowCreate || item.allowEdit || item.allowDelete) && !item.allowRead) {
                return `Object "${item.object}" has Create/Edit/Delete but not Read access.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.setObjectPermissions(item.object, { allowRead: true });
        }
    }),

    'obj-viewall-not-readable': defineProfileValidationRule({
        id: 'obj-viewall-not-readable',
        type: 'objectPermissions',
        severity: 'error',
        title: 'View All without Read',
        description: 'View All Records requires Read access on the object.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
        evaluate({ item }) {
            if (item.viewAllRecords && !item.allowRead) {
                return `Object "${item.object}" has View All Records but not Read access.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.setObjectPermissions(item.object, { allowRead: true });
        }
    }),

    'obj-modifyall-incomplete': defineProfileValidationRule({
        id: 'obj-modifyall-incomplete',
        type: 'objectPermissions',
        severity: 'error',
        title: 'Modify All requires all CRUD + View All',
        description: 'Modify All Records requires Read, Create, Edit, Delete, and View All Records.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
        evaluate({ item }) {
            if (item.modifyAllRecords &&
                !(item.allowRead && item.allowCreate && item.allowEdit && item.allowDelete && item.viewAllRecords)) {
                return `Object "${item.object}" has Modify All Records but is missing required lower-level permissions.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.setObjectPermissions(item.object, { modifyAllRecords: true });
        }
    }),

    'obj-no-permissions': defineProfileValidationRule({
        id: 'obj-no-permissions',
        type: 'objectPermissions',
        severity: 'info',
        title: 'Empty object permission entry',
        description: 'This object permission has no access flags set. Consider removing it.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            evaluate({ item }) {
            if (!item.allowRead && !item.allowCreate && !item.allowEdit &&
                !item.allowDelete && !item.viewAllRecords && !item.modifyAllRecords) {
                return `Object "${item.object}" has no permissions set.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.removeObjectPermissions(item.object);
        }
    }),

    // ── Field permission rules ────────────────────────────────────────────────

    'field-editable-not-readable': defineProfileValidationRule({
        id: 'field-editable-not-readable',
        type: 'fieldPermissions',
        severity: 'error',
        title: 'Editable field is not Readable',
        description: 'A field cannot be editable without also being readable.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
        evaluate({ item }) {
            if (item.editable && !item.readable) {
                return `Field "${item.field}" is editable but not readable.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.setFieldPermissions(item.field, true, item.editable);
        }
    }),

    'field-no-object-read': defineProfileValidationRule({
        id: 'field-no-object-read',
        type: 'fieldPermissions',
        severity: 'warning',
        title: 'Field permission without object Read access',
        description: 'This field has permissions defined, but the parent object has no Read access.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
        evaluate({ item, profile }) {
            if (!item.readable && !item.editable) return null;
            const objectName = item.field.split('.')[0];
            const objectPerm = profile.getObjectPermissions(objectName);
            if (!objectPerm?.allowRead) {
                return `Field "${item.field}" has FLS defined but object "${objectName}" has no Read access.`;
            }
            return null;
        }
    }),
    'field-no-permissions': defineProfileValidationRule({
        id: 'field-no-permissions',
        type: 'fieldPermissions',
        severity: 'info',
        title: 'Empty field permission entry',
        description: 'This field has neither Read nor Edit access. Consider removing the entry.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
        evaluate({ item }) {
            if (!item.readable && !item.editable) {
                return `Field "${item.field}" has no access (neither readable nor editable).`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.removeField(item.field);
        }
    }),

    // ── Class access rules ────────────────────────────────────────────────────

    'class-disabled': defineProfileValidationRule({
        id: 'class-disabled',
        type: 'classAccesses',
        severity: 'info',
        title: 'Disabled class access entry',
        description: 'This Apex class access entry is explicitly disabled. Consider removing it.',
        docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#classAccesses',
        evaluate({ item }) {
            if (!item.enabled) {
                return `Apex class "${item.apexClass}" is explicitly set to disabled.`;
            }
            return null;
        },
        fixAction(profile, item) {
            profile.removeClass(item.apexClass);
        }
    })
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
    readonly rules = { ...PROFILE_VALIDATION_RULES } as Record<string, ProfileValidationRule>;

    /**
     * Run all structural rules (no org connection required).
     */
    public validate(profile: SalesforceUserPermissions): ProfileValidationProblem[] {
        const problems: ProfileValidationProblem[] = [];

        for (const rule of Object.values(this.rules)) {
            for (const item of profile.getItemsForType(rule.type) ?? []) {
                const itemName = item[PermissionNameFields[rule.type]];
                const problemOrMessage = rule.evaluate({ profile, item, rule, type: rule.type });

                if (!problemOrMessage) {
                    continue;
                }

                const problem = typeof problemOrMessage === 'string'
                    ? {
                        id: `${rule.id}:${itemName}`,
                        itemType: rule.type,
                        severity: rule.severity,
                        docsUrl: rule.docsUrl,
                        fixAction: rule.fixAction,
                        category: 'structural',
                        itemName: itemName,
                        message: problemOrMessage,
                    }
                    : problemOrMessage;

                problems.push(problem);
            }
        }

        return problems;
    }

    /**
     * Run org-level validation (requires a schema service connection).
     * Checks for non-existing objects and fields in the connected org.
     */
    public async validateAgainstOrg(
        profile: SalesforceUserPermissions,
        schemaService: SalesforceSchemaService
    ): Promise<ProfileValidationProblem[]> {
        const problems: ProfileValidationProblem[] = [];

        // Check object permissions against org object list
        await Promise.all(profile.objects.map(async (op) => {
            const isDefined = await schemaService.isSObjectDefined(op.object);
            if (!isDefined) {
                problems.push({
                    id: `org-unknown-object:${op.object}`,
                    severity: 'warning',
                    category: 'org-validation',
                    itemType: 'objectPermissions',
                    itemName: op.object,
                    message: `Object "${op.object}" does not exist in this org.`,
                    docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
                    fixAction: async () => {
                        profile.removeObjectPermissions(op.object);
                    }
                });
            }
        }));

        // Check field permissions against org field list — run all describe calls in parallel
        await Promise.all(profile.fields.map(async (field) => {
            const [objectName, fieldName] = field.field.split('.');
            const isDefined = await schemaService.isSObjectFieldDefined(objectName, fieldName);
            if (!isDefined) {
                problems.push({
                    id: `org-unknown-field:${field.field}`,
                    severity: 'warning',
                    category: 'org-validation',
                    itemType: 'fieldPermissions',
                    itemName: field.field,
                    message: `Field "${field.field}" does not exist in this org.`,
                    docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
                    fixAction: async () => {
                        profile.removeField(field.field);
                    }
                });
            }
        }));

        return problems;
    }
}
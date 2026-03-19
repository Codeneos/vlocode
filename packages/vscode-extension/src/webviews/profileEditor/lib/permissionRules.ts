/**
 * Permission rule engine for the Profile/PermissionSet editor.
 *
 * Rules are defined as a config table where each entry provides:
 *  - An evaluator function that receives the item being scanned, its type, rule metadata,
 *    and the full profile data.
 *  - Metadata describing the rule (id, severity, title, documentation link).
 *  - An optional fix action hint for the UI.
 *
 * Structural (client-side) rules run without org access. Org-level validation
 * (non-existing fields/objects/classes) is handled server-side via `validatePermissions`.
 */

import type { FieldPermission, ObjectPermission, PermissionProblem, PermissionProblemItemType, PermissionProblemSeverity, ProfileEditorData } from '../types';
import type { Dispatch } from 'react';
import type { AppAction } from '../actions';

// ─── Rule infrastructure ─────────────────────────────────────────────────────

export interface PermissionRuleMetadata {
    id: string;
    severity: PermissionProblemSeverity;
    title: string;
    description: string;
    docsUrl?: string;
    /** Whether this rule supports auto-fix via the Fix button */
    fixable?: boolean;
    /** Hint string passed as fixAction in the PermissionProblem */
    fixAction?: string;
}

export interface PermissionRule<T> {
    id: string;
    type: PermissionProblemItemType;
    metadata: PermissionRuleMetadata;
    /**
     * Evaluate an item against this rule.
     * @returns A PermissionProblem if the rule is violated, null otherwise.
     */
    evaluate(item: T, itemType: PermissionProblemItemType, profile: ProfileEditorData): PermissionProblem | null;
    /**
     * Apply a fix to the item by dispatching an AppAction.
     * Only called when metadata.fixable is true and the user clicks Fix.
     */
    fix?(item: T, dispatch: Dispatch<AppAction>): void;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function makeProblem(
    meta: PermissionRuleMetadata,
    itemType: PermissionProblemItemType,
    itemName: string,
    message: string
): PermissionProblem {
    return {
        id: `${meta.id}:${itemName}`,
        severity: meta.severity,
        category: 'validation',
        itemType,
        itemName,
        message,
        docsUrl: meta.docsUrl,
        fixable: meta.fixable ?? false,
        fixAction: meta.fixAction
    };
}

// ─── Object permission rules ─────────────────────────────────────────────────

const objectRules: PermissionRule<ObjectPermission>[] = [
    {
        id: 'obj-editable-not-readable',
        type: 'objectPermission',
        metadata: {
            id: 'obj-editable-not-readable',
            severity: 'error',
            title: 'Edit without Read',
            description: 'An object with Create, Edit, or Delete access must also have Read access.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(item, itemType, _profile) {
            if ((item.allowCreate || item.allowEdit || item.allowDelete) && !item.allowRead) {
                return makeProblem(this.metadata, itemType, item.objectName,
                    `Object "${item.objectName}" has Create/Edit/Delete but not Read access.`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'changeObject', permission: { ...item, allowRead: true } });
        }
    },
    {
        id: 'obj-viewall-not-readable',
        type: 'objectPermission',
        metadata: {
            id: 'obj-viewall-not-readable',
            severity: 'error',
            title: 'View All without Read',
            description: 'View All Records requires Read access on the object.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(item, itemType, _profile) {
            if (item.viewAllRecords && !item.allowRead) {
                return makeProblem(this.metadata, itemType, item.objectName,
                    `Object "${item.objectName}" has View All Records but not Read access.`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'changeObject', permission: { ...item, allowRead: true } });
        }
    },
    {
        id: 'obj-modifyall-incomplete',
        type: 'objectPermission',
        metadata: {
            id: 'obj-modifyall-incomplete',
            severity: 'error',
            title: 'Modify All requires all CRUD + View All',
            description: 'Modify All Records requires Read, Create, Edit, Delete, and View All Records.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'grant-all'
        },
        evaluate(item, itemType, _profile) {
            if (item.modifyAllRecords && !(item.allowRead && item.allowCreate && item.allowEdit && item.allowDelete && item.viewAllRecords)) {
                return makeProblem(this.metadata, itemType, item.objectName,
                    `Object "${item.objectName}" has Modify All Records but is missing required lower-level permissions.`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'changeObject', permission: {
                ...item,
                allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true,
                viewAllRecords: true, modifyAllRecords: true
            }});
        }
    },
    {
        id: 'obj-no-permissions',
        type: 'objectPermission',
        metadata: {
            id: 'obj-no-permissions',
            severity: 'info',
            title: 'Empty object permission entry',
            description: 'This object permission has no access flags set. Consider removing it.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#objectPermissions',
            fixable: true,
            fixAction: 'remove'
        },
        evaluate(item, itemType, _profile) {
            if (!item.allowRead && !item.allowCreate && !item.allowEdit && !item.allowDelete && !item.viewAllRecords && !item.modifyAllRecords) {
                return makeProblem(this.metadata, itemType, item.objectName,
                    `Object "${item.objectName}" has no permissions set.`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'removeObject', objectName: item.objectName });
        }
    }
];

// ─── Field permission rules ──────────────────────────────────────────────────

const fieldRules: PermissionRule<FieldPermission>[] = [
    {
        id: 'field-editable-not-readable',
        type: 'fieldPermission',
        metadata: {
            id: 'field-editable-not-readable',
            severity: 'error',
            title: 'Editable field is not Readable',
            description: 'A field cannot be editable without also being readable.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: true,
            fixAction: 'grant-read'
        },
        evaluate(item, itemType, _profile) {
            if (item.editable && !item.readable) {
                return makeProblem(this.metadata, itemType, item.fieldName,
                    `Field "${item.fieldName}" is editable but not readable.`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'changeField', permission: { ...item, readable: true } });
        }
    },
    {
        id: 'field-no-object-permission',
        type: 'fieldPermission',
        metadata: {
            id: 'field-no-object-permission',
            severity: 'warning',
            title: 'Field permission without object permission',
            description: 'This field has permissions defined, but the parent object has no Read access.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: false
        },
        evaluate(item, itemType, profile) {
            if (!item.readable && !item.editable) return null;
            const objectPerm = profile.objectPermissions.find(op => op.objectName === item.objectName);
            if (!objectPerm || !objectPerm.allowRead) {
                return makeProblem(this.metadata, itemType, item.fieldName,
                    `Field "${item.fieldName}" has FLS defined but object "${item.objectName}" has no Read access.`);
            }
            return null;
        }
    },
    {
        id: 'field-no-permissions',
        type: 'fieldPermission',
        metadata: {
            id: 'field-no-permissions',
            severity: 'info',
            title: 'Empty field permission entry',
            description: 'This field has neither Read nor Edit access. Consider removing the entry.',
            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm#fieldPermissions',
            fixable: true,
            fixAction: 'remove'
        },
        evaluate(item, itemType, _profile) {
            if (!item.readable && !item.editable) {
                return makeProblem(this.metadata, itemType, item.fieldName,
                    `Field "${item.fieldName}" has no access (neither readable nor editable).`);
            }
            return null;
        },
        fix(item, dispatch) {
            dispatch({ type: 'removeField', fieldName: item.fieldName });
        }
    }
];

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Runs all structural (client-side) permission rules against the given profile data.
 * Returns an array of problems found.
 */
export function scanPermissions(profile: ProfileEditorData): PermissionProblem[] {
    const problems: PermissionProblem[] = [];

    for (const op of profile.objectPermissions) {
        for (const rule of objectRules) {
            const problem = rule.evaluate(op, 'objectPermission', profile);
            if (problem) problems.push(problem);
        }
    }

    for (const fp of profile.fieldPermissions) {
        for (const rule of fieldRules) {
            const problem = rule.evaluate(fp, 'fieldPermission', profile);
            if (problem) problems.push(problem);
        }
    }

    return problems;
}

/**
 * Returns the fix function for a given problem, or undefined if not fixable.
 */
export function getFixForProblem(
    problem: PermissionProblem,
    profile: ProfileEditorData
): ((dispatch: Dispatch<AppAction>) => void) | undefined {
    if (!problem.fixable) return undefined;

    if (problem.itemType === 'objectPermission') {
        const item = profile.objectPermissions.find(op => op.objectName === problem.itemName);
        if (!item) return undefined;
        const rule = objectRules.find(r => problem.id.startsWith(r.id));
        return rule?.fix ? (dispatch) => rule.fix!(item, dispatch) : undefined;
    }

    if (problem.itemType === 'fieldPermission') {
        const item = profile.fieldPermissions.find(fp => fp.fieldName === problem.itemName);
        if (!item) return undefined;
        const rule = fieldRules.find(r => problem.id.startsWith(r.id));
        return rule?.fix ? (dispatch) => rule.fix!(item, dispatch) : undefined;
    }

    return undefined;
}

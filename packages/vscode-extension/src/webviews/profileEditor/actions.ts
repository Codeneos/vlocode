/**
 * Redux-style actions for the Profile/PermissionSet editor.
 * Extracted into a separate file so they can be imported by non-JSX modules
 * (e.g. permissionRules.ts) without requiring the --jsx compiler option.
 */

import type { FieldPermission, ObjectPermission, PermissionProblem, ProfileEditorData, SObjectField } from './types';

export type AppAction =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved' }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'saving' }
    | { type: 'refreshing' }
    | { type: 'validating' }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] }
    | { type: 'orgProblems'; problems: PermissionProblem[] }
    | { type: 'changeObject'; permission: ObjectPermission }
    | { type: 'changeField'; permission: FieldPermission }
    | { type: 'removeObject'; objectName: string }
    | { type: 'removeField'; fieldName: string }
    | { type: 'addObject'; permission: ObjectPermission }
    | { type: 'addField'; permission: FieldPermission };

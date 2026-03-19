/**
 * Shared message types for communication between the VSCode extension and webview panels.
 * These types are used by both the extension backend and the React frontend.
 */

// ─── Profile/PermissionSet Data Types ───────────────────────────────────────

export interface ObjectPermission {
    objectName: string;
    allowRead: boolean;
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    viewAllRecords: boolean;
    modifyAllRecords: boolean;
}

export interface FieldPermission {
    /** Qualified field name in the format "ObjectName.FieldName" */
    fieldName: string;
    objectName: string;
    readable: boolean;
    editable: boolean;
}

export interface ProfileEditorData {
    profileName: string;
    profileType: 'Profile' | 'PermissionSet';
    userLicense?: string;
    description?: string;
    objectPermissions: ObjectPermission[];
    fieldPermissions: FieldPermission[];
    availableObjects?: string[];
    /** Absolute path to source file, if opened from disk */
    filePath?: string;
}

export interface PermissionChanges {
    objectPermissions: ObjectPermission[];
    fieldPermissions: FieldPermission[];
    removedObjectNames: string[];
    removedFieldNames: string[];
}

export interface SObjectField {
    name: string;
    label: string;
    type: string;
}

export interface SObjectDescribe {
    name: string;
    label: string;
    fields: SObjectField[];
}

// ─── Permission Problem Types ────────────────────────────────────────────────

export type PermissionProblemSeverity = 'error' | 'warning' | 'info';
export type PermissionProblemCategory = 'validation' | 'deployment';
export type PermissionProblemItemType = 'objectPermission' | 'fieldPermission' | 'classAccess' | 'general';

export interface PermissionProblem {
    id: string;
    severity: PermissionProblemSeverity;
    category: PermissionProblemCategory;
    itemType: PermissionProblemItemType;
    /** The name of the item that has the problem (e.g., "Account" or "Account.Name") */
    itemName: string;
    message: string;
    docsUrl?: string;
    /** If true, a Fix button can be shown to auto-resolve */
    fixable: boolean;
    /** Hint for the frontend on how to fix (e.g., 'remove', 'grant-read') */
    fixAction?: string;
}

// ─── Message Types (Extension → Webview) ────────────────────────────────────

export type ExtensionMessage =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved'; target: SaveTarget }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] }
    | { type: 'problems'; problems: PermissionProblem[] };

// ─── Message Types (Webview → Extension) ────────────────────────────────────

export type SaveTarget = 'org' | 'file';

export type WebviewMessage =
    | { type: 'ready' }
    | { type: 'save'; changes: PermissionChanges; target: SaveTarget }
    | { type: 'reset' }
    | { type: 'refresh' }
    | { type: 'loadObjects' }
    | { type: 'loadFields'; objectName: string }
    | { type: 'validatePermissions' };

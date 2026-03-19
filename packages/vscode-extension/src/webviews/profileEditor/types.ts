/**
 * Shared types used by the React webview UI.
 * This file mirrors the types from the extension's lib/webview/types.ts.
 */

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

// ─── Permission Problems ─────────────────────────────────────────────────────

export type PermissionProblemSeverity = 'error' | 'warning' | 'info';
export type PermissionProblemCategory = 'validation' | 'deployment';
export type PermissionProblemItemType = 'objectPermission' | 'fieldPermission' | 'classAccess' | 'general';

export interface PermissionProblem {
    id: string;
    severity: PermissionProblemSeverity;
    category: PermissionProblemCategory;
    itemType: PermissionProblemItemType;
    itemName: string;
    message: string;
    docsUrl?: string;
    fixable: boolean;
    fixAction?: string;
}

// ─── Rule Engine ─────────────────────────────────────────────────────────────

export type SaveTarget = 'org' | 'file';

export type ExtensionMessage =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved'; target: SaveTarget }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] }
    | { type: 'problems'; problems: PermissionProblem[] };

export type WebviewMessage =
    | { type: 'ready' }
    | { type: 'save'; changes: PermissionChanges; target: SaveTarget }
    | { type: 'reset' }
    | { type: 'refresh' }
    | { type: 'loadObjects' }
    | { type: 'loadFields'; objectName: string }
    | { type: 'validatePermissions' };

/** VSCode API injected into the webview via acquireVsCodeApi() */
export interface VsCodeApi {
    postMessage(message: WebviewMessage): void;
    getState<T>(): T | undefined;
    setState<T>(state: T): void;
}

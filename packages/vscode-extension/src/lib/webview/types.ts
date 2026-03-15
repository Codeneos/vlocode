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
}

export interface PermissionChanges {
    objectPermissions: ObjectPermission[];
    fieldPermissions: FieldPermission[];
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

// ─── Message Types (Extension → Webview) ────────────────────────────────────

export type ExtensionMessage =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved' }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] };

// ─── Message Types (Webview → Extension) ────────────────────────────────────

export type WebviewMessage =
    | { type: 'ready' }
    | { type: 'save'; changes: PermissionChanges }
    | { type: 'reset' }
    | { type: 'loadObjects' }
    | { type: 'loadFields'; objectName: string };

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

export type ExtensionMessage =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved' }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] };

export type WebviewMessage =
    | { type: 'ready' }
    | { type: 'save'; changes: PermissionChanges }
    | { type: 'reset' }
    | { type: 'loadObjects' }
    | { type: 'loadFields'; objectName: string };

/** VSCode API injected into the webview via acquireVsCodeApi() */
export interface VsCodeApi {
    postMessage(message: WebviewMessage): void;
    getState<T>(): T | undefined;
    setState<T>(state: T): void;
}

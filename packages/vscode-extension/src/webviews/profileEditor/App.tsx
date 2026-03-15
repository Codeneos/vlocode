import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type {
    ExtensionMessage,
    FieldPermission,
    ObjectPermission,
    ProfileEditorData,
    SObjectField,
    WebviewMessage
} from './types';
import { ProfileHeader } from './components/ProfileHeader';
import { FilterBar } from './components/FilterBar';
import { ObjectPermissionsTable } from './components/ObjectPermissionsTable';
import { FieldPermissionsTable } from './components/FieldPermissionsTable';
import { ActionBar } from './components/ActionBar';
import { AddPermissionDialog } from './components/AddPermissionDialog';

type Tab = 'objects' | 'fields';

interface AppState {
    data: ProfileEditorData | null;
    objectChanges: Map<string, ObjectPermission>;
    fieldChanges: Map<string, FieldPermission>;
    status: 'idle' | 'loading' | 'saving' | 'error';
    statusMessage: string;
    availableObjects: string[];
    loadedFields: Map<string, SObjectField[]>;
}

type AppAction =
    | { type: 'init'; data: ProfileEditorData }
    | { type: 'loading'; message?: string }
    | { type: 'saved' }
    | { type: 'reset'; data: ProfileEditorData }
    | { type: 'error'; message: string }
    | { type: 'saving' }
    | { type: 'objectsLoaded'; objects: string[] }
    | { type: 'fieldsLoaded'; objectName: string; fields: SObjectField[] }
    | { type: 'changeObject'; permission: ObjectPermission }
    | { type: 'changeField'; permission: FieldPermission }
    | { type: 'addObject'; permission: ObjectPermission }
    | { type: 'addField'; permission: FieldPermission };

function reducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'init':
            return {
                ...state,
                data: action.data,
                objectChanges: new Map(),
                fieldChanges: new Map(),
                status: 'idle',
                statusMessage: ''
            };
        case 'loading':
            return { ...state, status: 'loading', statusMessage: action.message ?? 'Loading…' };
        case 'saving':
            return { ...state, status: 'saving', statusMessage: 'Saving…' };
        case 'saved':
            return { ...state, objectChanges: new Map(), fieldChanges: new Map(), status: 'idle', statusMessage: '' };
        case 'reset':
            return {
                ...state,
                data: action.data,
                objectChanges: new Map(),
                fieldChanges: new Map(),
                status: 'idle',
                statusMessage: ''
            };
        case 'error':
            return { ...state, status: 'error', statusMessage: action.message };
        case 'objectsLoaded':
            return { ...state, availableObjects: action.objects };
        case 'fieldsLoaded': {
            const loadedFields = new Map(state.loadedFields);
            loadedFields.set(action.objectName, action.fields);
            return { ...state, loadedFields };
        }
        case 'changeObject': {
            const objectChanges = new Map(state.objectChanges);
            objectChanges.set(action.permission.objectName, action.permission);
            // Also update the main data
            if (state.data) {
                const objectPermissions = state.data.objectPermissions.map(op =>
                    op.objectName === action.permission.objectName ? action.permission : op
                );
                return { ...state, objectChanges, data: { ...state.data, objectPermissions } };
            }
            return { ...state, objectChanges };
        }
        case 'changeField': {
            const fieldChanges = new Map(state.fieldChanges);
            fieldChanges.set(action.permission.fieldName, action.permission);
            if (state.data) {
                const fieldPermissions = state.data.fieldPermissions.map(fp =>
                    fp.fieldName === action.permission.fieldName ? action.permission : fp
                );
                return { ...state, fieldChanges, data: { ...state.data, fieldPermissions } };
            }
            return { ...state, fieldChanges };
        }
        case 'addObject': {
            const objectChanges = new Map(state.objectChanges);
            objectChanges.set(action.permission.objectName, action.permission);
            if (state.data) {
                const existing = state.data.objectPermissions.find(op => op.objectName === action.permission.objectName);
                const objectPermissions = existing
                    ? state.data.objectPermissions
                    : [...state.data.objectPermissions, action.permission];
                return { ...state, objectChanges, data: { ...state.data, objectPermissions } };
            }
            return { ...state, objectChanges };
        }
        case 'addField': {
            const fieldChanges = new Map(state.fieldChanges);
            fieldChanges.set(action.permission.fieldName, action.permission);
            if (state.data) {
                const existing = state.data.fieldPermissions.find(fp => fp.fieldName === action.permission.fieldName);
                const fieldPermissions = existing
                    ? state.data.fieldPermissions
                    : [...state.data.fieldPermissions, action.permission];
                return { ...state, fieldChanges, data: { ...state.data, fieldPermissions } };
            }
            return { ...state, fieldChanges };
        }
        default:
            return state;
    }
}

const initialState: AppState = {
    data: null,
    objectChanges: new Map(),
    fieldChanges: new Map(),
    status: 'loading',
    statusMessage: 'Loading profile…',
    availableObjects: [],
    loadedFields: new Map()
};

interface AppProps {
    postMessage: (msg: WebviewMessage) => void;
}

/**
 * Main React application for the Salesforce Profile/PermissionSet editor.
 */
export const App: React.FC<AppProps> = ({ postMessage }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [activeTab, setActiveTab] = useState<Tab>('objects');
    const [filter, setFilter] = useState('');
    const [objectFilter, setObjectFilter] = useState('');
    const [dialogMode, setDialogMode] = useState<'object' | 'field' | null>(null);

    // Listen for messages from the extension
    useEffect(() => {
        const handler = (event: MessageEvent<ExtensionMessage>) => {
            const msg = event.data;
            switch (msg.type) {
                case 'init':
                    dispatch({ type: 'init', data: msg.data });
                    break;
                case 'loading':
                    dispatch({ type: 'loading', message: msg.message });
                    break;
                case 'saved':
                    dispatch({ type: 'saved' });
                    break;
                case 'reset':
                    dispatch({ type: 'reset', data: msg.data });
                    break;
                case 'error':
                    dispatch({ type: 'error', message: msg.message });
                    break;
                case 'objectsLoaded':
                    dispatch({ type: 'objectsLoaded', objects: msg.objects });
                    break;
                case 'fieldsLoaded':
                    dispatch({ type: 'fieldsLoaded', objectName: msg.objectName, fields: msg.fields });
                    break;
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    // Tell the extension we're ready
    useEffect(() => {
        postMessage({ type: 'ready' });
    }, [postMessage]);

    const handleObjectChange = useCallback(
        (perm: ObjectPermission) => dispatch({ type: 'changeObject', permission: perm }),
        []
    );

    const handleFieldChange = useCallback(
        (perm: FieldPermission) => dispatch({ type: 'changeField', permission: perm }),
        []
    );

    const handleSave = useCallback(() => {
        dispatch({ type: 'saving' });
        postMessage({
            type: 'save',
            changes: {
                objectPermissions: Array.from(state.objectChanges.values()),
                fieldPermissions: Array.from(state.fieldChanges.values())
            }
        });
    }, [state.objectChanges, state.fieldChanges, postMessage]);

    const handleReset = useCallback(() => {
        postMessage({ type: 'reset' });
    }, [postMessage]);

    const handleOpenAddDialog = useCallback(
        (mode: 'object' | 'field') => {
            if (state.availableObjects.length === 0) {
                postMessage({ type: 'loadObjects' });
            }
            setDialogMode(mode);
        },
        [state.availableObjects, postMessage]
    );

    const handleAddObject = useCallback(
        (objectName: string) => {
            dispatch({
                type: 'addObject',
                permission: {
                    objectName,
                    allowRead: true,
                    allowCreate: false,
                    allowEdit: false,
                    allowDelete: false,
                    viewAllRecords: false,
                    modifyAllRecords: false
                }
            });
        },
        []
    );

    const handleAddField = useCallback(
        (objectName: string, fieldName: string) => {
            dispatch({
                type: 'addField',
                permission: {
                    fieldName: `${objectName}.${fieldName}`,
                    objectName,
                    readable: true,
                    editable: false
                }
            });
        },
        []
    );

    const totalChanges = state.objectChanges.size + state.fieldChanges.size;
    const hasChanges = totalChanges > 0;

    const filteredObjectCount = useMemo(() => {
        if (!state.data) return 0;
        if (!filter) return state.data.objectPermissions.length;
        return state.data.objectPermissions.filter(p =>
            p.objectName.toLowerCase().includes(filter.toLowerCase())
        ).length;
    }, [state.data, filter]);

    const filteredFieldCount = useMemo(() => {
        if (!state.data) return 0;
        const term = filter.toLowerCase();
        return state.data.fieldPermissions.filter(p => {
            const matchesObject = !objectFilter || p.objectName.toLowerCase().includes(objectFilter.toLowerCase());
            const matchesField = !term || p.objectName.toLowerCase().includes(term) || p.fieldName.toLowerCase().includes(term);
            return matchesObject && matchesField;
        }).length;
    }, [state.data, filter, objectFilter]);

    if (state.status === 'loading' && !state.data) {
        return (
            <div className="loading-state">
                <div className="loading-spinner" />
                <span>{state.statusMessage}</span>
            </div>
        );
    }

    if (state.status === 'error' && !state.data) {
        return (
            <div className="error-state">
                <span className="error-icon">⚠</span>
                <p>{state.statusMessage}</p>
            </div>
        );
    }

    if (!state.data) {
        return (
            <div className="loading-state">
                <div className="loading-spinner" />
                <span>Waiting for data…</span>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Top error / saving banner */}
            {state.status === 'error' && (
                <div className="app__banner app__banner--error">⚠ {state.statusMessage}</div>
            )}
            {state.status === 'loading' && (
                <div className="app__banner app__banner--info">⏳ {state.statusMessage}</div>
            )}

            <ProfileHeader data={state.data} />

            {/* Tabs */}
            <div className="tab-bar" role="tablist">
                <button
                    className={`tab-bar__tab${activeTab === 'objects' ? ' tab-bar__tab--active' : ''}`}
                    onClick={() => setActiveTab('objects')}
                    role="tab"
                    aria-selected={activeTab === 'objects'}
                >
                    Object Permissions
                    <span className="tab-bar__badge">{state.data.objectPermissions.length}</span>
                </button>
                <button
                    className={`tab-bar__tab${activeTab === 'fields' ? ' tab-bar__tab--active' : ''}`}
                    onClick={() => setActiveTab('fields')}
                    role="tab"
                    aria-selected={activeTab === 'fields'}
                >
                    Field-Level Security
                    <span className="tab-bar__badge">{state.data.fieldPermissions.length}</span>
                </button>
            </div>

            {/* Filter bar */}
            <FilterBar
                value={filter}
                onChange={setFilter}
                placeholder={activeTab === 'objects' ? 'Filter objects…' : 'Filter objects / fields…'}
                resultCount={activeTab === 'objects' ? filteredObjectCount : filteredFieldCount}
                totalCount={activeTab === 'objects'
                    ? state.data.objectPermissions.length
                    : state.data.fieldPermissions.length}
            />

            {/* Table area */}
            <div className="table-container" role="table">
                {activeTab === 'objects' ? (
                    <ObjectPermissionsTable
                        permissions={state.data.objectPermissions}
                        filter={filter}
                        onChange={handleObjectChange}
                        onAddObject={() => handleOpenAddDialog('object')}
                    />
                ) : (
                    <FieldPermissionsTable
                        permissions={state.data.fieldPermissions}
                        filter={filter}
                        objectFilter={objectFilter}
                        onChange={handleFieldChange}
                        onAddField={() => handleOpenAddDialog('field')}
                    />
                )}
            </div>

            {/* Floating action bar */}
            <ActionBar
                hasChanges={hasChanges}
                isSaving={state.status === 'saving'}
                onSave={handleSave}
                onReset={handleReset}
                changeCount={totalChanges}
            />

            {/* Add permission dialog */}
            {dialogMode && (
                <AddPermissionDialog
                    mode={dialogMode}
                    availableObjects={state.availableObjects}
                    isOpen={true}
                    onClose={() => setDialogMode(null)}
                    onAddObject={handleAddObject}
                    onAddField={handleAddField}
                    postMessage={postMessage}
                    loadedFields={state.loadedFields}
                />
            )}
        </div>
    );
};

import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type {
    ExtensionMessage,
    FieldPermission,
    ObjectPermission,
    PermissionProblem,
    ProfileEditorData,
    SaveTarget,
    SObjectField,
    WebviewMessage
} from './types';
import type { AppAction } from './actions';
export type { AppAction } from './actions';
import { ProfileHeader } from './components/ProfileHeader';
import { FilterBar } from './components/FilterBar';
import { ObjectPermissionsTable } from './components/ObjectPermissionsTable';
import { FieldPermissionsTable } from './components/FieldPermissionsTable';
import { ActionBar } from './components/ActionBar';
import { AddPermissionDialog } from './components/AddPermissionDialog';
import { ProblemsTable } from './components/ProblemsTable';
import { scanPermissions } from './lib/permissionRules';

type Tab = 'objects' | 'fields' | 'problems';

export interface AppState {
    data: ProfileEditorData | null;
    objectChanges: Map<string, ObjectPermission>;
    fieldChanges: Map<string, FieldPermission>;
    removedObjectNames: Set<string>;
    removedFieldNames: Set<string>;
    status: 'idle' | 'loading' | 'saving' | 'refreshing' | 'validating' | 'error';
    statusMessage: string;
    availableObjects: string[];
    loadedFields: Map<string, SObjectField[]>;
    /** Problems from org validation (server-side) */
    orgProblems: PermissionProblem[];
}

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

function reducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'init':
            return {
                ...state,
                data: action.data,
                objectChanges: new Map(),
                fieldChanges: new Map(),
                removedObjectNames: new Set(),
                removedFieldNames: new Set(),
                status: 'idle',
                statusMessage: '',
                orgProblems: []
            };
        case 'loading':
            return { ...state, status: 'loading', statusMessage: action.message ?? 'Loading…' };
        case 'saving':
            return { ...state, status: 'saving', statusMessage: 'Saving…' };
        case 'refreshing':
            return { ...state, status: 'refreshing', statusMessage: 'Refreshing…' };
        case 'validating':
            return { ...state, status: 'validating', statusMessage: 'Validating…' };
        case 'saved':
            return {
                ...state,
                objectChanges: new Map(),
                fieldChanges: new Map(),
                removedObjectNames: new Set(),
                removedFieldNames: new Set(),
                status: 'idle',
                statusMessage: ''
            };
        case 'reset':
            return {
                ...state,
                data: action.data,
                objectChanges: new Map(),
                fieldChanges: new Map(),
                removedObjectNames: new Set(),
                removedFieldNames: new Set(),
                orgProblems: [],
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
        case 'orgProblems':
            return { ...state, orgProblems: action.problems, status: 'idle', statusMessage: '' };
        case 'changeObject': {
            const objectChanges = new Map(state.objectChanges);
            objectChanges.set(action.permission.objectName, action.permission);
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
        case 'removeObject': {
            const removedObjectNames = new Set(state.removedObjectNames);
            removedObjectNames.add(action.objectName);
            const objectChanges = new Map(state.objectChanges);
            objectChanges.delete(action.objectName);
            if (state.data) {
                const objectPermissions = state.data.objectPermissions.filter(
                    op => op.objectName !== action.objectName
                );
                return { ...state, objectChanges, removedObjectNames, data: { ...state.data, objectPermissions } };
            }
            return { ...state, objectChanges, removedObjectNames };
        }
        case 'removeField': {
            const removedFieldNames = new Set(state.removedFieldNames);
            removedFieldNames.add(action.fieldName);
            const fieldChanges = new Map(state.fieldChanges);
            fieldChanges.delete(action.fieldName);
            if (state.data) {
                const fieldPermissions = state.data.fieldPermissions.filter(
                    fp => fp.fieldName !== action.fieldName
                );
                return { ...state, fieldChanges, removedFieldNames, data: { ...state.data, fieldPermissions } };
            }
            return { ...state, fieldChanges, removedFieldNames };
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
    removedObjectNames: new Set(),
    removedFieldNames: new Set(),
    status: 'loading',
    statusMessage: 'Loading profile…',
    availableObjects: [],
    loadedFields: new Map(),
    orgProblems: []
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

    // Per-tab selection state
    const [objectSelection, setObjectSelection] = useState<Set<string>>(new Set());
    const [fieldSelection, setFieldSelection] = useState<Set<string>>(new Set());

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
                    setObjectSelection(new Set());
                    setFieldSelection(new Set());
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
                case 'problems':
                    dispatch({ type: 'orgProblems', problems: msg.problems });
                    // Auto-switch to problems tab if org errors found
                    if (msg.problems.some(p => p.category === 'deployment')) {
                        setActiveTab('problems');
                    }
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

    // Merge client-side problems with org-side problems
    const allProblems = useMemo(() => {
        if (!state.data) return state.orgProblems;
        const clientProblems = scanPermissions(state.data);
        // Deduplicate by id — org problems take priority
        const orgIds = new Set(state.orgProblems.map(p => p.id));
        return [
            ...state.orgProblems,
            ...clientProblems.filter(p => !orgIds.has(p.id))
        ];
    }, [state.data, state.orgProblems]);

    const problemCount = allProblems.length;
    const problemErrorCount = allProblems.filter(p => p.severity === 'error').length;

    const handleObjectChange = useCallback(
        (perm: ObjectPermission) => dispatch({ type: 'changeObject', permission: perm }),
        []
    );

    const handleFieldChange = useCallback(
        (perm: FieldPermission) => dispatch({ type: 'changeField', permission: perm }),
        []
    );

    const handleRemoveObject = useCallback(
        (objectName: string) => {
            dispatch({ type: 'removeObject', objectName });
            setObjectSelection(prev => { const n = new Set(prev); n.delete(objectName); return n; });
        },
        []
    );

    const handleRemoveField = useCallback(
        (fieldName: string) => {
            dispatch({ type: 'removeField', fieldName });
            setFieldSelection(prev => { const n = new Set(prev); n.delete(fieldName); return n; });
        },
        []
    );

    const handleRemoveSelectedObjects = useCallback(() => {
        for (const name of objectSelection) {
            dispatch({ type: 'removeObject', objectName: name });
        }
        setObjectSelection(new Set());
    }, [objectSelection]);

    const handleRemoveSelectedFields = useCallback(() => {
        for (const name of fieldSelection) {
            dispatch({ type: 'removeField', fieldName: name });
        }
        setFieldSelection(new Set());
    }, [fieldSelection]);

    const handleSave = useCallback((target: SaveTarget) => {
        dispatch({ type: 'saving' });
        postMessage({
            type: 'save',
            target,
            changes: {
                objectPermissions: Array.from(state.objectChanges.values()),
                fieldPermissions: Array.from(state.fieldChanges.values()),
                removedObjectNames: Array.from(state.removedObjectNames),
                removedFieldNames: Array.from(state.removedFieldNames)
            }
        });
    }, [state.objectChanges, state.fieldChanges, state.removedObjectNames, state.removedFieldNames, postMessage]);

    const handleReset = useCallback(() => {
        postMessage({ type: 'reset' });
    }, [postMessage]);

    const handleRefresh = useCallback(() => {
        dispatch({ type: 'refreshing' });
        postMessage({ type: 'refresh' });
    }, [postMessage]);

    const handleValidate = useCallback(() => {
        dispatch({ type: 'validating' });
        postMessage({ type: 'validatePermissions' });
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

    const totalChanges =
        state.objectChanges.size +
        state.fieldChanges.size +
        state.removedObjectNames.size +
        state.removedFieldNames.size;
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
                <i className="codicon codicon-error error-icon" aria-hidden="true" />
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

    const isRefreshing = state.status === 'refreshing';

    return (
        <div className="app">
            {/* Top error / saving banner */}
            {state.status === 'error' && (
                <div className="app__banner app__banner--error">
                    <i className="codicon codicon-error" aria-hidden="true" /> {state.statusMessage}
                </div>
            )}
            {(state.status === 'loading' || state.status === 'saving' || state.status === 'refreshing' || state.status === 'validating') && (
                <div className="app__banner app__banner--info">
                    <i className="codicon codicon-loading codicon-modifier-spin" aria-hidden="true" /> {state.statusMessage}
                </div>
            )}

            <ProfileHeader
                data={state.data}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
            />

            {/* Tabs */}
            <div className="tab-bar" role="tablist">
                <button
                    className={`tab-bar__tab${activeTab === 'objects' ? ' tab-bar__tab--active' : ''}`}
                    onClick={() => setActiveTab('objects')}
                    role="tab"
                    aria-selected={activeTab === 'objects'}
                >
                    <i className="codicon codicon-symbol-class" aria-hidden="true" />
                    Object Permissions
                    <span className="tab-bar__badge">{state.data.objectPermissions.length}</span>
                </button>
                <button
                    className={`tab-bar__tab${activeTab === 'fields' ? ' tab-bar__tab--active' : ''}`}
                    onClick={() => setActiveTab('fields')}
                    role="tab"
                    aria-selected={activeTab === 'fields'}
                >
                    <i className="codicon codicon-symbol-field" aria-hidden="true" />
                    Field-Level Security
                    <span className="tab-bar__badge">{state.data.fieldPermissions.length}</span>
                </button>
                <button
                    className={`tab-bar__tab${activeTab === 'problems' ? ' tab-bar__tab--active' : ''}${problemErrorCount > 0 ? ' tab-bar__tab--has-errors' : ''}`}
                    onClick={() => setActiveTab('problems')}
                    role="tab"
                    aria-selected={activeTab === 'problems'}
                >
                    <i className={`codicon ${problemErrorCount > 0 ? 'codicon-error' : 'codicon-checklist'}`} aria-hidden="true" />
                    Problems
                    {problemCount > 0 && (
                        <span className={`tab-bar__badge${problemErrorCount > 0 ? ' tab-bar__badge--error' : ''}`}>
                            {problemCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter bar (only for object/field tabs) */}
            {activeTab !== 'problems' && (
                <FilterBar
                    value={filter}
                    onChange={setFilter}
                    placeholder={activeTab === 'objects' ? 'Filter objects…' : 'Filter objects / fields…'}
                    resultCount={activeTab === 'objects' ? filteredObjectCount : filteredFieldCount}
                    totalCount={activeTab === 'objects'
                        ? state.data.objectPermissions.length
                        : state.data.fieldPermissions.length}
                />
            )}

            {/* Tab content */}
            <div className="table-container" role="tabpanel">
                {activeTab === 'objects' ? (
                    <ObjectPermissionsTable
                        permissions={state.data.objectPermissions}
                        filter={filter}
                        selection={objectSelection}
                        onChange={handleObjectChange}
                        onRemove={handleRemoveObject}
                        onRemoveSelected={handleRemoveSelectedObjects}
                        onSelectionChange={setObjectSelection}
                        onAddObject={() => handleOpenAddDialog('object')}
                    />
                ) : activeTab === 'fields' ? (
                    <FieldPermissionsTable
                        permissions={state.data.fieldPermissions}
                        filter={filter}
                        objectFilter={objectFilter}
                        selection={fieldSelection}
                        onChange={handleFieldChange}
                        onRemove={handleRemoveField}
                        onRemoveSelected={handleRemoveSelectedFields}
                        onSelectionChange={setFieldSelection}
                        onAddField={() => handleOpenAddDialog('field')}
                    />
                ) : (
                    <ProblemsTable
                        problems={allProblems}
                        data={state.data}
                        dispatch={dispatch}
                        onValidate={handleValidate}
                        isValidating={state.status === 'validating'}
                    />
                )}
            </div>

            {/* Floating action bar */}
            <ActionBar
                hasChanges={hasChanges}
                isSaving={state.status === 'saving'}
                hasFileSource={!!state.data.filePath}
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

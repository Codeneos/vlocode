import React, { useCallback, useRef } from 'react';
import { List } from 'react-window';
import type { ObjectPermission } from '../types';

const OBJECT_COLUMNS: { key: keyof Omit<ObjectPermission, 'objectName'>; label: string; abbr: string }[] = [
    { key: 'allowRead',        label: 'Read',        abbr: 'R'  },
    { key: 'allowCreate',      label: 'Create',      abbr: 'C'  },
    { key: 'allowEdit',        label: 'Edit',        abbr: 'E'  },
    { key: 'allowDelete',      label: 'Delete',      abbr: 'D'  },
    { key: 'viewAllRecords',   label: 'View All',    abbr: 'VA' },
    { key: 'modifyAllRecords', label: 'Modify All',  abbr: 'MA' },
];

const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 40;

interface ObjectPermissionsTableProps {
    permissions: ObjectPermission[];
    filter: string;
    selection: Set<string>;
    onChange: (updated: ObjectPermission) => void;
    onRemove: (objectName: string) => void;
    onRemoveSelected: () => void;
    onSelectionChange: (names: Set<string>) => void;
    onAddObject?: () => void;
}

function highlightMatch(text: string, filter: string): React.ReactNode {
    if (!filter) return text;
    const idx = text.toLowerCase().indexOf(filter.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <strong>{text.slice(idx, idx + filter.length)}</strong>
            {text.slice(idx + filter.length)}
        </>
    );
}

interface ObjectRowRowProps {
    permissions: ObjectPermission[];
    filter: string;
    selection: Set<string>;
    lastClickedIndex: React.MutableRefObject<number | null>;
    onChange: (updated: ObjectPermission) => void;
    onRemove: (objectName: string) => void;
    onSelectionChange: (names: Set<string>) => void;
}

interface ObjectRowComponentProps extends ObjectRowRowProps {
    index: number;
    style: React.CSSProperties;
    ariaAttributes?: Record<string, string | number>;
}

const ObjectRow: React.FC<ObjectRowComponentProps> = ({
    index, permissions, filter, selection, lastClickedIndex,
    onChange, onRemove, onSelectionChange, style
}) => {
    const perm = permissions[index];
    if (!perm) return null;
    const isSelected = selection.has(perm.objectName);

    const handleRowClick = (e: React.MouseEvent) => {
        const name = perm.objectName;
        const next = new Set(selection);

        if (e.shiftKey && lastClickedIndex.current !== null) {
            // Range select
            const from = Math.min(lastClickedIndex.current, index);
            const to = Math.max(lastClickedIndex.current, index);
            for (let i = from; i <= to; i++) {
                next.add(permissions[i].objectName);
            }
        } else if (e.ctrlKey || e.metaKey) {
            // Toggle single
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            lastClickedIndex.current = index;
        } else {
            // Single click without modifier — select only this row
            if (next.size === 1 && next.has(name)) {
                next.clear();
                lastClickedIndex.current = null;
            } else {
                next.clear();
                next.add(name);
                lastClickedIndex.current = index;
            }
        }
        onSelectionChange(next);
    };

    const handleCheck = (key: keyof Omit<ObjectPermission, 'objectName'>, checked: boolean) => {
        const updated = { ...perm, [key]: checked };

        if (key === 'modifyAllRecords' && checked) {
            updated.viewAllRecords = true;
            updated.allowRead = true;
            updated.allowCreate = true;
            updated.allowEdit = true;
            updated.allowDelete = true;
        } else if (key === 'viewAllRecords' && checked) {
            updated.allowRead = true;
        } else if ((key === 'allowCreate' || key === 'allowEdit' || key === 'allowDelete') && checked) {
            updated.allowRead = true;
        } else if (key === 'allowRead' && !checked) {
            updated.allowCreate = false;
            updated.allowEdit = false;
            updated.allowDelete = false;
            updated.viewAllRecords = false;
            updated.modifyAllRecords = false;
        }

        onChange(updated);
    };

    return (
        <div
            className={`table-row${isSelected ? ' table-row--selected' : ''}`}
            style={style}
            role="row"
            onClick={handleRowClick}
            aria-selected={isSelected}
        >
            <div className="table-cell table-cell--name" role="cell">
                {highlightMatch(perm.objectName, filter)}
            </div>
            {OBJECT_COLUMNS.map(col => (
                <div key={col.key} className="table-cell table-cell--check" role="cell">
                    <input
                        type="checkbox"
                        checked={perm[col.key]}
                        onChange={e => handleCheck(col.key, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        aria-label={`${perm.objectName} ${col.label}`}
                    />
                </div>
            ))}
            <div className="table-cell table-cell--row-actions" role="cell">
                <button
                    className="table-row-action-btn table-row-action-btn--remove"
                    onClick={e => { e.stopPropagation(); onRemove(perm.objectName); }}
                    title={`Remove ${perm.objectName} permissions`}
                    aria-label={`Remove ${perm.objectName} permissions`}
                >
                    <i className="codicon codicon-trash" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

/**
 * Virtualized table for object-level permissions.
 * Supports shift-click / ctrl-click multi-row selection and per-row remove actions.
 */
export const ObjectPermissionsTable: React.FC<ObjectPermissionsTableProps> = ({
    permissions,
    filter,
    selection,
    onChange,
    onRemove,
    onRemoveSelected,
    onSelectionChange,
    onAddObject
}) => {
    const filtered = filter
        ? permissions.filter(p => p.objectName.toLowerCase().includes(filter.toLowerCase()))
        : permissions;

    const lastClickedIndex = useRef<number | null>(null);
    const selectedCount = selection.size;

    const rowProps: ObjectRowRowProps = {
        permissions: filtered, filter, selection, lastClickedIndex,
        onChange, onRemove, onSelectionChange
    };

    return (
        <div className="permissions-table">
            {/* Bulk-action bar (shown when rows are selected) */}
            {selectedCount > 0 && (
                <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
                    <span className="bulk-action-bar__count">
                        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        className="bulk-action-bar__btn bulk-action-bar__btn--remove"
                        onClick={onRemoveSelected}
                        title="Remove selected object permissions"
                    >
                        <i className="codicon codicon-trash" aria-hidden="true" /> Remove selected
                    </button>
                    <button
                        className="bulk-action-bar__btn"
                        onClick={() => onSelectionChange(new Set())}
                        title="Clear selection"
                    >
                        <i className="codicon codicon-close" aria-hidden="true" /> Clear selection
                    </button>
                </div>
            )}

            {/* Sticky header */}
            <div className="table-header" style={{ height: HEADER_HEIGHT }} role="rowgroup">
                <div className="table-row table-row--header" role="row">
                    <div className="table-cell table-cell--name table-cell--header" role="columnheader">
                        Object
                        {onAddObject && (
                            <button
                                className="table-add-btn"
                                onClick={onAddObject}
                                title="Add object permission"
                                aria-label="Add object permission"
                            >
                                +
                            </button>
                        )}
                    </div>
                    {OBJECT_COLUMNS.map(col => (
                        <div
                            key={col.key}
                            className="table-cell table-cell--check table-cell--header"
                            role="columnheader"
                            title={col.label}
                        >
                            {col.abbr}
                        </div>
                    ))}
                    <div className="table-cell table-cell--row-actions table-cell--header" role="columnheader" />
                </div>
            </div>

            {/* Virtualized body */}
            <List
                rowCount={filtered.length}
                rowHeight={ROW_HEIGHT}
                rowComponent={ObjectRow}
                rowProps={rowProps}
                style={{ flex: 1, outline: 'none' }}
            />
        </div>
    );
};

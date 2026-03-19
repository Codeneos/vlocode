import React, { useRef } from 'react';
import { List } from 'react-window';
import type { FieldPermission } from '../types';

const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 40;

interface FieldPermissionsTableProps {
    permissions: FieldPermission[];
    filter: string;
    objectFilter: string;
    selection: Set<string>;
    onChange: (updated: FieldPermission) => void;
    onRemove: (fieldName: string) => void;
    onRemoveSelected: () => void;
    onSelectionChange: (names: Set<string>) => void;
    onAddField?: () => void;
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

interface FieldRowRowProps {
    permissions: FieldPermission[];
    filter: string;
    selection: Set<string>;
    lastClickedIndex: React.MutableRefObject<number | null>;
    onChange: (updated: FieldPermission) => void;
    onRemove: (fieldName: string) => void;
    onSelectionChange: (names: Set<string>) => void;
}

interface FieldRowComponentProps extends FieldRowRowProps {
    index: number;
    style: React.CSSProperties;
    ariaAttributes?: Record<string, string | number>;
}

const FieldRow: React.FC<FieldRowComponentProps> = ({
    index, permissions, filter, selection, lastClickedIndex,
    onChange, onRemove, onSelectionChange, style
}) => {
    const perm = permissions[index];
    if (!perm) return null;
    const isSelected = selection.has(perm.fieldName);

    const handleRowClick = (e: React.MouseEvent) => {
        const name = perm.fieldName;
        const next = new Set(selection);

        if (e.shiftKey && lastClickedIndex.current !== null) {
            const from = Math.min(lastClickedIndex.current, index);
            const to = Math.max(lastClickedIndex.current, index);
            for (let i = from; i <= to; i++) {
                next.add(permissions[i].fieldName);
            }
        } else if (e.ctrlKey || e.metaKey) {
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            lastClickedIndex.current = index;
        } else {
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

    const handleReadable = (checked: boolean) => {
        const updated = { ...perm, readable: checked };
        if (!checked) updated.editable = false;
        onChange(updated);
    };

    const handleEditable = (checked: boolean) => {
        const updated = { ...perm, editable: checked };
        if (checked) updated.readable = true;
        onChange(updated);
    };

    const fieldPart = perm.fieldName.includes('.')
        ? perm.fieldName.split('.').slice(1).join('.')
        : perm.fieldName;

    return (
        <div
            className={`table-row${isSelected ? ' table-row--selected' : ''}`}
            style={style}
            role="row"
            onClick={handleRowClick}
            aria-selected={isSelected}
        >
            <div className="table-cell table-cell--name table-cell--object" role="cell">
                {highlightMatch(perm.objectName, filter)}
            </div>
            <div className="table-cell table-cell--name table-cell--field" role="cell">
                {highlightMatch(fieldPart, filter)}
            </div>
            <div className="table-cell table-cell--check" role="cell">
                <input
                    type="checkbox"
                    checked={perm.readable}
                    onChange={e => handleReadable(e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    aria-label={`${perm.fieldName} readable`}
                />
            </div>
            <div className="table-cell table-cell--check" role="cell">
                <input
                    type="checkbox"
                    checked={perm.editable}
                    onChange={e => handleEditable(e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    aria-label={`${perm.fieldName} editable`}
                />
            </div>
            <div className="table-cell table-cell--row-actions" role="cell">
                <button
                    className="table-row-action-btn table-row-action-btn--remove"
                    onClick={e => { e.stopPropagation(); onRemove(perm.fieldName); }}
                    title={`Remove ${perm.fieldName} permissions`}
                    aria-label={`Remove ${perm.fieldName} permissions`}
                >
                    <i className="codicon codicon-trash" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

/**
 * Virtualized table for field-level security (FLS) permissions.
 * Supports shift-click / ctrl-click multi-row selection and per-row remove actions.
 */
export const FieldPermissionsTable: React.FC<FieldPermissionsTableProps> = ({
    permissions,
    filter,
    objectFilter,
    selection,
    onChange,
    onRemove,
    onRemoveSelected,
    onSelectionChange,
    onAddField
}) => {
    const term = filter.toLowerCase();
    const filtered = permissions.filter(p => {
        const matchesObject = !objectFilter || p.objectName.toLowerCase().includes(objectFilter.toLowerCase());
        const matchesField = !term ||
            p.objectName.toLowerCase().includes(term) ||
            p.fieldName.toLowerCase().includes(term);
        return matchesObject && matchesField;
    });

    const lastClickedIndex = useRef<number | null>(null);
    const selectedCount = selection.size;

    const rowProps: FieldRowRowProps = {
        permissions: filtered, filter: term, selection, lastClickedIndex,
        onChange, onRemove, onSelectionChange
    };

    return (
        <div className="permissions-table">
            {/* Bulk-action bar */}
            {selectedCount > 0 && (
                <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
                    <span className="bulk-action-bar__count">
                        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        className="bulk-action-bar__btn bulk-action-bar__btn--remove"
                        onClick={onRemoveSelected}
                        title="Remove selected field permissions"
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
                    <div className="table-cell table-cell--name table-cell--object table-cell--header" role="columnheader">
                        Object
                    </div>
                    <div className="table-cell table-cell--name table-cell--field table-cell--header" role="columnheader">
                        Field
                        {onAddField && (
                            <button
                                className="table-add-btn"
                                onClick={onAddField}
                                title="Add field permission"
                                aria-label="Add field permission"
                            >
                                +
                            </button>
                        )}
                    </div>
                    <div className="table-cell table-cell--check table-cell--header" role="columnheader" title="Readable">
                        R
                    </div>
                    <div className="table-cell table-cell--check table-cell--header" role="columnheader" title="Editable">
                        E
                    </div>
                    <div className="table-cell table-cell--row-actions table-cell--header" role="columnheader" />
                </div>
            </div>

            {/* Virtualized body */}
            <List
                rowCount={filtered.length}
                rowHeight={ROW_HEIGHT}
                rowComponent={FieldRow}
                rowProps={rowProps}
                style={{ flex: 1, outline: 'none' }}
            />
        </div>
    );
};

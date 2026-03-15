import React, { useCallback, useRef, useState } from 'react';
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
    onChange: (updated: ObjectPermission) => void;
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

// Row props spread directly into row component in react-window v2
interface ObjectRowRowProps {
    permissions: ObjectPermission[];
    filter: string;
    onChange: (updated: ObjectPermission) => void;
}

interface ObjectRowComponentProps extends ObjectRowRowProps {
    index: number;
    style: React.CSSProperties;
    ariaAttributes?: Record<string, string | number>;
}

const ObjectRow: React.FC<ObjectRowComponentProps> = ({ index, permissions, filter, onChange, style }) => {
    const perm = permissions[index];
    if (!perm) return null;

    const handleCheck = (key: keyof Omit<ObjectPermission, 'objectName'>, checked: boolean) => {
        const updated = { ...perm, [key]: checked };

        // Enforce Salesforce rules: higher-level perms imply lower ones
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
        <div className="table-row" style={style} role="row">
            <div className="table-cell table-cell--name" role="cell">
                {highlightMatch(perm.objectName, filter)}
            </div>
            {OBJECT_COLUMNS.map(col => (
                <div key={col.key} className="table-cell table-cell--check" role="cell">
                    <input
                        type="checkbox"
                        checked={perm[col.key]}
                        onChange={e => handleCheck(col.key, e.target.checked)}
                        aria-label={`${perm.objectName} ${col.label}`}
                    />
                </div>
            ))}
        </div>
    );
};

/**
 * Virtualized table for object-level permissions.
 * Renders 500+ objects efficiently using react-window.
 */
export const ObjectPermissionsTable: React.FC<ObjectPermissionsTableProps> = ({
    permissions,
    filter,
    onChange,
    onAddObject
}) => {
    const filtered = filter
        ? permissions.filter(p => p.objectName.toLowerCase().includes(filter.toLowerCase()))
        : permissions;

    const rowProps: ObjectRowRowProps = { permissions: filtered, filter, onChange };

    return (
        <div className="permissions-table">
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

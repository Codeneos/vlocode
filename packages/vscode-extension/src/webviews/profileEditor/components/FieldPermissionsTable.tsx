import React, { useCallback } from 'react';
import { List } from 'react-window';
import type { FieldPermission } from '../types';

const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 40;

interface FieldPermissionsTableProps {
    permissions: FieldPermission[];
    filter: string;
    objectFilter: string;
    onChange: (updated: FieldPermission) => void;
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

// Row props spread directly into row component in react-window v2
interface FieldRowRowProps {
    permissions: FieldPermission[];
    filter: string;
    onChange: (updated: FieldPermission) => void;
}

interface FieldRowComponentProps extends FieldRowRowProps {
    index: number;
    style: React.CSSProperties;
    ariaAttributes?: Record<string, string | number>;
}

const FieldRow: React.FC<FieldRowComponentProps> = ({ index, permissions, filter, onChange, style }) => {
    const perm = permissions[index];
    if (!perm) return null;

    const handleReadable = (checked: boolean) => {
        const updated = { ...perm, readable: checked };
        if (!checked) {
            updated.editable = false;
        }
        onChange(updated);
    };

    const handleEditable = (checked: boolean) => {
        const updated = { ...perm, editable: checked };
        if (checked) {
            updated.readable = true;
        }
        onChange(updated);
    };

    const fieldPart = perm.fieldName.includes('.')
        ? perm.fieldName.split('.').slice(1).join('.')
        : perm.fieldName;

    return (
        <div className="table-row" style={style} role="row">
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
                    aria-label={`${perm.fieldName} readable`}
                />
            </div>
            <div className="table-cell table-cell--check" role="cell">
                <input
                    type="checkbox"
                    checked={perm.editable}
                    onChange={e => handleEditable(e.target.checked)}
                    aria-label={`${perm.fieldName} editable`}
                />
            </div>
        </div>
    );
};

/**
 * Virtualized table for field-level security (FLS) permissions.
 * Efficiently renders 800+ fields using react-window.
 */
export const FieldPermissionsTable: React.FC<FieldPermissionsTableProps> = ({
    permissions,
    filter,
    objectFilter,
    onChange,
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

    const rowProps: FieldRowRowProps = { permissions: filtered, filter: term, onChange };

    return (
        <div className="permissions-table">
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

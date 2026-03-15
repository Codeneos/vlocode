import React from 'react';

interface FilterBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    resultCount?: number;
    totalCount?: number;
}

/**
 * A search/filter bar used to narrow down visible rows in permission tables.
 */
export const FilterBar: React.FC<FilterBarProps> = ({
    value,
    onChange,
    placeholder = 'Filter by name…',
    resultCount,
    totalCount
}) => {
    return (
        <div className="filter-bar">
            <div className="filter-bar__input-wrapper">
                <span className="filter-bar__icon">🔍</span>
                <input
                    className="filter-bar__input"
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    spellCheck={false}
                    autoComplete="off"
                />
                {value && (
                    <button
                        className="filter-bar__clear"
                        onClick={() => onChange('')}
                        title="Clear filter"
                        aria-label="Clear filter"
                    >
                        ✕
                    </button>
                )}
            </div>
            {totalCount !== undefined && (
                <span className="filter-bar__count">
                    {resultCount ?? totalCount} / {totalCount}
                </span>
            )}
        </div>
    );
};

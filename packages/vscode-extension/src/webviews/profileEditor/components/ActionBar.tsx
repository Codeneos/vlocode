import React from 'react';

interface ActionBarProps {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => void;
    onReset: () => void;
    changeCount: number;
}

/**
 * Floating action bar fixed to the bottom of the screen.
 * Shows save/reset buttons and unsaved change count.
 */
export const ActionBar: React.FC<ActionBarProps> = ({
    hasChanges,
    isSaving,
    onSave,
    onReset,
    changeCount
}) => {
    if (!hasChanges && !isSaving) {
        return null;
    }

    return (
        <div className="action-bar" role="toolbar" aria-label="Save actions">
            <div className="action-bar__content">
                {changeCount > 0 && (
                    <span className="action-bar__count">
                        {changeCount} unsaved change{changeCount !== 1 ? 's' : ''}
                    </span>
                )}
                <button
                    className="action-bar__btn action-bar__btn--reset"
                    onClick={onReset}
                    disabled={isSaving}
                    aria-label="Reset changes"
                >
                    Reset
                </button>
                <button
                    className="action-bar__btn action-bar__btn--save"
                    onClick={onSave}
                    disabled={isSaving}
                    aria-label="Save changes"
                >
                    {isSaving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    );
};

import React from 'react';
import type { SaveTarget } from '../types';

interface ActionBarProps {
    hasChanges: boolean;
    isSaving: boolean;
    hasFileSource: boolean;
    onSave: (target: SaveTarget) => void;
    onReset: () => void;
    changeCount: number;
}

/**
 * Floating action bar fixed to the bottom of the screen.
 * Shows save-to-org / save-to-file / reset buttons and unsaved change count.
 */
export const ActionBar: React.FC<ActionBarProps> = ({
    hasChanges,
    isSaving,
    hasFileSource,
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
                    <i className="codicon codicon-discard" aria-hidden="true" /> Reset
                </button>
                {hasFileSource && (
                    <button
                        className="action-bar__btn action-bar__btn--save-file"
                        onClick={() => onSave('file')}
                        disabled={isSaving}
                        aria-label="Save changes to source file"
                        title="Save changes to the local source file"
                    >
                        <i className="codicon codicon-save" aria-hidden="true" />
                        {isSaving ? 'Saving…' : 'Save to File'}
                    </button>
                )}
                <button
                    className="action-bar__btn action-bar__btn--save"
                    onClick={() => onSave('org')}
                    disabled={isSaving}
                    aria-label="Save changes to Salesforce org"
                    title="Deploy changes to the connected Salesforce org"
                >
                    <i className="codicon codicon-cloud-upload" aria-hidden="true" />
                    {isSaving ? 'Saving…' : 'Deploy to Org'}
                </button>
            </div>
        </div>
    );
};

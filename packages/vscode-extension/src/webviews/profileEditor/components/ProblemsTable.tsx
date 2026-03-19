import React from 'react';
import type { Dispatch } from 'react';
import type { PermissionProblem, ProfileEditorData } from '../types';
import type { AppAction } from '../actions';

interface ProblemsTableProps {
    problems: PermissionProblem[];
    data: ProfileEditorData;
    dispatch: Dispatch<AppAction>;
    onValidate: () => void;
    isValidating: boolean;
}

const SEVERITY_ICON: Record<string, string> = {
    error: 'codicon-error',
    warning: 'codicon-warning',
    info: 'codicon-info'
};

const CATEGORY_LABEL: Record<string, string> = {
    validation: 'Validation',
    deployment: 'Deployment Error'
};

/**
 * Applies a fix for a problem by dispatching the appropriate action.
 * Looks up current permission state to avoid overwriting existing access flags.
 */
function applyFix(
    problem: PermissionProblem,
    data: ProfileEditorData,
    dispatch: Dispatch<AppAction>
): void {
    const { fixAction, itemType, itemName } = problem;
    if (!fixAction) return;

    if (fixAction === 'remove') {
        if (itemType === 'objectPermission') {
            dispatch({ type: 'removeObject', objectName: itemName });
        } else if (itemType === 'fieldPermission') {
            dispatch({ type: 'removeField', fieldName: itemName });
        }
        return;
    }

    if (fixAction === 'grant-read') {
        if (itemType === 'objectPermission') {
            // Merge with current state — only add allowRead, preserve other flags
            const existing = data.objectPermissions.find(op => op.objectName === itemName);
            if (existing) {
                dispatch({ type: 'changeObject', permission: { ...existing, allowRead: true } });
            }
        } else if (itemType === 'fieldPermission') {
            // Merge with current state — only add readable, preserve editable
            const existing = data.fieldPermissions.find(fp => fp.fieldName === itemName);
            if (existing) {
                dispatch({ type: 'changeField', permission: { ...existing, readable: true } });
            }
        }
        return;
    }

    if (fixAction === 'grant-all' && itemType === 'objectPermission') {
        const existing = data.objectPermissions.find(op => op.objectName === itemName);
        dispatch({
            type: 'changeObject', permission: {
                ...(existing ?? { objectName: itemName }),
                allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true,
                viewAllRecords: true, modifyAllRecords: true
            }
        });
    }
}

/**
 * Problems tab — shows structural and deployment errors for the current profile/permset.
 * Problems are supplied entirely by the backend ({@link SalesforceProfileValidator}).
 */
export const ProblemsTable: React.FC<ProblemsTableProps> = ({
    problems,
    data,
    dispatch,
    onValidate,
    isValidating
}) => {
    const errorCount = problems.filter(p => p.severity === 'error').length;
    const warningCount = problems.filter(p => p.severity === 'warning').length;
    const infoCount = problems.filter(p => p.severity === 'info').length;

    return (
        <div className="problems-panel">
            {/* Toolbar */}
            <div className="problems-toolbar">
                <div className="problems-toolbar__summary">
                    {problems.length === 0 ? (
                        <span className="problems-toolbar__empty">No problems detected</span>
                    ) : (
                        <>
                            {errorCount > 0 && (
                                <span className="problems-toolbar__count problems-toolbar__count--error">
                                    <i className="codicon codicon-error" aria-hidden="true" />
                                    {errorCount}
                                </span>
                            )}
                            {warningCount > 0 && (
                                <span className="problems-toolbar__count problems-toolbar__count--warning">
                                    <i className="codicon codicon-warning" aria-hidden="true" />
                                    {warningCount}
                                </span>
                            )}
                            {infoCount > 0 && (
                                <span className="problems-toolbar__count problems-toolbar__count--info">
                                    <i className="codicon codicon-info" aria-hidden="true" />
                                    {infoCount}
                                </span>
                            )}
                        </>
                    )}
                </div>
                <button
                    className="problems-toolbar__btn"
                    onClick={onValidate}
                    disabled={isValidating}
                    title="Re-run validation against the connected org"
                >
                    <i className={`codicon ${isValidating ? 'codicon-loading codicon-modifier-spin' : 'codicon-refresh'}`} aria-hidden="true" />
                    {isValidating ? 'Validating…' : 'Validate against org'}
                </button>
            </div>

            {/* Problems table */}
            {problems.length > 0 ? (
                <div className="problems-table" role="table" aria-label="Permission problems">
                    {/* Header */}
                    <div className="problems-row problems-row--header" role="row">
                        <div className="problems-cell problems-cell--severity" role="columnheader">Severity</div>
                        <div className="problems-cell problems-cell--category" role="columnheader">Category</div>
                        <div className="problems-cell problems-cell--item" role="columnheader">Item</div>
                        <div className="problems-cell problems-cell--message" role="columnheader">Message</div>
                        <div className="problems-cell problems-cell--actions" role="columnheader"></div>
                    </div>

                    {/* Group by category */}
                    {(['deployment', 'validation'] as const).map(category => {
                        const group = problems.filter(p => p.category === category);
                        if (group.length === 0) return null;
                        return (
                            <React.Fragment key={category}>
                                <div className="problems-group-header" role="row">
                                    <span>
                                        <i
                                            className={`codicon ${category === 'deployment' ? 'codicon-cloud-upload' : 'codicon-checklist'}`}
                                            aria-hidden="true"
                                        />
                                        {CATEGORY_LABEL[category]} ({group.length})
                                    </span>
                                </div>
                                {group.map(problem => (
                                    <ProblemRow
                                        key={problem.id}
                                        problem={problem}
                                        data={data}
                                        dispatch={dispatch}
                                    />
                                ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            ) : (
                <div className="problems-empty">
                    <i className="codicon codicon-pass-filled" aria-hidden="true" />
                    <p>All permissions look good. Run "Validate against org" to check for non-existing fields and objects.</p>
                </div>
            )}
        </div>
    );
};

// ─── Individual problem row ───────────────────────────────────────────────────

interface ProblemRowProps {
    problem: PermissionProblem;
    data: ProfileEditorData;
    dispatch: Dispatch<AppAction>;
}

const ProblemRow: React.FC<ProblemRowProps> = ({ problem, data, dispatch }) => (
    <div
        className={`problems-row problems-row--${problem.severity}`}
        role="row"
        title={problem.message}
    >
        <div className="problems-cell problems-cell--severity" role="cell">
            <i className={`codicon ${SEVERITY_ICON[problem.severity]}`} aria-hidden="true" />
        </div>
        <div className="problems-cell problems-cell--category" role="cell">
            <span className={`problems-badge problems-badge--${problem.category}`}>
                {CATEGORY_LABEL[problem.category]}
            </span>
        </div>
        <div className="problems-cell problems-cell--item" role="cell" title={problem.itemName}>
            {problem.itemName || '—'}
        </div>
        <div className="problems-cell problems-cell--message" role="cell">
            <span className="problems-message">{problem.message}</span>
            {problem.docsUrl && (
                <a
                    className="problems-docs-link"
                    href={problem.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Salesforce documentation"
                    aria-label="Open Salesforce documentation"
                    onClick={e => {
                        e.preventDefault();
                        window.open(problem.docsUrl, '_blank');
                    }}
                >
                    <i className="codicon codicon-link-external" aria-hidden="true" />
                </a>
            )}
        </div>
        <div className="problems-cell problems-cell--actions" role="cell">
            {problem.fixable && (
                <button
                    className="problems-fix-btn"
                    onClick={() => applyFix(problem, data, dispatch)}
                    title="Auto-fix this problem"
                >
                    Fix
                </button>
            )}
        </div>
    </div>
);

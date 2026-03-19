import React from 'react';
import type { ProfileEditorData } from '../types';

interface ProfileHeaderProps {
    data: ProfileEditorData;
    onRefresh: () => void;
    isRefreshing: boolean;
}

/**
 * Displays high-level info about the profile/permission set at the top of the editor.
 * Uses VSCode Codicons for consistent iconography.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data, onRefresh, isRefreshing }) => {
    const objectCount = data.objectPermissions.length;
    const fieldCount = data.fieldPermissions.length;
    const isPermSet = data.profileType !== 'Profile';

    return (
        <div className="profile-header">
            <div className="profile-header__title">
                {/* codicon-account for Profile, codicon-shield for PermissionSet */}
                <i
                    className={`codicon ${isPermSet ? 'codicon-shield profile-header__icon--permissionset' : 'codicon-account'} profile-header__icon`}
                    aria-hidden="true"
                />
                <h1 className="profile-header__name">{data.profileName}</h1>
                <button
                    className="profile-header__refresh-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Refresh from org"
                    aria-label="Refresh from org"
                >
                    <i
                        className={`codicon ${isRefreshing ? 'codicon-loading codicon-modifier-spin' : 'codicon-refresh'}`}
                        aria-hidden="true"
                    />
                </button>
            </div>
            <div className="profile-header__meta">
                {data.userLicense && (
                    <span className="profile-header__tag">
                        <i className="codicon codicon-tag" aria-hidden="true" />
                        {data.userLicense}
                    </span>
                )}
                <span className="profile-header__tag">
                    <i className="codicon codicon-symbol-class" aria-hidden="true" />
                    {objectCount} object{objectCount !== 1 ? 's' : ''}
                </span>
                <span className="profile-header__tag">
                    <i className="codicon codicon-symbol-field" aria-hidden="true" />
                    {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                </span>
                {data.filePath && (
                    <span className="profile-header__tag profile-header__tag--filepath" title={data.filePath}>
                        <i className="codicon codicon-file" aria-hidden="true" />
                        {data.filePath.split(/[\\/]/).pop()}
                    </span>
                )}
                {data.description && (
                    <span className="profile-header__tag profile-header__tag--description">
                        <i className="codicon codicon-info" aria-hidden="true" />
                        {data.description}
                    </span>
                )}
            </div>
        </div>
    );
};

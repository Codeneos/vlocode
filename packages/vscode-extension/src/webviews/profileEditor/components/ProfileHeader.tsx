import React from 'react';
import type { ProfileEditorData } from '../types';

interface ProfileHeaderProps {
    data: ProfileEditorData;
}

/**
 * Displays high-level info about the profile/permission set at the top of the editor.
 * Uses VSCode Codicons for consistent iconography.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data }) => {
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

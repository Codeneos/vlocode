import React from 'react';
import type { ProfileEditorData } from '../types';

interface ProfileHeaderProps {
    data: ProfileEditorData;
}

/**
 * Displays high-level info about the profile/permission set at the top of the editor.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data }) => {
    const objectCount = data.objectPermissions.length;
    const fieldCount = data.fieldPermissions.length;

    return (
        <div className="profile-header">
            <div className="profile-header__title">
                <span className="profile-header__badge">
                    {data.profileType === 'Profile' ? '👤' : '🔑'}
                </span>
                <h1 className="profile-header__name">{data.profileName}</h1>
            </div>
            <div className="profile-header__meta">
                {data.userLicense && (
                    <span className="profile-header__tag">
                        <strong>License:</strong> {data.userLicense}
                    </span>
                )}
                <span className="profile-header__tag">
                    <strong>Objects:</strong> {objectCount}
                </span>
                <span className="profile-header__tag">
                    <strong>Fields:</strong> {fieldCount}
                </span>
                {data.description && (
                    <span className="profile-header__tag profile-header__tag--description">
                        {data.description}
                    </span>
                )}
            </div>
        </div>
    );
};

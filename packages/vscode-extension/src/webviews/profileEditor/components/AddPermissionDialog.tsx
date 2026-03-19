import React, { useState, useEffect } from 'react';
import type { SObjectField, WebviewMessage } from '../types';

interface AddPermissionDialogProps {
    mode: 'object' | 'field';
    availableObjects: string[];
    isOpen: boolean;
    onClose: () => void;
    onAddObject: (objectName: string) => void;
    onAddField: (objectName: string, fieldName: string) => void;
    postMessage: (msg: WebviewMessage) => void;
    loadedFields: Map<string, SObjectField[]>;
}

/**
 * Dialog for adding new object or field permissions.
 */
export const AddPermissionDialog: React.FC<AddPermissionDialogProps> = ({
    mode,
    availableObjects,
    isOpen,
    onClose,
    onAddObject,
    onAddField,
    postMessage,
    loadedFields
}) => {
    const [selectedObject, setSelectedObject] = useState('');
    const [selectedField, setSelectedField] = useState('');
    const [objectFilter, setObjectFilter] = useState('');
    const [loadingFields, setLoadingFields] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedObject('');
            setSelectedField('');
            setObjectFilter('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedObject && mode === 'field' && !loadedFields.has(selectedObject)) {
            setLoadingFields(true);
            postMessage({ type: 'loadFields', objectName: selectedObject });
        } else {
            setLoadingFields(false);
        }
    }, [selectedObject, mode, loadedFields, postMessage]);

    useEffect(() => {
        if (loadedFields.has(selectedObject)) {
            setLoadingFields(false);
        }
    }, [loadedFields, selectedObject]);

    if (!isOpen) return null;

    const filteredObjects = objectFilter
        ? availableObjects.filter(o => o.toLowerCase().includes(objectFilter.toLowerCase()))
        : availableObjects;

    const fields = loadedFields.get(selectedObject) ?? [];

    const handleConfirm = () => {
        if (mode === 'object' && selectedObject) {
            onAddObject(selectedObject);
            onClose();
        } else if (mode === 'field' && selectedObject && selectedField) {
            onAddField(selectedObject, selectedField);
            onClose();
        }
    };

    return (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
            <div className="dialog">
                <div className="dialog__header">
                    <h2 className="dialog__title">
                        {mode === 'object' ? 'Add Object Permission' : 'Add Field Permission'}
                    </h2>
                    <button className="dialog__close" onClick={onClose} aria-label="Close dialog">
                        <i className="codicon codicon-close" aria-hidden="true" />
                    </button>
                </div>

                <div className="dialog__body">
                    <div className="dialog__field">
                        <label className="dialog__label">Object</label>
                        <input
                            className="dialog__input"
                            type="text"
                            placeholder="Filter objects…"
                            value={objectFilter}
                            onChange={e => setObjectFilter(e.target.value)}
                        />
                        <select
                            className="dialog__select"
                            size={8}
                            value={selectedObject}
                            onChange={e => {
                                setSelectedObject(e.target.value);
                                setSelectedField('');
                            }}
                        >
                            {filteredObjects.map(obj => (
                                <option key={obj} value={obj}>{obj}</option>
                            ))}
                        </select>
                    </div>

                    {mode === 'field' && selectedObject && (
                        <div className="dialog__field">
                            <label className="dialog__label">Field</label>
                            {loadingFields ? (
                                <span className="dialog__loading">Loading fields…</span>
                            ) : (
                                <select
                                    className="dialog__select"
                                    size={8}
                                    value={selectedField}
                                    onChange={e => setSelectedField(e.target.value)}
                                >
                                    {fields.map(f => (
                                        <option key={f.name} value={f.name}>
                                            {f.name} ({f.type})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                <div className="dialog__footer">
                    <button className="dialog__btn dialog__btn--cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="dialog__btn dialog__btn--confirm"
                        onClick={handleConfirm}
                        disabled={!selectedObject || (mode === 'field' && !selectedField)}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

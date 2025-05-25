// Ensure this import is present if your CSS loader supports it, otherwise ensure CSS is linked in ReactPanel
// For webviews, linking in ReactPanel.tsx is the standard way.
// import './omniScriptEditor.css'; 
import * as React from 'react';
import { NavigationSidebar, OmniScriptItem } from './NavigationSidebar';
import { MainView } from './MainView';
import { transformOmniScriptJson, updateRawElementProperty, updateRawElementOrder } from './omniScriptUtils';

export interface OmniScriptEditorProps {
    omniScriptJson?: string; // Made optional for initial render before data is loaded
}

export const OmniScriptEditor: React.FC<OmniScriptEditorProps> = ({ omniScriptJson }) => {
    const [selectedItem, setSelectedItem] = React.useState<OmniScriptItem | null>(null);
    const [sidebarItems, setSidebarItems] = React.useState<OmniScriptItem[]>([]);
    const [rawScriptData, setRawScriptData] = React.useState<any | null>(null);
    const [saveStatus, setSaveStatus] = React.useState<string | null>(null);

    const vscodeApiRef = React.useRef(typeof window !== 'undefined' ? window.vscodeApi : null);

    React.useEffect(() => {
        if (omniScriptJson) {
            const transformed = transformOmniScriptJson(omniScriptJson);
            if (transformed) {
                setSidebarItems(transformed.items);
                setRawScriptData(transformed.rawJson);
                setSelectedItem(null);
                setSaveStatus(null);
            } else {
                setSidebarItems([]);
                setRawScriptData(null);
                setSaveStatus('Error: Could not transform OmniScript JSON.');
            }
        }
    }, [omniScriptJson]);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.command) {
                case 'saveComplete':
                    setSaveStatus(message.message || 'Save successful!');
                    setTimeout(() => setSaveStatus(null), 3000);
                    break;
                case 'saveError':
                    setSaveStatus(message.message || 'Save failed.');
                    break;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleSelectItem = (item: OmniScriptItem) => {
        setSelectedItem(item);
    };

    const handlePropertyChange = (elementId: string, propertyKey: string, newValue: any) => {
        if (!rawScriptData) return;
        setSaveStatus(null);

        const newRawScriptData = JSON.parse(JSON.stringify(rawScriptData));
        if (updateRawElementProperty(newRawScriptData, elementId, propertyKey, newValue)) {
            setRawScriptData(newRawScriptData);
            if (selectedItem && selectedItem.id === elementId) {
                const updatedSelectedItem = {
                    ...selectedItem,
                    properties: { ...selectedItem.properties, [propertyKey]: newValue }
                };
                if (propertyKey === 'Name') {
                    updatedSelectedItem.content = newValue;
                }
                setSelectedItem(updatedSelectedItem);
            }
            if (propertyKey === 'Name') {
                setSidebarItems(prevItems => prevItems.map(item => item.id === elementId ? {...item, content: newValue, properties: {...item.properties, Name: newValue}} : item));
            }
        } else {
            console.warn(`Failed to update property ${propertyKey} for element ${elementId}`);
        }
    };

    const handleStructureChange = (movedItemId: string, newParentId: string | undefined, newIndex: number, reorderedSidebarItems: OmniScriptItem[]) => {
        if (!rawScriptData) return;
        setSaveStatus(null);

        const newRawScriptData = JSON.parse(JSON.stringify(rawScriptData));
        if (updateRawElementOrder(newRawScriptData, movedItemId, newParentId, newIndex, reorderedSidebarItems)) {
            setRawScriptData(newRawScriptData);
            setSidebarItems(reorderedSidebarItems);
            const movedItemNewData = reorderedSidebarItems.find(item => item.id === movedItemId);
            if (movedItemNewData && selectedItem?.id === movedItemId) {
                setSelectedItem(movedItemNewData);
            }
        } else {
            console.warn(`Failed to update structure for element ${movedItemId}`);
        }
    };

    const handleSave = () => {
        if (!rawScriptData) {
            setSaveStatus('Error: No data to save.');
            return;
        }
        const vscode = vscodeApiRef.current;
        if (vscode) {
            vscode.postMessage({
                command: 'saveScript',
                data: JSON.stringify(rawScriptData, null, 4)
            });
        } else {
            setSaveStatus('Error: VSCode API not available. Cannot save.');
            console.error("VSCode API not available for saving.");
        }
    };

    if (!omniScriptJson) {
        return <div className="main-view-placeholder">Loading OmniScript data...</div>;
    }

    if (!rawScriptData && omniScriptJson) {
        return <div className="main-view-placeholder">{saveStatus || 'Error loading or parsing OmniScript. Check console for details.'}</div>;
    }

    return (
        <div className="omni-script-editor">
            <div className="editor-top-bar">
                <h2 className="editor-title">OmniScript: {rawScriptData?.Name || 'Unnamed Script'}</h2>
                <div>
                    <button onClick={handleSave} className="vscode-button">Save</button>
                    {saveStatus && (
                        <span className={`save-status ${saveStatus.startsWith('Error') ? 'error' : 'success'}`}>
                            {saveStatus}
                        </span>
                    )}
                </div>
            </div>
            <div className="editor-main-area">
                <NavigationSidebar
                    initialItems={sidebarItems}
                onSelectItem={handleSelectItem}
                selectedItemId={selectedItem?.id || null}
                onStructureChange={handleStructureChange}
            />
            <MainView selectedElement={selectedItem} onPropertyChange={handlePropertyChange} />
        </div>
    );
};

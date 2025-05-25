import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Define the type for an OmniScript item
export interface OmniScriptItem {
    id: string;
    content: string;
    type: string;
    parentId?: string;
    properties?: { [key: string]: any };
}

// Helper function to reorder the list
const reorder = (list: ReadonlyArray<OmniScriptItem>, startIndex: number, endIndex: number): OmniScriptItem[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

interface NavigationSidebarProps {
    initialItems: OmniScriptItem[];
    onSelectItem: (item: OmniScriptItem) => void;
    selectedItemId: string | null;
    onStructureChange: (movedItemId: string, newParentId: string | undefined, newIndex: number, reorderedItems: OmniScriptItem[]) => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ initialItems, onSelectItem, selectedItemId, onStructureChange }) => {
    const [items, setItems] = React.useState<OmniScriptItem[]>(initialItems);

    React.useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }
        if (result.source.droppableId !== result.destination.droppableId) {
            console.warn("Cross-droppable reordering not yet implemented.");
            return;
        }
        const reorderedItems = reorder(
            items,
            result.source.index,
            result.destination.index
        );
        setItems(reorderedItems);
        const movedItem = reorderedItems[result.destination.index];
        onStructureChange(movedItem.id, movedItem.parentId, result.destination.index, reorderedItems);
    };

    return (
        <div className="navigation-sidebar">
            <h3>OmniScript Structure</h3>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sidebarDroppable">
                    {(provided) => (
                        <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="sidebar-list"
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => {
                                        const classNames = [
                                            "sidebar-list-item",
                                            snapshot.isDragging ? "dragging" : "",
                                            item.id === selectedItemId ? "selected" : ""
                                        ].filter(Boolean).join(" ");

                                        return (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => onSelectItem(item)}
                                                className={classNames}
                                                style={{...provided.draggableProps.style}} // react-beautiful-dnd needs its style prop applied
                                            >
                                                {item.content} <span className="sidebar-item-type">[{item.type}]</span>
                                            </li>
                                        );
                                    }}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

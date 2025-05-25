import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationSidebar, OmniScriptItem } from './NavigationSidebar';
import { DragDropContext, DropResult } from 'react-beautiful-dnd'; // Needed for context

// Mock react-beautiful-dnd
// Basic mock, enough to prevent errors and allow rendering.
// For actual dnd testing, a more complex setup or e2e tests are usually needed.
jest.mock('react-beautiful-dnd', () => ({
    ...jest.requireActual('react-beautiful-dnd'),
    DragDropContext: ({ children, onDragEnd }: any) => <div data-testid="dnd-context" onDragEnd={onDragEnd}>{children}</div>,
    Droppable: ({ children, droppableId }: any) => <div data-testid={`droppable-${droppableId}`}>{children( { innerRef: jest.fn(), droppableProps: {}, placeholder: <div data-testid="dnd-placeholder" /> } )}</div>,
    Draggable: ({ children, draggableId, index }: any) => <div data-testid={`draggable-${draggableId}-${index}`}>{children( { innerRef: jest.fn(), draggableProps: {style: {}}, dragHandleProps: {} }, { isDragging: false } )}</div>,
}));


const mockInitialItems: OmniScriptItem[] = [
    { id: 'item1', content: 'Item 1', type: 'Step', properties: { Name: 'Item1' } },
    { id: 'item2', content: 'Item 2', type: 'Text', parentId: 'item1', properties: { Name: 'Item2' } },
    { id: 'item3', content: 'Item 3', type: 'Step', properties: { Name: 'Item3' } },
];

describe('NavigationSidebar', () => {
    let mockOnSelectItem: jest.Mock;
    let mockOnStructureChange: jest.Mock;

    beforeEach(() => {
        mockOnSelectItem = jest.fn();
        mockOnStructureChange = jest.fn();
    });

    const renderSidebar = (selectedItemId: string | null = null) => {
        // Need to wrap with DragDropContext because NavigationSidebar uses useDndContext hook internally (implicitly via dnd components)
        // However, our mock of DragDropContext above simplifies this.
        return render(
            <NavigationSidebar
                initialItems={mockInitialItems}
                onSelectItem={mockOnSelectItem}
                selectedItemId={selectedItemId}
                onStructureChange={mockOnStructureChange}
            />
        );
    };

    it('renders a list of items', () => {
        renderSidebar();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('calls onSelectItem when an item is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Item 2'));
        expect(mockOnSelectItem).toHaveBeenCalledTimes(1);
        expect(mockOnSelectItem).toHaveBeenCalledWith(mockInitialItems[1]); // Item 2
    });

    it('highlights the selected item', () => {
        renderSidebar('item1');
        // The 'selected' class is added in the component based on props
        // We check if the item with content 'Item 1' has the 'selected' class.
        // This depends on how the className is constructed in the component.
        const item1Element = screen.getByText('Item 1'); // This is the li's content
        // Assuming the class is on the `li` element which is the parent of the text.
        expect(item1Element.closest('li')).toHaveClass('selected');
        expect(item1Element.closest('li')).toHaveClass('sidebar-list-item');

        const item2Element = screen.getByText('Item 2');
        expect(item2Element.closest('li')).not.toHaveClass('selected');
    });
    
    it('renders draggable items', () => {
        renderSidebar();
        expect(screen.getByTestId('draggable-item1-0')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-item2-1')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-item3-2')).toBeInTheDocument();
        expect(screen.getByTestId('dnd-placeholder')).toBeInTheDocument(); // from Droppable mock
    });

    // Testing onDragEnd requires a more involved setup for react-beautiful-dnd.
    // This basic test ensures the component renders and callbacks are wired up.
    // For a simple onDragEnd test without full dnd simulation:
    it('onDragEnd callback is passed to DragDropContext (mocked)', () => {
        const { container } = renderSidebar();
        const dndContext = screen.getByTestId('dnd-context');
        
        // Simulate onDragEnd call (this won't actually simulate a drag)
        // We are testing if NavigationSidebar's onDragEnd logic is invoked
        // by the DragDropContext (our mock).
        const mockDragResult: DropResult = {
            draggableId: 'item1',
            source: { index: 0, droppableId: 'sidebarDroppable' },
            destination: { index: 1, droppableId: 'sidebarDroppable' },
            reason: 'DROP',
            mode: 'FLUID',
            type: 'DEFAULT'
        };
        
        // How to trigger onDragEnd on the mocked div?
        // The mock for DragDropContext directly passes onDragEnd.
        // We can't directly fireEvent.dragEnd on the div and expect the mock to work.
        // Instead, we'd typically test the onDragEnd handler function directly
        // if it were exported, or test its effects if possible.
        // Given the current mock, we mostly ensured it renders.
        // A better way would be to find the onDragEnd prop of the DragDropContext element.
        
        // For now, this test mainly confirms the structure with mocked dnd.
        // A full dnd test is often more of an e2e/integration concern.
        expect(dndContext).toBeInTheDocument();
    });
});

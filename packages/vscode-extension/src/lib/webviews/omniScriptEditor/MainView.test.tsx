import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainView } from './MainView';
import { OmniScriptItem } from './NavigationSidebar'; // Assuming this type is available

const mockSelectedElement: OmniScriptItem = {
    id: 'elem1',
    content: 'Test Element 1',
    type: 'Text',
    properties: {
        name: 'TestElement1Name',
        label: 'Enter Text',
        required: true,
        maxLength: 100,
        someObject: { nestedKey: 'nestedValue' }
    },
};

const mockEmptySelectedElement: OmniScriptItem = {
    id: 'elem2',
    content: 'Test Element 2 (No Props)',
    type: 'Checkbox',
    properties: {}, // No properties defined initially
};


describe('MainView', () => {
    let mockOnPropertyChange: jest.Mock;

    beforeEach(() => {
        mockOnPropertyChange = jest.fn();
    });

    it('shows a placeholder when no item is selected', () => {
        render(<MainView selectedElement={null} onPropertyChange={mockOnPropertyChange} />);
        expect(screen.getByText('Select an element from the sidebar to see its properties.')).toBeInTheDocument();
    });

    it('displays properties of the selected element', () => {
        render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        
        expect(screen.getByLabelText('name:')).toBeInTheDocument();
        expect(screen.getByLabelText('name:')).toHaveValue(mockSelectedElement.properties!.name);

        expect(screen.getByLabelText('label:')).toBeInTheDocument();
        expect(screen.getByLabelText('label:')).toHaveValue(mockSelectedElement.properties!.label);
        
        expect(screen.getByLabelText('required')).toBeInTheDocument(); // For checkbox, label is the text next to it
        expect(screen.getByLabelText('required')).toBeChecked();

        expect(screen.getByLabelText('maxLength:')).toBeInTheDocument();
        expect(screen.getByLabelText('maxLength:')).toHaveValue(mockSelectedElement.properties!.maxLength);
    });

    it('displays read-only JSON for object/array properties', () => {
        render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        const objectTextarea = screen.getByLabelText('someObject (read-only):') as HTMLTextAreaElement;
        expect(objectTextarea).toBeInTheDocument();
        expect(objectTextarea.value).toBe(JSON.stringify(mockSelectedElement.properties!.someObject, null, 2));
        expect(objectTextarea).toHaveAttribute('readonly');
    });

    it('calls onPropertyChange when a string property is changed', () => {
        render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        const labelInput = screen.getByLabelText('label:');
        fireEvent.change(labelInput, { target: { value: 'New Label Text' } });
        expect(mockOnPropertyChange).toHaveBeenCalledTimes(1);
        expect(mockOnPropertyChange).toHaveBeenCalledWith(mockSelectedElement.id, 'label', 'New Label Text');
    });

    it('calls onPropertyChange when a boolean property (checkbox) is changed', () => {
        render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        const requiredCheckbox = screen.getByLabelText('required');
        fireEvent.click(requiredCheckbox); // Uncheck it
        expect(mockOnPropertyChange).toHaveBeenCalledTimes(1);
        expect(mockOnPropertyChange).toHaveBeenCalledWith(mockSelectedElement.id, 'required', false);
    });

    it('calls onPropertyChange when a number property is changed', () => {
        render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        const maxLengthInput = screen.getByLabelText('maxLength:');
        fireEvent.change(maxLengthInput, { target: { value: '150' } });
        expect(mockOnPropertyChange).toHaveBeenCalledTimes(1);
        expect(mockOnPropertyChange).toHaveBeenCalledWith(mockSelectedElement.id, 'maxLength', 150);
    });
    
    it('renders correctly even if selectedElement.properties is initially empty or undefined', () => {
        render(<MainView selectedElement={mockEmptySelectedElement} onPropertyChange={mockOnPropertyChange} />);
        expect(screen.getByText('Test Element 2 (No Props) Properties')).toBeInTheDocument();
        // Check that no input fields are rendered if properties is empty
        // This assumes that Object.entries({}).map(...) results in nothing being rendered.
        const form = screen.getByRole('form'); // The form is still rendered
        expect(form.children.length).toBe(0); // No property fields within the form
    });

    it('updates displayed values when selectedElement prop changes', () => {
        const { rerender } = render(<MainView selectedElement={mockSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        expect(screen.getByLabelText('label:')).toHaveValue('Enter Text');

        const newSelectedElement = {
            ...mockSelectedElement,
            properties: { ...mockSelectedElement.properties, label: 'Updated Label Text' }
        };
        rerender(<MainView selectedElement={newSelectedElement} onPropertyChange={mockOnPropertyChange} />);
        expect(screen.getByLabelText('label:')).toHaveValue('Updated Label Text');
    });
});

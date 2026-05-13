import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MonacoEditorComponent, type monaco } from '../monaco-editor/monaco-editor.component';

const jsonEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    folding: true,
    foldingStrategy: 'auto',
    lineDecorationsWidth: 24,
    lineNumbersMinChars: 5,
    showFoldingControls: 'always'
};

@Component({
    selector: 'dm-json-editor',
    standalone: true,
    imports: [MonacoEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <dm-monaco-editor
            language="json"
            [value]="value()"
            [readOnly]="readOnly()"
            [ariaLabel]="ariaLabel()"
            [options]="jsonEditorOptions"
            markerOwner="dm-json-editor"
            (valueChange)="valueChange.emit($event)" />
    `
})
export class JsonEditorComponent {
    protected readonly jsonEditorOptions = jsonEditorOptions;
    readonly value = input('');
    readonly readOnly = input(false);
    readonly ariaLabel = input('JSON editor');

    readonly valueChange = output<string>();
}

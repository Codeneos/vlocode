import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MonacoEditorComponent, type monaco } from '../monaco-editor/monaco-editor.component';

const jsonEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'always'
};

@Component({
    selector: 'vlocode-json-editor',
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
            markerOwner="vlocode-json-editor"
            (valueChange)="valueChange.emit($event)" />
    `
})
export class VlocodeJsonEditorComponent {
    protected readonly jsonEditorOptions = jsonEditorOptions;

    readonly ariaLabel = input('JSON editor');
    readonly readOnly = input(false);
    readonly value = input('');

    readonly valueChange = output<string>();
}

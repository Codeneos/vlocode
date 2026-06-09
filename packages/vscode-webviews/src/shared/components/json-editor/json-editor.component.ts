import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeMonacoEditorComponent, type monaco } from '../monaco-editor/monaco-editor.component';

const jsonEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'always'
};

@Component({
    selector: 'vlo-json-editor',
    standalone: true,
    imports: [VlocodeMonacoEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <vlo-monaco-editor
            language="json"
            [value]="value()"
            [readOnly]="readOnly()"
            [ariaLabel]="ariaLabel()"
            [options]="jsonEditorOptions"
            markerOwner="vlo-json-editor"
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

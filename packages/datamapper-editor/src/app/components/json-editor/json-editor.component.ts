import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';

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
            markerOwner="dm-json-editor"
            (valueChange)="valueChange.emit($event)" />
    `
})
export class JsonEditorComponent {
    readonly value = input('');
    readonly readOnly = input(false);
    readonly ariaLabel = input('JSON editor');

    readonly valueChange = output<string>();
}

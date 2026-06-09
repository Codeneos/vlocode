import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeMonacoEditorComponent, type monaco } from '../../../../../shared/components/monaco-editor/monaco-editor.component';

@Component({
    selector: 'ip-json-tab',
    standalone: true,
    imports: [VlocodeMonacoEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-json-tab.component.html'
})
export class IpJsonTabComponent {
    readonly draft = input.required<string>();
    readonly editorOptions = input.required<monaco.editor.IStandaloneEditorConstructionOptions>();
    readonly error = input<string | undefined>();
    readonly targetLabel = input.required<string>();

    readonly applyJson = output<void>();
    readonly draftChange = output<string>();
}

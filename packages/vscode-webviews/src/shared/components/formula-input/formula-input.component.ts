import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { inputValue } from '../../utils/dom-events';
import { VlocodeDialogComponent } from '../dialog/dialog.component';
import { VlocodeFormulaEditorComponent } from '../formula-editor/formula-editor.component';

@Component({
    selector: 'vlo-formula-input',
    standalone: true,
    imports: [VlocodeDialogComponent, VlocodeFormulaEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span class="vlocode-formula-input" [class.vlocode-formula-input--with-button]="formulaEnabled()">
            <input
                class="vlocode-formula-input__control"
                [attr.aria-label]="ariaLabel()"
                [value]="value()"
                (input)="valueChange.emit(inputValue($event))" />
            @if (formulaEnabled()) {
                <button
                    type="button"
                    class="vlocode-formula-input__button"
                    [title]="buttonTitle()"
                    [attr.aria-label]="buttonAriaLabel()"
                    (click)="openFormulaEditor()">fx</button>
            }
        </span>

        @if (editorOpen()) {
            <vlo-dialog
                type="info"
                icon="symbol-method"
                size="wide"
                confirmIcon="check"
                [title]="dialogTitle()"
                [message]="dialogMessage()"
                [confirmLabel]="confirmLabel()"
                (cancel)="closeFormulaEditor()"
                (confirm)="applyFormulaEditor()">
                <div class="vlocode-formula-input__dialog-body">
                    <div class="vlocode-field vlocode-formula-input__formula">
                        <span>{{ valueLabel() }}</span>
                        <vlo-formula-editor
                            [value]="draftValue()"
                            [ariaLabel]="editorAriaLabel()"
                            (valueChange)="draftValue.set($event)" />
                    </div>
                </div>
            </vlo-dialog>
        }
    `
})
export class VlocodeFormulaInputComponent {
    readonly ariaLabel = input('Formula value');
    readonly buttonAriaLabel = input('Open formula editor');
    readonly buttonTitle = input('Open formula editor');
    readonly confirmLabel = input('Apply');
    readonly dialogMessage = input('');
    readonly dialogTitle = input('Formula Editor');
    readonly editorAriaLabel = input('Formula editor');
    readonly formulaEnabled = input(true);
    readonly value = input('');
    readonly valueLabel = input('Value');

    readonly valueChange = output<string>();

    protected readonly draftValue = signal('');
    protected readonly editorOpen = signal(false);
    protected readonly inputValue = inputValue;

    protected openFormulaEditor() {
        this.draftValue.set(this.value());
        this.editorOpen.set(true);
    }

    protected closeFormulaEditor() {
        this.editorOpen.set(false);
    }

    protected applyFormulaEditor() {
        this.valueChange.emit(this.draftValue());
        this.closeFormulaEditor();
    }
}

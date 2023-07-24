import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as vlocode from '@vlocode/vlocity-deploy';

@Component({
    selector: 'app-script-element-tree',
    templateUrl: './script-element-tree.component.html',
    styleUrls: ['./script-element-tree.component.css']
})
export class ScriptElementTreeComponent {

    @Input({ required: true })
    public elements!: Array<vlocode.OmniScriptElementDefinition>;

    @Input()
    public selectedElement?: vlocode.OmniScriptElementDefinition;

    @Output()
    public selectedElementChange =new EventEmitter<vlocode.OmniScriptElementDefinition>();

    constructor() {
    }

    public selectElement(element: vlocode.OmniScriptElementDefinition) {
        console.log('selectElement');
        this.selectedElement = element;
        this.selectedElementChange.emit(element);
    }
}

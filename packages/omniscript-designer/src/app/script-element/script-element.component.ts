import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { OmniScriptElementDefinition } from '@vlocode/vlocity-deploy';

@Component({
  selector: 'app-script-element',
  templateUrl: './script-element.component.html',
  styleUrls: ['./script-element.component.css']
})
export class ScriptElementComponent {

  @Input({ required: true })
  public element!: OmniScriptElementDefinition;

  @Input()
  public selected = false;

  @Output()
  public onSelected =new EventEmitter<boolean>();

  @HostListener('click', ['$event']) 
  onClick(event: MouseEvent) {
    event.preventDefault();
    this.selected = !this.selected;
    this.onSelected.emit(this.selected);
   }
}

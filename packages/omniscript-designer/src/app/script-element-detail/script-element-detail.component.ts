import { Attribute, Component, Input } from '@angular/core';
import { OmniScriptElementDefinition } from '@vlocode/vlocity-deploy';

interface PropSetMapProperty {
  name: string;
  value: unknown;
  path: string;
}

@Component({
  selector: 'app-script-element-detail',
  templateUrl: './script-element-detail.component.html',
  styleUrls: ['./script-element-detail.component.css']
})
export class ScriptElementDetailComponent {

  private _element!: OmniScriptElementDefinition;
  public properties!: Array<any>;

  @Input({ required: true })
  @Attribute('element')
  public set element(value: OmniScriptElementDefinition) {
    this._element = value;
    this.properties = this.getProperties(value);
  }

  public get element() {
    return this._element;
  }

  public getProperties(element: OmniScriptElementDefinition) {
    return this.transformProperties(element.propSetMap as any);
  }

  private transformProperties(propSetMap: object, parentPath: string = '') {
    return Object.entries(propSetMap ?? {})
      .map(([name, value]) => 
        this.transformProperty({
          name,
          value,
          path: parentPath ? `${parentPath}.${name}` : `${name}`
        }
      )).filter(prop => !!prop);
  }

  private transformProperty(prop: PropSetMapProperty) {
    return {
      property: prop.name,
      label: this.getPropertyLabel(prop),
      type: this.getInputType(prop),
      value: prop.value,
      path: prop.path
    };
  }

  private getPropertyLabel(prop: PropSetMapProperty) {
    return prop.name
      .replace(/([A-Z]+)/g, " $1")
      .replace(/([A-Z][a-z])/g, " $1")
      .replace(/(^[a-z])/g, (match) => match.toUpperCase());
  }

  private getInputType(prop: PropSetMapProperty) {
    if (typeof prop.value === 'string') {
      return 'text';
    } else if (typeof prop.value === 'number') {
      return 'number';
    } else if (typeof prop.value === 'boolean') {
      return 'checkbox';
    }
    return 'text';
  }
}

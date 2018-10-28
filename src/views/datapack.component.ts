
import DatapackController from './datapack.controller'
import DatapackTemplate from './datapack.component.html'

export default class DatapackComponent implements ng.IComponentOptions {

    public controller: ng.Injectable<ng.IControllerConstructor>;
    public controllerAs: string;
    public template: string;
  
    constructor() {
        console.log('CTOR DatapackComponent');
      this.controller = DatapackController;
      this.controllerAs = "$ctrl";
      console.log(DatapackTemplate);
      this.template = DatapackTemplate;
    }
  }
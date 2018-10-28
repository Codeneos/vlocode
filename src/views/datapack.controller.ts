export default class DatapackController implements ng.IComponentController {
    public datapacks = [{ name: 'dp1' }];
    constructor() {
        console.log('CTOR DatapackController');
        console.log(Array.from(arguments));       
    }  
    public $onInit () {
        console.log('Hello DatapackController: ');
        console.log(Array.from(arguments));       
    }
}
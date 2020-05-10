import { expect } from 'chai';
import { singleton, getInstance } from 'lib/util/singleton';
import 'mocha';

describe('singleton', () => {   
    describe("#getInstance", function () {
        it("should only create 1 instance of a class", function() {
            const objectSingleton1 : any = singleton(Object);
            const objectSingleton2 : any = singleton(Object);            
            objectSingleton1['value'] = 1;
            // assert
            expect(objectSingleton1['value']).equals(objectSingleton2['value']);
        });
    });    
});
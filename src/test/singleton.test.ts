import { expect } from 'chai';
import 'mocha';

import * as vscode from 'vscode';
import { container } from 'serviceContainer';

describe('serviceContainer', () => {   
    describe("#getInstance", function () {
        it("should only create 1 instance of a class", function() {
            let objectSingleton1 : any = container.getInstance(Object);
            let objectSingleton2 : any = container.getInstance(Object);            
            objectSingleton1['value'] = 1;
            // assert
            expect(objectSingleton1['value']).equals(objectSingleton2['value']);
        });
    });    
});
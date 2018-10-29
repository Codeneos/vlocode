import { expect } from 'chai';
import 'mocha';

import * as vscode from 'vscode';
import * as s from '../singleton';

describe('singleton', () => {   
    describe("#getInstance", function () {
        it("should only create 1 instance of a class", function() {
            let objectSingleton1 : any = s.getInstance(Object);
            let objectSingleton2 : any = s.getInstance(Object);            
            objectSingleton1['value'] = 1;
            // assert
            expect(objectSingleton1['value']).equals(objectSingleton2['value']);
        });
    });    
});
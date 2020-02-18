import * as vscode from 'vscode';

import { DatapackCommand } from './datapackCommand';
import { VlocityDatapackRelationshipType } from 'models/datapackCollection';
import { writeFile } from 'fs';
import SalesforceService from 'services/salesforceService';
import { isObject } from 'util';

export default class CreateNewCommand extends DatapackCommand {

    private readonly newItemTypes : (vscode.QuickPickItem & { recordType?: string, properties?: any })[] = [{         
        label: 'Vlocity UI Template: OmniScript',
        description: 'Create Vlocity Template for use in OmniScript',
        recordType: '%vlocity_namespace%__VlocityUITemplate__c',
        properties: {
            'Name': { type: 'input', options: { placeHolder: 'Please enter the name for the template' }  },
            '%vlocity_namespace%__Type__c': 'OmniScript',
            '%vlocity_namespace%__Author__c': '%org_name%'
        }
    },{ 
        label: 'Vlocity UI Template: Card',
        description: 'Create Vlocity card template for use in Cards Framework',
        recordType: '%vlocity_namespace%__VlocityUITemplate__c',
        properties: {
            'Name': { type: 'input', options: { placeHolder: 'Please enter the name for the template' }  },
            '%vlocity_namespace%__Type__c': 'Cards',
            '%vlocity_namespace%__Author__c': '%org_name%'
        }
    },{ 
        label: 'Vlocity UI Template: Container Card',
        description: 'Create Vlocity container template for use in Cards Framework',
        recordType: '%vlocity_namespace%__VlocityUITemplate__c',
        properties: {
            'Name': { type: 'input', options: { placeHolder: 'Please enter the name for the template' }  },
            '%vlocity_namespace%__Type__c': 'Containers',
            '%vlocity_namespace%__Author__c': '%org_name%'
        }
    }];

    constructor(name : string) {
        super(name, args => this.create(args[1] || [args[0] || this.currentOpenDocument]));
    }    

    protected async create(selectedFiles: vscode.Uri[]) {       
        let selectedType = await vscode.window.showQuickPick(this.newItemTypes,
            { placeHolder: 'Select the type of item to create' });

        let orgName = (await this.vloService.salesforceService.getOrganizationDetails()).name;  
        let vlocityNamespace = this.vloService.datapackService.vlocityNamespace;

        this.logger.info(`orgName: ${orgName}`);
        this.logger.info(`vlocityNamespace: ${vlocityNamespace}`);

        Object.keys(selectedType.properties).map(async key => {
            let prop = selectedType.properties[key];
            if (prop !== null && typeof prop === 'object') {
                if (prop.type == 'input') {
                    return await vscode.window.showInputBox(prop.options);
                }
            } else {
                return prop;
            }
        });
    }
}
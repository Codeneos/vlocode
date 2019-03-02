declare module 'sfdx-node' {

    namespace auth {
        function webLogin(opts: {
            instanceurl : string,
            setalias?: string,
            loglevel?: logLevel
        }) : Thenable<WebLoginResult>;
    }

    namespace org {
        function list(opts?: { all?: boolean, loglevel?: logLevel }) : Thenable<{nonScratchOrgs: SalesforceOrgDetails[], scratchOrgs: SalesforceOrgDetails[]}>;
    }
    
    type logLevel = 'error' | 'trace' | 'debug' | 'info' | 'warn' | 'fatal';

    interface SalesforceOrgDetails {
        orgId?: string,
        accessToken?: string,
        instanceUrl?: string,
        loginUrl?: string,
        username?: string,
        clientId?: string, 
        connectedStatus?: string,
        lastUsed?: string,
        alias?: string,
        isDefaultDevHubUsername? : boolean,
        isDefaultUsername?: boolean
    }

    interface WebLoginResult extends SalesforceOrgDetails {        
        clientSecret?: string, 
        created?: string | undefined, //undefined
        createdOrgInstance?: string | undefined, //undefined
        devHubUsername?: string | undefined, //undefined
        refreshToken?: string, 
        scratchAdminUsername?: string | undefined, //undefined
        trialExpirationDate?: string | undefined, //undefined
        userId?: string | undefined, //undefined
        userProfileName?: string | undefined, //undefined
    }

    /*webLogin({
        setdefaultdevhubusername: true,
        setalias: 'HubOrg'
    })
    .then(function(){
    //push source
    return sfdx.source.push();  
    })
    .then(function(){
    console.log('Source pushed to scratch org');  
    });*/
}
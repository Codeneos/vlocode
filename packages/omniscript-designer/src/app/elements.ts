import { OmniScriptElementDefinition } from "@vlocode/vlocity-deploy"

export const elements: OmniScriptElementDefinition[] = [
    {
        "type": "DataRaptor Extract Action",
        "propSetMap": {
            "wpm": false,
            "validationRequired": "None",
            "ssm": false,
            "showPersistentComponent": [
                false,
                false
            ],
            "show": undefined,
            "responseJSONPath": "",
            "responseJSONNode": "",
            "remoteTimeout": 30000,
            "redirectTemplateUrl": "vlcAcknowledge.html",
            "redirectPreviousWidth": 3,
            "redirectPreviousLabel": "Previous",
            "redirectPageName": "",
            "redirectNextWidth": 3,
            "redirectNextLabel": "Next",
            "postMessage": "Done",
            "message": {},
            "label": "fetchSystemUserExtract",
            "inProgressMessage": "In Progress",
            "failureNextLabel": "Continue",
            "failureAbortMessage": "Are you sure?",
            "failureAbortLabel": "Abort",
            "dataRaptor Input Parameters": [],
            "controlWidth": 12,
            "bundle": "OrderCaptureCompletion_fetchSystemUserExtract_v1",
            "HTMLTemplateId": ""
        },
        "offSet": 0,
        "name": "fetchSystemUserExtract",
        "level": 0,
        "indexInParent": 0,
        "bHasAttachment": false,
        "bEmbed": false
    },
    {
        "type": "DataRaptor Extract Action",
        "propSetMap": {
            "wpm": false,
            "validationRequired": "None",
            "ssm": false,
            "showPersistentComponent": [
                false,
                false
            ],
            "show": undefined,
            "responseJSONPath": "",
            "responseJSONNode": "",
            "remoteTimeout": 30000,
            "redirectTemplateUrl": "vlcAcknowledge.html",
            "redirectPreviousWidth": 3,
            "redirectPreviousLabel": "Previous",
            "redirectPageName": "",
            "redirectNextWidth": 3,
            "redirectNextLabel": "Next",
            "postMessage": "Done",
            "message": {},
            "label": undefined,
            "inProgressMessage": "In Progress",
            "failureNextLabel": "Continue",
            "failureAbortMessage": "Are you sure?",
            "failureAbortLabel": "Abort",
            "dataRaptor Input Parameters": [
                {
                    "inputParam": "orderId",
                    "element": "orderId"
                }
            ],
            "controlWidth": 12,
            "bundle": "OrderCaptureCompletion_FetchOrderData_v1_1",
            "HTMLTemplateId": ""
        },
        "offSet": 0,
        "name": "getOrderDetailsExtract",
        "level": 0,
        "indexInParent": 1,
        "bHasAttachment": false,
        "bEmbed": false
    }
];

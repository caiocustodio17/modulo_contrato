export function useUploadFileProces()
{
    const senddata = {
        "processId": "dw_cadastro_contrato_nucleus",
        "version": 6,
        "managerMode": false,
        "taskUserId": "admin",
        "processInstanceId": 241735,
        "isDigitalSigned": false,
        "selectedState": 15,
        "attachments": [
            {
                "description": "texte.xlsx",
                "attachments": [],
                "newAttach": true,
                "iconClass": "fluigicon-file-upload",
                "version": 1000,
                "documentId": 647808,
                "iconUrl": true,
                "iconPath": "icone/icon-xls.png",
                "physicalFileName": "texte.xlsx",
                "documentType": "2",
                "hasOwnSubMenu": true,
                "enablePublish": false,
                "enableEdit": true,
                "enableEditContent": true,
                "fromUpload": false,
                "enableDownload": true,
                "hasMoreOptions": true,
                "classSubMenu": "fs-display-flex fs-justify-content-flex-end",
                "colleagueId": "admin"
            }
        ],
        "currentMovto": 4
    }
    
    // WCMAPI.Create({
    //             url: ECM.restUrl + "workflowView/saveAttachments",
    //             data: senddata,
    //             success: function(data) {
    //                 console.log(data)
    //             },
    //       error: function(err) {
    //                 console.log(err.responseText)
    //             }
    //         }
    return {senddata}
}
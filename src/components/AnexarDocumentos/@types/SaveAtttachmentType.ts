export const attachmentInitial =
        {
            "id": 2,
            "fullPath": "BPM",
            "droppedZipZone": false,
            "name": "DadosPagamentoNF - cópia 2.pdf",
            "newAttach": true,
            "description": "DadosPagamentoNF - cópia 2.pdf",
            "documentId": 0,
            "attachedUser": "Administrador Fluig",
            "attachedActivity": "Aprovador do C.C. - Aprovar",
            "attachments": [
                {
                    "attach": false,
                    "principal": true,
                    "fileName": "DadosPagamentoNF - cópia 2.pdf"
                }
            ],
            "hasOwnSubMenu": false,
            "enablePublish": false,
            "enableEdit": false,
            "enableEditContent": false,
            "fromUpload": true,
            "enableDownload": true,
            "hasMoreOptions": false,
            "iconClass": "fluigicon-file-upload",
            "iconUrl": false,
            "colleagueId": "admin"
        }
export const saveAttachmentsInitial ={
    "processId": "dw_cadastro_de_contrato",
    "version": 36,
    "managerMode": false,
    "taskUserId": "admin",
    "processInstanceId": 347513,
    "isDigitalSigned": false,
    "selectedState": 239,
    "attachments": [attachmentInitial],
    "currentMovto": 5
}

export type AttachmentType = typeof attachmentInitial
export type SaveAtttachmentType = typeof saveAttachmentsInitial
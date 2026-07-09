/* eslint-disable @typescript-eslint/no-explicit-any */
export function openDocument(docId: string, docVersion: string = "1000") {
  let parentOBJ: any = window.opener ? window.opener.parent : parent;

  console.log("AQUI O PARENT")
  if (!parentOBJ?.ECM?.documentView) {
    console.error("Erro: ECM.documentView não está disponível.");
  }
  
  const cfg = {
    url: "/ecm_documentview/documentView.ftl",
    maximized: true,
    title: "Visualizador de Documentos",
    callBack: function () {
      parentOBJ.ECM.documentView.getDocument(docId, docVersion);
    },
    customButtons: [],
  };

  const x = parentOBJ.WCMC.panel(cfg);

  parentOBJ.ECM.documentView.panel = x

}

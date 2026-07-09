type ISaida = {
  environment: string;
  taxDocuments: string;
  movMovimento: string;
  movMovimentoRateio: string;
  movMovimentoItem: string;
  formaPagto: string;
  usuarioLogado: string;
  fluigDir: number;
  method: string;
  contratos: string;
  abrirSolicitacaoContrato: string;
  abrirSolicitacaoPagamento: string;
  fornecedores: string;
  filiais: string;
  centroCusto: string;
  naturezaOrcamentaria: string;
  produtos: string;
  funcoes: string;
  papeis: string;
  visualizarProcesso: string;
  uploadUrl: string;
  attachProccess: string;
  createDocumentUrl: string;
  idFolder: string;
  removeUploadFile: string;
  createFolder: string;
  viewDocument: string;
  datasetUrl: string;
  header?: string;
  ml: string[];
};
const baseUrlDev = "https://nucleode135229.fluig.cloudtotvs.com.br:2250";
const baseUrlProd = "/api/public/ecm/dataset/datasets";

// Dev = Vite dev server; prod = built bundle published inside Fluig.
const isDev = import.meta.env.DEV;
// In dev, mocks are ON unless VITE_USE_MOCKS=false (then hit the real dev cloud).
export const useMocks = isDev && import.meta.env.VITE_USE_MOCKS !== "false";
const environment = isDev ? "dev" : "prod";
const uploadUrl = "/ecm/upload";
const createDocumentUrl = "/api/public/ecm/document/createDocument";
const createFolder = "/api/public/ecm/document/createFolder";
const visualizarProcesso =
  "/portal/p/01/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=";
const attachProccess = "/ecm/api/rest/ecm/workflowView/saveAttachments";
const removeUploadFile = "/ecm/api/rest/ecm/workflowView/removeUploadFiles";
const viewDocument = "/portal/p/01/ecmnavigation?app_ecm_navigation_doc=";
const idFolder = !window.location.host.includes(
  "fluig.redeinspiraeducadores.com.br"
)
  ? "715015"
  : "766008";
const datasetUrl = "/api/public/ecm/dataset/datasets";
const saida: ISaida = (environment.includes("dev"))
  ? {
    environment: "dev",
    taxDocuments: baseUrlDev + datasetUrl,
    movMovimento: baseUrlDev + datasetUrl,
    movMovimentoRateio: baseUrlDev + datasetUrl,
    movMovimentoItem: baseUrlDev + datasetUrl,
    filiais: baseUrlDev + datasetUrl,
    formaPagto: baseUrlDev + datasetUrl,
    produtos: baseUrlDev + datasetUrl,
    method: "POST",
    usuarioLogado: "admin",
    fluigDir: 714881,
    contratos: baseUrlDev + datasetUrl,
    funcoes: baseUrlDev + datasetUrl,
    papeis: baseUrlDev + datasetUrl,
    abrirSolicitacaoContrato:
      "https://nucleode135229.fluig.cloudtotvs.com.br:2250/portal/p/01/pageworkflowview?processID=dw_cadastro_de_contrato",
    abrirSolicitacaoPagamento: "",
    fornecedores: baseUrlDev + datasetUrl,
    centroCusto: baseUrlDev + datasetUrl,
    naturezaOrcamentaria: baseUrlDev + datasetUrl,
    visualizarProcesso,
    uploadUrl,
    createDocumentUrl,
    attachProccess,
    removeUploadFile,
    idFolder,
    createFolder,
    viewDocument,
    datasetUrl,
    header: `OAuth oauth_consumer_key="8d8ed301ae9d438690994b27754d8383",oauth_token="f3a4d64b-39b5-4209-957f-579a797a886c",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1707333119",oauth_nonce="yZI4qpdb5RO",oauth_version="1.0",oauth_signature="UNx2A%2B3rjOoY3k9nVMAlIhWlRNU%3D"`,
    ml: ["ML001134", "ML001135"], // INUTIL ml: ["ML001140", "ML001146"],
  }
  : {
    environment: "prod",
    taxDocuments: baseUrlProd,
    movMovimento: baseUrlProd,
    method: "POST",
    movMovimentoRateio: baseUrlProd,
    produtos: baseUrlProd,
    movMovimentoItem: baseUrlProd,
    formaPagto: baseUrlProd,
    contratos: baseUrlProd,
    fornecedores: baseUrlProd,
    usuarioLogado: window.WCMAPI.userLogin,
    filiais: baseUrlProd,
    centroCusto: baseUrlProd,
    naturezaOrcamentaria: baseUrlProd,
    funcoes: baseUrlProd,
    papeis: baseUrlProd,
    fluigDir: 777110,
    abrirSolicitacaoContrato:
      "/portal/p/01/pageworkflowview?processID=dw_cadastro_de_contrato",
    abrirSolicitacaoPagamento: "",
    visualizarProcesso,
    uploadUrl,
    createDocumentUrl,
    attachProccess,
    idFolder,
    removeUploadFile,
    createFolder,
    viewDocument,
    datasetUrl,
    ml: ["ML001134", "ML001135"],
  };
export default saida;

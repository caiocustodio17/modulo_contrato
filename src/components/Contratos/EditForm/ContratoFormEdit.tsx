import { Card, CardContent, Typography } from "@mui/material";
import { indigo } from "@mui/material/colors";
import { DestinatarioProvider } from "../../Destinatarios/DestinatarioContext";
import DestinatarioForm from "../../Destinatarios/DestinatarioForm";
import { FornecedorProvider } from "../../Fornecedores/FornecedoresContext";
import FornecedoresForm from "../../Fornecedores/FornecedoresForm";
import ResponsaveisForm from "../../Responsaveis/ResponsaveisForm";
import ControleOrcamentarioForm from "./ControleOrcamentarioForm";
// import { CentroCustoProvider } from "../../CentroCusto/CentroCustoContext";
// import ControleRateioForm from "./ControleRateioForm.tsx";
import DetalhesContratoForm from "./DetalhesContratoForm";
import FaturamentoForm from "./FaturamentoForm";
import AnexarDocumentosComponent from "../../AnexarDocumentos/AnexarDocumentosComponent";
import ControleRateioMonolitico from "./ControleRateioForm.tsx";
import ItensPagamentoForm from "../../SolicitacaoPgto/items/ItensPagamentoForm.tsx";
export default function ContratoFormEdit() {
  const registros = [
    {
      title: "Emissor",
      component: (
        <FornecedorProvider>
          <FornecedoresForm />
        </FornecedorProvider>
      ),
    },
    {
      title: "Destinatario",
      component: (
        <DestinatarioProvider>
          <DestinatarioForm />
        </DestinatarioProvider>
      ),
    },
    { title: "Detalhes", component: <DetalhesContratoForm /> },
    { title: "Faturamento", component: <FaturamentoForm /> },
    { title: "Controle Orçamentário", component: <ControleOrcamentarioForm /> },
    { title: "Controle Rateio", component: <ControleRateioMonolitico /> },
    { title: "Items Pagamento", component: <ItensPagamentoForm /> },
    { title: "Responsáveis", component: <ResponsaveisForm /> },
    { title: "Anexos", component: <AnexarDocumentosComponent /> },
  ];
  return (
    <form>
      {registros.map((item, idx) => (
        <Card key={idx} sx={{ marginTop: 1 }} variant="outlined">
          <Typography
            sx={{
              position: "absolute",
              paddingLeft: 1,
              background: "white",
              textTransform: "uppercase",
              fontSize: "smaller",
              fontWeight: "600",
              color: indigo[500],
            }}
          >
            {item.title}
          </Typography>
          <CardContent>{item.component}</CardContent>
        </Card>
      ))}
    </form>
  );
}

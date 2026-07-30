import { Card, CardContent, Typography } from "@mui/material";
import { indigo } from "@mui/material/colors";
import { CentroCustoProvider } from "../../CentroCusto/CentroCustoContext";
import { DestinatarioProvider } from "../../Destinatarios/DestinatarioContext";
import { FornecedorProvider } from "../../Fornecedores/FornecedoresContext";
import ResponsaveisForm from "../../Responsaveis/ResponsaveisForm";
// import ControleRateioForm from "./ControleRateioForm.tsx";
import ColigadaFilialForm from "./ColigadaFilialForm";
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
        <DestinatarioProvider>
          <ColigadaFilialForm />
        </DestinatarioProvider>
      ),
    },
    { title: "Detalhes", component: <DetalhesContratoForm /> },
    { title: "Faturamento", component: <FaturamentoForm /> },
    { title: "Controle Rateio", component: <ControleRateioMonolitico /> },
    {
      title: "Items Pagamento",
      component: (
        <FornecedorProvider>
          <CentroCustoProvider>
            <ItensPagamentoForm />
          </CentroCustoProvider>
        </FornecedorProvider>
      ),
    },
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

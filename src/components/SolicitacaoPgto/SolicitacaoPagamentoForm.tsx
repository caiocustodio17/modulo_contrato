import { Card, CardContent, Typography } from "@mui/material";
import { indigo } from "@mui/material/colors";
import AnexarDocumentosComponent from "../AnexarDocumentos/AnexarDocumentosComponent";
import DadosPagamentoForm from "./DadosPagamentoForm";
import HitoricoPagamentoForm from "./HistoricoPagamentoForm";
import SolicitacaoPagamentoBotoes from "./SolicitacaoPagamentoBotoes";
import ItensPagamentoForm from "./items/ItensPagamentoForm";
import DadosBancariosForm from "./formaPagamento/DadosBancariosForm";

export default function SolicitacaoPagamentoForm() {
  const registros = [
    { title: "Dados Pagamento", component: <DadosPagamentoForm /> },
    { title: "Forma Pagamento", component: <DadosBancariosForm /> },
    { title: "Histório Nota", component: <HitoricoPagamentoForm /> },
    { title: "Items Pagamento", component: <ItensPagamentoForm readOnly /> },
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
      <SolicitacaoPagamentoBotoes />
    </form>
  );
}

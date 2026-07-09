import { Grid } from "@mui/material";
import { CentroCustoProvider } from "../../CentroCusto/CentroCustoContext";
import CentroCustoForm from "../../CentroCusto/CentroCustoForm";

export default function ControleOrcamentarioForm() {
  return (
    <Grid container spacing={1} marginTop={1}>
      <CentroCustoProvider>
        <CentroCustoForm />
      </CentroCustoProvider>
      {/* <NaturezaOrcamentariaProvider><NaturezaOrcamentariaForm/></NaturezaOrcamentariaProvider> */}
    </Grid>
  );
}

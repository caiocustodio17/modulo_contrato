import { Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import useSolicitacaoPagamentoContext from "./useSolicitacaoPagamentoContext";

export default function HitoricoPagamentoForm() {

  const { notaSelecioanda } = useContratoContext();
  const { setSolicitacaoPagamento, solicitacaoPagamento } = useSolicitacaoPagamentoContext();

  const params = new URLSearchParams(window.location.search);
  const paramsHistoricoAuto = params.get("historicoAuto") || "";
  const paramsHistoricoComp = params.get("historicoComp") || "";

  const historicoAutomaticoBase = `${notaSelecioanda.total_value?.toFixed(2) ?? ""} - ${notaSelecioanda.supplier_legal_name ?? ""} - N. Doc: ${notaSelecioanda.number ?? ""}`;

  const [historicoAutomatico] = useState(paramsHistoricoAuto || historicoAutomaticoBase);
  const [historicoCurto, setHistoricoCurto] = useState(paramsHistoricoComp ?? "");

  useEffect(() => {
    setSolicitacaoPagamento({
      ...solicitacaoPagamento,
      HIST_COMPL: historicoCurto,
      TMOVCOMPL_T_HISTCOMPL: historicoAutomatico,
    });
  }, [historicoCurto, historicoAutomatico]);

  // useEffect(()=>{

  //   handleSetDados()
  // },[historicoCurto, historicoAutomatico])
  // function handleSetDados(){
  //   setSolicitacaoPagamento({...solicitacaoPagamento, HIST_COMPL: historicoCurto, TMOVCOMPL_T_HISTCOMPL: historicoAutomatico})
  // }
  return (
    <Grid container mt={2} spacing={1}>
      <Grid item xs={12} sm={12} md={6}>
        <TextField
          fullWidth
          size="small"
          id="TMOVCOMPL_T_HISTCOMPL"
          label="Histórico Automático"
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
          multiline
          rows={2}
          value={historicoAutomatico}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6}>
        <TextField
          fullWidth
          size="small"
          id="TMOV_T_HISTORICOCURTO"
          label="Histórico Complementar"
          variant="outlined"
          multiline
          focused
          type="text"
          rows={2}
          value={historicoCurto}
          onChange={(e) => setHistoricoCurto(e.target.value)}
        />
      </Grid>
    </Grid>
  )
}

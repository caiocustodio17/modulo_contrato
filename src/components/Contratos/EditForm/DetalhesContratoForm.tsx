import { Grid, TextField } from "@mui/material";
import { useContratoContext } from "../hooks/useContratoContext";

export default function DetalhesContratoForm() {
  const { contrato, editForm, setContrato } = useContratoContext();
  const readOnly = editForm ? false : true;
  const focused = editForm;
  const hoje = new Date().toISOString().split("T")[0];
  // const ultimoDiaAno = `${hoje.split("-")[0]}-12-31`;
  return (
    <Grid container spacing={1} marginTop={1}>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TF_T_CODCONTRATO"
          label="cod"
          variant="outlined"
          type="number"
          InputProps={{
            readOnly,
          }}
          value={contrato.TF_T_CODCONTRATO}
          onChange={(e) =>
            setContrato({ ...contrato, TF_T_CODCONTRATO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TF_T_CONTRATO"
          label="Nome contrato"
          variant="outlined"
          type="text"
          InputProps={{
            readOnly,
          }}
          value={contrato.TF_T_CONTRATO}
          onChange={(e) =>
            setContrato({ ...contrato, TF_T_CONTRATO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TF_T_DATAINICIO"
          label="Inicio"
          variant="outlined"
          type="date"
          InputProps={{
            readOnly,
          }}
          inputProps={{ min: hoje, max: "9999-12-31" }}
          value={contrato.TF_T_DATAINICIO}
          onChange={(e) =>
            setContrato({ ...contrato, TF_T_DATAINICIO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TF_T_DATAFIM"
          label="Fim"
          variant="outlined"
          type="date"
          InputProps={{
            readOnly,
          }}
          inputProps={{ 
            max: "9999-12-31",
            min: contrato.TF_T_DATAINICIO
          }}
          value={contrato.TF_T_DATAFIM}
          onChange={(e) => {
            setContrato({ ...contrato, TF_T_DATAFIM: e.target.value });
          }}
          onBlur={(e) => {
            const novaDataFim = e.target.value;
            const dataInicio = new Date(contrato.TF_T_DATAINICIO);
            const dataFim = new Date(novaDataFim);

            if (!novaDataFim || dataFim < dataInicio) {
              setContrato({ ...contrato, TF_T_DATAFIM: "" });
            }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TF_T_DATATOL"
          label="Tolerância"
          variant="outlined"
          type="date"
          InputProps={{
            readOnly,
          }}
         inputProps={{ 
            max: '9999-12-31', 
            min: contrato.TF_T_DATAFIM 
          }}
          value={contrato.TF_T_DATATOL}
          onChange={(e) => {
            setContrato({ ...contrato, TF_T_DATATOL: e.target.value });
          }}
          onBlur={(e) => {
            const novaDataTol = e.target.value;
            const dataFim = new Date(contrato.TF_T_DATAFIM);
            const dataTol = new Date(novaDataTol);

            if (!novaDataTol || dataTol < dataFim) {
              setContrato({ ...contrato, TF_T_DATATOL: "" });
            }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TMOV_T_HISTORICOLONGO"
          label="Detalhes"
          variant="outlined"
          type="type"
          multiline
          rows={4}
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_HISTORICOLONGO}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_HISTORICOLONGO: e.target.value })
          }
        />
      </Grid>
    </Grid>
  );
}

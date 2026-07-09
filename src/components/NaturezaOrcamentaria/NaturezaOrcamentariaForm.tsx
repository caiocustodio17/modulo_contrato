import { DeleteOutline, SearchOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { NaturezaOrcamentariaModalSelect } from "./NaturezaOrcamentariaModalSelect";
import useNaturezaOrcamentaria from "./useNaturezaOrcamentaria";

export default function NaturezaOrcamentariaForm(){
  const {contrato, setContrato} = useContratoContext();
  const {focused, handleClearNaturezaOrcamentariaClick,handleSearcNaturezaOrcamentariaClick, isLoading, readOnly} = useNaturezaOrcamentaria()
  return (
    <>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TMOV_T_CODTBORCAMENTO"
          label="Cód. Nat. Orçamentária"
          variant="outlined"
          type="text"
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_CODTBORCAMENTO}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_CODTBORCAMENTO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TMOV_T_TBORCAMENTO"
          label="Natureza Orçamentária"
          variant="outlined"
          type="text"
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_TBORCAMENTO}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_TBORCAMENTO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleSearcNaturezaOrcamentariaClick}
          disabled={readOnly || isLoading}
        >
          {isLoading ? <CircularProgress size={20} /> : <SearchOutlined />}
        </Button>
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <Button
          variant="outlined"
          fullWidth
          color="error"
          onClick={handleClearNaturezaOrcamentariaClick}
          disabled={readOnly}
        >
          <DeleteOutline />
        </Button>
      </Grid>
      <NaturezaOrcamentariaModalSelect/>
    </>
  )
}

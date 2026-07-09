import { DeleteOutline, SearchOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { CentroCustoModalSelect } from "./CentroCustoModalSelect";
import useCentroCusto from "./useCentroCusto";

export default function CentroCustoForm(){
  const {contrato, setContrato} = useContratoContext();
  const {focused, handleClearCCustoClick,handleSearchCCustoClick, isLoading, readOnly} = useCentroCusto()
  return (
    <>
          <Grid item xs={12} sm={12} md={1}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="TMOV_T_CODCCUSTO"
          label="Cód. C. Custo"
          variant="outlined"
          type="text"
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_CODCCUSTO}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_CODCCUSTO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="DESCRICAO_CODCCUSTO"
          label="Centro de Custo"
          variant="outlined"
          type="text"
          InputProps={{
            readOnly,
          }}
          value={contrato.DESCRICAO_CODCCUSTO}
          onChange={(e) =>
            setContrato({ ...contrato, DESCRICAO_CODCCUSTO: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleSearchCCustoClick}
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
          onClick={handleClearCCustoClick}
          disabled={readOnly}
        >
          <DeleteOutline />
        </Button>
      </Grid>
      <CentroCustoModalSelect/>
    </>
  )
}

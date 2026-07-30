import { DeleteOutline, SearchOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import FornecedorModalSelect from "./FornecedorModalSelect";
import useFornedor from "./useFornecedores";
import sanitizeCnpjCpf from "../../utils/formatCnpjCpf";

export default function FornecedoresForm() {
  const {contrato, setContrato} = useContratoContext()
  const {focused, handleClearClick, handleSearchFornecedorClick, isLoading, readOnly} = useFornedor()
  return (
    <>
      <Grid container spacing={1} marginTop={1}>
        <Grid item xs={12} sm={12} md={1}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="codCfo"
            label="Cód. Cfo."
            variant="outlined"
            type="number"
            InputProps={{
              readOnly,
            }}
            value={contrato.TMOV_T_CODCFO ?? ``}
            onChange={(e) =>
              setContrato({
                ...contrato,
                TMOV_T_CODCFO: e.target.value.toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="fornecedor"
            label="Fornecedor"
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            value={contrato.DESCRICAO_CODCFO ?? ``}
            onChange={(e) =>
              setContrato({
                ...contrato,
                DESCRICAO_CODCFO: e.target.value.toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="cgccfo"
            label="Cnpj/Cpf"
            variant="outlined"
            inputProps={{ maxLength: 14 }}
            InputProps={{
              readOnly,
            }}
            value={contrato.TMOV_T_CGCCFO ?? ``}
            onChange={(e) =>
              setContrato({
                ...contrato,
                TMOV_T_CGCCFO: sanitizeCnpjCpf(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSearchFornecedorClick}
            disabled={readOnly || (isLoading)}
          >
            {isLoading ? <CircularProgress size={20} /> : <SearchOutlined />}

          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            color="error"
            onClick={handleClearClick}
            disabled={readOnly}
          >
            <DeleteOutline />
          </Button>
        </Grid>
      </Grid>
      <FornecedorModalSelect />
    </>
  );
}

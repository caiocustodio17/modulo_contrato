import { DeleteOutline, SearchOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { DestinatarioModalSelect } from "./DestinatarioModalSelect";
import useDestinatario from "./useDestinatario";
import sanitizeCnpjCpf from "../../utils/formatCnpjCpf";

export default function DestinatarioForm() {
  const {contrato, setContrato} = useContratoContext()
  const {focused, readOnly, handleClearClick, handleSearchDestinatarioClick, isLoading} = useDestinatario()
  return (
    <>
    <Grid container spacing={1} marginTop={1}>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="codcoligada"
          label="Cód. Coligada"
          variant="outlined"
          //Adicionado type number para que o campo aceite apenas números 09/07/2026
          type="number"
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_CODCOLIGADA ?? ""}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_CODCOLIGADA: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="codFilial"
          label="Cód. Filial"
          variant="outlined"
          //Adicionado type number para que o campo aceite apenas números 09/07/2026
          type="number"
          InputProps={{
            readOnly,
          }}
          value={contrato.TMOV_T_CODFILIAL ?? ""}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_CODFILIAL: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={5}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          id="escola"
          label="Escola"
          variant="outlined"
          InputProps={{
            readOnly,
          }}
          value={contrato.DESCRICAO_CODFILIAL ?? ""}
          onChange={(e) =>
            setContrato({ ...contrato, DESCRICAO_CODFILIAL: e.target.value })
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
          value={contrato.TMOV_T_CGCFIL ?? ""}
          onChange={(e) =>
            setContrato({ ...contrato, TMOV_T_CGCFIL: sanitizeCnpjCpf(e.target.value) })
          }
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleSearchDestinatarioClick}
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
          onClick={handleClearClick}
          disabled={readOnly}
        >
          <DeleteOutline />
        </Button>
      </Grid>
    </Grid>
    <DestinatarioModalSelect/>
    </>
  );
}


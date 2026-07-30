import { DeleteOutline, SearchOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { useContratoContext } from "../hooks/useContratoContext";
import { IDestinatarioSelecionado } from "../../Destinatarios/DestinatarioContext";
import { DestinatarioModalSelect } from "../../Destinatarios/DestinatarioModalSelect";
import { useDestinatarioContext } from "../../Destinatarios/useDestinatarioContext";
import useDestinatario from "../../Destinatarios/useDestinatario";

export default function ColigadaFilialForm() {
  const { contrato, setContrato } = useContratoContext();
  const { setOnSelectDestinatario } = useDestinatarioContext();
  const { isLoading, buscarDestinatarios } = useDestinatario();

  function handleSearchClick() {
    setOnSelectDestinatario((row: IDestinatarioSelecionado) => {
      setContrato({
        ...contrato,
        TMOV_T_CODCOLIGADA: row.CODCOLIGADA ?? contrato.TMOV_T_CODCOLIGADA,
        TMOV_T_CODFILIAL: row.CODFILIAL ?? contrato.TMOV_T_CODFILIAL,
        TMOV_T_CGCCOL: row.TMOV_T_CGCCOL ?? contrato.TMOV_T_CGCCOL,
        DESCRICAO_CODCOLIGADA: row.DESCRICAO_CODCOLIGADA ?? contrato.DESCRICAO_CODCOLIGADA,
        DESCRICAO_CODFILIAL: row.NOMEFANTASIA ?? contrato.DESCRICAO_CODFILIAL,
        TMOV_T_CGCFIL: row.CGC ?? contrato.TMOV_T_CGCFIL,
      });
    });
    void buscarDestinatarios({
      codColigada: contrato.TMOV_T_CODCOLIGADA,
      codFilial: contrato.TMOV_T_CODFILIAL,
      nomeFantasia: contrato.DESCRICAO_CODFILIAL,
      cnpj: contrato.TMOV_T_CGCFIL,
    });
  }

  function handleClearClick() {
    setContrato({
      ...contrato,
      TMOV_T_CODCOLIGADA: "",
      TMOV_T_CODFILIAL: "",
      TMOV_T_CGCCOL: "",
      DESCRICAO_CODCOLIGADA: "",
      DESCRICAO_CODFILIAL: "",
      TMOV_T_CGCFIL: "",
    });
  }

  return (
    <>
      <Grid container spacing={1} marginTop={1}>
        <Grid item xs={6} sm={3} md={1}>
          <TextField
            fullWidth
            size="small"
            id="colFilialCodColigada"
            label="Cód. Coligada"
            type="number"
            value={contrato.TMOV_T_CODCOLIGADA ?? ""}
            onChange={(e) =>
              setContrato({ ...contrato, TMOV_T_CODCOLIGADA: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1}>
          <TextField
            fullWidth
            size="small"
            id="colFilialCodFilial"
            label="Cód. Filial"
            type="number"
            value={contrato.TMOV_T_CODFILIAL ?? ""}
            onChange={(e) =>
              setContrato({ ...contrato, TMOV_T_CODFILIAL: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={3} sm={2} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            aria-label="Buscar coligada/filial"
            onClick={handleSearchClick}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : <SearchOutlined />}
          </Button>
        </Grid>
        <Grid item xs={3} sm={2} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            color="error"
            aria-label="limpar coligada/filial"
            onClick={handleClearClick}
          >
            <DeleteOutline />
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={5}>
          <TextField
            fullWidth
            size="small"
            id="colFilialEscola"
            label="Escola"
            value={contrato.DESCRICAO_CODFILIAL ?? ""}
            onChange={(e) =>
              setContrato({ ...contrato, DESCRICAO_CODFILIAL: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            id="colFilialCnpj"
            label="Cnpj"
            inputProps={{ maxLength: 14 }}
            value={contrato.TMOV_T_CGCFIL ?? ""}
            onChange={(e) =>
              setContrato({ ...contrato, TMOV_T_CGCFIL: e.target.value })
            }
          />
        </Grid>
      </Grid>
      <DestinatarioModalSelect title="Selecione a Escola" />
    </>
  );
}
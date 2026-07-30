import { MoreVert, SearchOutlined } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useContratoContext } from "../../Contratos/hooks/useContratoContext";
import ErrorComponent from "../../Global/ErrorComponent";
import useDadosBancarios from "./useDadosBancarios";

export default function DadosBancariosForm() {
  const { contrato } = useContratoContext();
  const {
    solicitacaoPagamento,
    listPagto,
    menuAnchor,
    valorTotalPagto,
    formaPagamentoList,
    isLoadingFormaPagto,
    errorFormaPagto,
    handleChange,
    handleFormaPagamentoChange,
    somenteNumeros,
    handleAddRowPagto,
    handleMenuOpen,
    handleMenuClose,
    handleReplicatePagto,
    handleDeletePagto,
    handlePagtoFieldChange,
  } = useDadosBancarios();

  return (
    <>
    {errorFormaPagto && <ErrorComponent message={errorFormaPagto} />}
    <Grid container spacing={1} marginTop={1}>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          fullWidth
          size="small"
          id="TMOV_T_IDFORMAPAGTO"
          label="ID"
          variant="outlined"
          focused
          inputProps={{ readOnly: true }}
          value={solicitacaoPagamento.TMOV_T_IDFORMAPAGTO ?? ""}
          onChange={(e) => handleChange("TMOV_T_IDFORMAPAGTO", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <TextField
          fullWidth
          select
          size="small"
          id="TMOV_T_DESCIDFORMAPAGTO"
          label="Forma de Pagamento"
          variant="outlined"
          focused
          disabled={isLoadingFormaPagto || !contrato.TMOV_T_CODCFO}
          SelectProps={{ native: true }}
          value={solicitacaoPagamento.TMOV_T_IDFORMAPAGTO ?? ""}
          onChange={(e) => handleFormaPagamentoChange(e.target.value)}
        >
          <option value="">
            {isLoadingFormaPagto ? "Carregando..." : ""}
          </option>
          {formaPagamentoList.map((item) => (
            <option key={item.IDPGTO} value={item.IDPGTO}>
              {item.DESCRICAO}
            </option>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          fullWidth
          size="small"
          id="FDADOSPGTO_T_NUMEROBANCO"
          label="Nº Banco"
          variant="outlined"
          focused
          type="text"
          inputProps={{ maxLength: 3, readOnly: true }}
          value={solicitacaoPagamento.FDADOSPGTO_T_NUMEROBANCO ?? ""}
          onChange={(e) => handleChange("FDADOSPGTO_T_NUMEROBANCO", somenteNumeros(e.target.value, 3))}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          fullWidth
          size="small"
          id="FDADOSPGTO_T_CODIGOAGENCIA"
          label="Agência"
          variant="outlined"
          focused
          type="text"
          inputProps={{ maxLength: 4, readOnly: true }}
          value={solicitacaoPagamento.FDADOSPGTO_T_CODIGOAGENCIA ?? ""}
          onChange={(e) => handleChange("FDADOSPGTO_T_CODIGOAGENCIA", somenteNumeros(e.target.value, 4))}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          fullWidth
          size="small"
          id="FDADOSPGTO_T_DIGITOAGENCIA"
          label="Dígito Ag."
          variant="outlined"
          focused
          type="text"
          inputProps={{ maxLength: 1, readOnly: true }}
          value={solicitacaoPagamento.FDADOSPGTO_T_DIGITOAGENCIA ?? ""}
          onChange={(e) => handleChange("FDADOSPGTO_T_DIGITOAGENCIA", somenteNumeros(e.target.value, 1))}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={2}>
        <TextField
          fullWidth
          size="small"
          id="FDADOSPGTO_T_CONTACORRENTE"
          label="Conta Corrente"
          variant="outlined"
          focused
          type="text"
          inputProps={{ maxLength: 10, readOnly: true }}
          value={solicitacaoPagamento.FDADOSPGTO_T_CONTACORRENTE ?? ""}
          onChange={(e) => handleChange("FDADOSPGTO_T_CONTACORRENTE", somenteNumeros(e.target.value, 10))}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={1}>
        <TextField
          fullWidth
          size="small"
          id="FDADOSPGTO_T_DIGITOCONTA"
          label="Dígito C.C."
          variant="outlined"
          focused
          type="text"
          inputProps={{ maxLength: 1, readOnly: true }}
          value={solicitacaoPagamento.FDADOSPGTO_T_DIGITOCONTA ?? ""}
          onChange={(e) => handleChange("FDADOSPGTO_T_DIGITOCONTA", somenteNumeros(e.target.value, 1))}
        />
      </Grid>
    </Grid>

    <Grid container spacing={1} marginTop={1}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleAddRowPagto}
          disabled={!solicitacaoPagamento.TMOV_T_IDFORMAPAGTO}
        >
          Incluir
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          sx={{ marginLeft: 1 }}
          disabled={!solicitacaoPagamento.TMOV_T_IDFORMAPAGTO}
        >
          Gerar Parcelas
        </Button>
      </Grid>
    </Grid>

    <Divider sx={{ marginTop: 2, marginBottom: 1 }} />

    <TableContainer sx={{ maxHeight: "100%" }}>
      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell width="25%" align="center"><b>Forma de Pagamento</b></TableCell>
            <TableCell width="35%" align="center">
              <b>Linha digitável</b>
            </TableCell>
            <TableCell width="20%" align="center">
              <b>Data de vencimento</b>
            </TableCell>
            <TableCell width="15%" align="center">
              <b>Valor</b>
            </TableCell>
            <TableCell width="5%" align="center"><b>Ações</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listPagto.map((item) => (
            <TableRow key={item.TMOVPAGTO_T_SEQF}>
              <TableCell align="center">
                <TextField
                  fullWidth
                  size="small"
                  value={item.TMOVPAGTO_T_DESCFORMAPAGTO ?? ""}
                  placeholder="Selecione"
                  InputProps={{
                    readOnly: true,
                    endAdornment: <SearchOutlined fontSize="small" />,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  fullWidth
                  size="small"
                  value={item.TMOVPAGTO_T_IPTE ?? ""}
                  onChange={(e) =>
                    handlePagtoFieldChange(item.TMOVPAGTO_T_SEQF, "TMOVPAGTO_T_IPTE", e.target.value)
                  }
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={item.TMOVPAGTO_T_DATAVENCIMENTO ?? ""}
                  onChange={(e) =>
                    handlePagtoFieldChange(
                      item.TMOVPAGTO_T_SEQF,
                      "TMOVPAGTO_T_DATAVENCIMENTO",
                      e.target.value,
                    )
                  }
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{ startAdornment: <span>$</span> }}
                  value={item.TMOVPAGTO_T_VALOR ?? ""}
                  onChange={(e) =>
                    handlePagtoFieldChange(item.TMOVPAGTO_T_SEQF, "TMOVPAGTO_T_VALOR", e.target.value)
                  }
                />
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, item.TMOVPAGTO_T_SEQF)}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
      <MenuItem onClick={handleReplicatePagto}>Replicar Pagamento</MenuItem>
      <Divider />
      <MenuItem onClick={handleDeletePagto}>Excluir</MenuItem>
    </Menu>

    <Divider sx={{ marginTop: 2, marginBottom: 1 }} />

    <Grid container spacing={1} marginTop={1}>
      <Grid item xs={12} sm={4} md={4} sx={{ marginLeft: "auto" }}>
        <TextField
          fullWidth
          size="small"
          label="Valor total líquido"
          value={valorTotalPagto}
          InputProps={{ readOnly: true, startAdornment: <span>$&nbsp;</span> }}
        />
      </Grid>
    </Grid>
    </>
  );
}

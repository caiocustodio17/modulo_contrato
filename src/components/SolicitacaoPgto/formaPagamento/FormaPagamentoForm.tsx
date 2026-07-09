import { AddOutlined, DeleteOutline } from "@mui/icons-material";
import {
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { green } from "@mui/material/colors";
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext";
import useFormaPagamento from "./useFormaPagamento";
import { useState } from "react";

export default function FormaPagamentoForm() {
  const { listPagto } = useSolicitacaoPagamentoContext();
  const {
    handleAddPayment,
    handleClearPagamentoClick,
    handleCodigoBarrasChange,
    handleDeletePayment,
    setIdFormaPagto,
    tmovPagtoToSelect,
    idFormaPagto,
    pagtoCodigoBarras,
    pagtoDataVencimento,
    //pagtoValor,
    setPagtoDataVencimento,
    setPagtoValor,
  } = useFormaPagamento();

  const [valorAux, setValorAux] = useState<string>('');
  return (
    <>
      <Grid
        container
        spacing={1}
        marginTop={1}
        className="border-b-2 mb-4 relative pb-4"
      >
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            size="small"
            id="TMOVPAGTO_T_IDFORMAPAGTO"
            label="Forma de Pagamento"
            variant="outlined"
            focused
            SelectProps={{ native: true }}
            value={idFormaPagto}
            onChange={(e) => setIdFormaPagto(e.target.value)}
          >
            {tmovPagtoToSelect.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            id="TFORMAPAGT_T_IPTE"
            label="Código de Barras"
            focused
            type="text"
            value={pagtoCodigoBarras}
            onChange={handleCodigoBarrasChange}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            size="small"
            id="TFORMAPAGTO_T_VENCIMENTO"
            label="Vencimento"
            variant="outlined"
            focused
            type="date"
            onChange={(e) => setPagtoDataVencimento(e.target.value)}
            value={pagtoDataVencimento}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            size="small"
            id="TFORMAPAGTO_T_VALOR"
            label="Valor"
            variant="outlined"
            focused
            type="number"
            value={valorAux ?? ""}
            onChange={(e)=>{setValorAux(e.target.value)}}
            onBlur={()=>{setPagtoValor(parseFloat(valorAux))}}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            sx={{ color: green[500] }}
            onClick={handleAddPayment}
          >
            <AddOutlined />
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            color="error"
            onClick={handleClearPagamentoClick}
          >
            <DeleteOutline />
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Código IPTE</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>...</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listPagto.map((item) => (
              <TableRow key={item.TMOVPAGTO_T_SEQF}>
                <TableCell>{item.TMOVPAGTO_T_SEQF}</TableCell>
                <TableCell>{item.TMOVPAGTO_T_IPTE}</TableCell>
                <TableCell>{item.TMOVPAGTO_T_DATAVENCIMENTO}</TableCell>
                <TableCell>{item.TMOVPAGTO_T_VALOR}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() =>
                      handleDeletePayment(parseInt(item.TMOVPAGTO_T_SEQF))
                    }
                  >
                    <DeleteOutline />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

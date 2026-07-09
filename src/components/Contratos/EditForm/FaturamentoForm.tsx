/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutline } from "@mui/icons-material";
import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import ModalErrorComponent from "../../Global/ModalErrorComponent";
import { useContratoContext } from "../hooks/useContratoContext";

export default function FaturamentoForm() {
  const { contrato, editForm, setContrato } = useContratoContext();
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const readOnlyMes01 = false;
  const readOnlyMes02 = false;
  const readOnlyMes03 = false;
  const readOnlyMes04 = false;
  const readOnlyMes05 = false;
  const readOnlyMes06 = false;
  const readOnlyMes07 = false;
  const readOnlyMes08 = false;
  const readOnlyMes09 = false;
  const readOnlyMes10 = false;
  const readOnlyMes11 = false;
  const readOnlyMes12 = false;
  const readOnly = editForm ? false : true;
  const focused = editForm;
  function validarValores(tipo="calculo") {
    const errorList = [];

    if (!contrato.TF_T_DATAINICIO)
      errorList.push("Data Inicio não foi preenchida.");
    if (!contrato.TF_T_DATAFIM)
      errorList.push("Data Final não foi preenchida.");
    if (!tipo.includes('calculo') && !contrato.TF_T_VALORCONTRATO)
      errorList.push("Um Valor deve ser informado para distribuição");
    if (
      contrato.TF_T_VALORCONTRATO &&
      parseFloat(contrato.TF_T_VALORCONTRATO) === 0
    )
      errorList.push("O valor deve ser maior que zero.");

    if (errorList.length > 0) {
      setErrorMessage(`[${errorList.join("],[")}]`);
      setOpenError(true);
      return false;
    }
    return true;
  }

  function handleCalcularClick() {
    const field: any = {
      TF_T_VALOR_01: isNaN(parseFloat(contrato.TF_T_VALOR_01)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_01).toFixed(2),
      TF_T_VALOR_02: isNaN(parseFloat(contrato.TF_T_VALOR_02)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_02).toFixed(2),
      TF_T_VALOR_03: isNaN(parseFloat(contrato.TF_T_VALOR_03)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_03).toFixed(2),
      TF_T_VALOR_04: isNaN(parseFloat(contrato.TF_T_VALOR_04)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_04).toFixed(2),
      TF_T_VALOR_05: isNaN(parseFloat(contrato.TF_T_VALOR_05)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_05).toFixed(2),
      TF_T_VALOR_06: isNaN(parseFloat(contrato.TF_T_VALOR_06)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_06).toFixed(2),
      TF_T_VALOR_07: isNaN(parseFloat(contrato.TF_T_VALOR_07)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_07).toFixed(2),
      TF_T_VALOR_08: isNaN(parseFloat(contrato.TF_T_VALOR_08)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_08).toFixed(2),
      TF_T_VALOR_09: isNaN(parseFloat(contrato.TF_T_VALOR_09)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_09).toFixed(2),
      TF_T_VALOR_10: isNaN(parseFloat(contrato.TF_T_VALOR_10)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_10).toFixed(2),
      TF_T_VALOR_11: isNaN(parseFloat(contrato.TF_T_VALOR_11)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_11).toFixed(2),
      TF_T_VALOR_12: isNaN(parseFloat(contrato.TF_T_VALOR_12)) ? '0.00' : parseFloat(contrato.TF_T_VALOR_12).toFixed(2),
    };
    const colunas: any[] = Object.keys(field);
    if (validarValores()) {
      const somaMeses = colunas.map((item) => parseFloat(field[item])).reduce((soma, valor) => soma + valor, 0)
      setContrato({
        ...contrato,
        TF_T_VALORCONTRATO: somaMeses.toFixed(2),
      });
    }
  }

  function handleReplicarClick() {
    if (validarValores("replicar")) {
    const valorTotal = parseFloat(contrato.TF_T_VALORCONTRATO);
    const dataInicial = new Date(contrato.TF_T_DATAINICIO);
    const dataFinal = new Date(contrato.TF_T_DATAFIM);

    const meses = [];
    const currentDate = new Date(dataInicial);
    
    while (currentDate <= dataFinal) {
      const mes = currentDate.getMonth() + 1;
      meses.push(mes);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const difMeses = meses.length;
    const valorBruto = valorTotal / difMeses;
    const parcelas: number[] = [];

    for (let i = 0; i < difMeses; i++) {
      parcelas.push(parseFloat(valorBruto.toFixed(2)));
    }

    const soma = parcelas.reduce((acc, val) => acc + val, 0);
    const diferenca = parseFloat((valorTotal - soma).toFixed(2));
    parcelas[parcelas.length - 1] += diferenca;

    const controle: any = {};
    for (let i = 1; i <= 12; i++) {
      controle[`TF_T_VALOR_${("00" + i).slice(-2)}`] = "";
    }
    
    meses.forEach((mes, index) => {
      controle[`TF_T_VALOR_${("00" + mes).slice(-2)}`] = parcelas[index].toFixed(2);
    });
      setContrato({
        ...contrato,
        ...controle,
      });
    }
  }

  function handleClearFaturamentoClick() {
    setContrato({
      ...contrato,
      TF_T_VALOR_01: "",
      TF_T_VALOR_02: "",
      TF_T_VALOR_03: "",
      TF_T_VALOR_04: "",
      TF_T_VALOR_05: "",
      TF_T_VALOR_06: "",
      TF_T_VALOR_07: "",
      TF_T_VALOR_08: "",
      TF_T_VALOR_09: "",
      TF_T_VALOR_10: "",
      TF_T_VALOR_11: "",
      TF_T_VALOR_12: "",
      TF_T_VALORCONTRATO: "",
    });
  }

  return (
    <>
      <ModalErrorComponent
        onClose={() => setOpenError(false)}
        title={"Error Faturamento."}
        open={openError}
        message={errorMessage}
      />
      <Grid container spacing={1} marginTop={1}>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALORCONTRATO"
            label="ValorTotal"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly,
            }}
            value={contrato.TF_T_VALORCONTRATO}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALORCONTRATO: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled={readOnly}
            onClick={handleReplicarClick}
          >
            Replicar
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled={readOnly}
            onClick={handleCalcularClick}
          >
            Calcular
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            color="error"
            size="large"
            onClick={handleClearFaturamentoClick}
            disabled={readOnly}
          >
            <DeleteOutline />
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={1} marginTop={1}>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_01"
            label="Janeiro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes01,
            }}
            value={contrato.TF_T_VALOR_01}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_01: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_02"
            label="Fevereiro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes02,
            }}
            value={contrato.TF_T_VALOR_02}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_02: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_03"
            label="Março"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes03,
            }}
            value={contrato.TF_T_VALOR_03}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_03: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_04"
            label="Abril"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes04,
            }}
            
            value={contrato.TF_T_VALOR_04}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_04: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_05"
            label="Maio"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes05,
            }}
            value={contrato.TF_T_VALOR_05}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_05: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_06"
            label="Junho"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes06,
            }}
            value={contrato.TF_T_VALOR_06}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_06: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_07"
            label="Julho"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes07,
            }}
            value={contrato.TF_T_VALOR_07}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_07: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_08"
            label="Agosto"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes08,
            }}
            value={contrato.TF_T_VALOR_08}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_08: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_09"
            label="Setembro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes09,
            }}
            value={contrato.TF_T_VALOR_09}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_09: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_10"
            label="Outubro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes10,
            }}
            value={contrato.TF_T_VALOR_10}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_10: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_11"
            label="Novembro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes11,
            }}
            value={contrato.TF_T_VALOR_11}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_11: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TF_T_VALOR_12"
            label="Dezembro"
            variant="outlined"
            type="number"
            InputProps={{
              readOnly: readOnlyMes12,
            }}
            value={contrato.TF_T_VALOR_12}
            onChange={(e) =>
              setContrato({ ...contrato, TF_T_VALOR_12: e.target.value })
            }
          />
        </Grid>
      </Grid>
    </>
  );
}

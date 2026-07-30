import { TableRow, TableCell, TextField, Button, Stack } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import React from "react";

interface LinhaRateioProps {
  index: number;
  codCusto: string;
  nome: string;
  valor?: string;
  percentual?: string;
  codNat?: string;
  nomeNat?: string;
  isLoading: boolean;
  focused: boolean;
  currentEditingIndex: number | null;
  onBuscar: (index: number) => void;
  onLimpar: (index: number) => void;
  onChange: (
    index: number,
    campo:
      | "CODCCUSTO"
      | "NOME"
      | "VALOR"
      | "PERCENTUAL"
      | "CODTBORCAMENTO"
      | "DESCRICAO_NAT",
    valor: string,
  ) => void;
  getNaturezaOrcamentaria: (index: number) => void;
  disabled?: boolean;
}

export function LinhaRateio({
  index,
  codCusto,
  nome,
  valor,
  percentual,
  codNat,
  nomeNat,
  isLoading,
  focused,
  onChange,
  getNaturezaOrcamentaria,
}: LinhaRateioProps) {
  const handlerBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let valor = e.target.value;

    if (valor.includes(",")) {
      const [inteiro, decimal] = valor.split(",");
      valor = `${inteiro},${(decimal || "").padEnd(2, "0").slice(0, 2)}`;
    } else if (valor) {
      valor = `${valor},00`;
    }
    onChange(index, "VALOR", valor);
  };

  const onChangeValor = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let valor = e.target.value;

    valor = valor.replace(/[^\d,]/g, "");

    const partes = valor.split(",");
    if (partes.length > 2) {
      valor = partes[0] + "," + partes.slice(1).join("").replace(/,/g, "");
    }

    onChange(index, "VALOR", valor);
  };

  return (
    <TableRow>
      <TableCell sx={{ minWidth: 60 }}>
        <TextField
          label="Cód. Nat."
          size="small"
          // sx={{ width: '120px' }}
          name={`TMOV_T_CODTBORCAMENTO___${index + 1}`}
          value={codNat || ""}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => onChange(index, "CODTBORCAMENTO", e.target.value)}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Natureza Orçamentária"
            size="small"
            fullWidth
            name={`TMOV_T_TBORCAMENTO___${index + 1}`}
            value={nomeNat || ""}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => onChange(index, "DESCRICAO_NAT", e.target.value)}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={() => getNaturezaOrcamentaria(index)}
          >
            <SearchOutlined fontSize="small" />
          </Button>
        </Stack>
      </TableCell>
      <TableCell sx={{ minWidth: 60 }}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          name={`TF_T_VALOR_RATEIO_ESPELHADO___${index + 1}`}
          label="Valor (R$)"
          variant="outlined"
          type="text"
          disabled={isLoading}
          value={valor || ""}
          onChange={(e) => onChangeValor(e)}
          onBlur={(e) => handlerBlur(e)}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 60 }}>
        <TextField
          focused={focused}
          fullWidth
          size="small"
          name={`TF_T_PERCENTUAL_RATEIO___${index + 1}`}
          label="Rateio (%)"
          variant="outlined"
          type="text"
          disabled={true}
          InputProps={{
            endAdornment: "%",
            inputMode: "decimal",
          }}
          value={percentual || "0.00"}
        />
      </TableCell>

      <input
        type="hidden"
        name={`TMOV_T_CODCCUSTO_ESPELHADO___${index + 1}`}
        value={codCusto}
      />
      <input
        type="hidden"
        name={`DESCRICAO_CODCCUSTO_ESPELHADO___${index + 1}`}
        value={nome}
      />
    </TableRow>
  );
}

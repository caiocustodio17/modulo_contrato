import { Alert, Snackbar, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface VencimentoTextFieldProps {
  modalidade: string;
  dataEmissao: string;
  value: string;
  onChange: (value: string) => void;
}

export default function VencimentoTextField({
  modalidade,
  dataEmissao,
  value,
  onChange,
}: VencimentoTextFieldProps) {
  // 1. Estado para controlar o Toast (mensagem e visibilidade)
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  // Função para fechar o Toast quando o tempo expirar ou o usuário clicar no X
  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!value) return;

    // Função auxiliar para exibir a mensagem e limpar a data inválida
    const exibirAviso = (mensagem: string) => {
      setToast({ open: true, message: mensagem });
      onChange(""); // Limpa o campo
    };

    // Converter YYYY-MM-DD em Date sem fuso
    const [anoV, mesV, diaV] = value.split("-").map(Number);
    const dataVenc = new Date(anoV, mesV - 1, diaV);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 1. Validação: Emissão vs Vencimento
    if (dataEmissao) {
      const [anoE, mesE, diaE] = dataEmissao.split("-").map(Number);
      const dataEmis = new Date(anoE, mesE - 1, diaE);

      if (dataVenc < dataEmis) {
        exibirAviso("A Data de Emissão deve ser menor ou igual a Data de Vencimento.");
        onChange(""); // Limpa a data inválida
        return;
      }
    }

    // Prazos dinâmicos
    const cDateMais7 = new Date(hoje);
    cDateMais7.setDate(hoje.getDate() + 7);

    const cDateMais19 = new Date(hoje);
    cDateMais19.setDate(hoje.getDate() + 19);

    const diaDoMesVencimento = dataVenc.getDate();
    const estaNoIntervaloProibido = diaDoMesVencimento >= 25 && diaDoMesVencimento <= 31;

    // 2. Modalidade Regular (01)
    if (modalidade === "01") {
      if (dataVenc <= cDateMais19 || estaNoIntervaloProibido) {
        exibirAviso(
          "Atenção: A data de vencimento deve ser superior a 20 dias corridos a partir de hoje e não pode estar entre os dias 25 e 31."
        );
        onChange("");
      }
    }

    // 3. Modalidade Emergencial (02)
    if (modalidade === "02") {
      if (dataVenc < cDateMais7 || dataVenc > cDateMais19) {
        exibirAviso(
          "Atenção: A data de vencimento deve ser maior que 7 dias e menor que 20 dias a partir de hoje para Modalidade Emergencial."
        );
        onChange("");
      }
    }
  }, [value, modalidade, dataEmissao, onChange]);

  return (
    <>
      <TextField
        fullWidth
        size="small"
        id="TMOV_T_DATAVENCIMENTO"
        label="Vencimento"
        variant="outlined"
        focused
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={6000} // Se fecha automaticamente após 6 segundos
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Posição: Canto Superior Direito
      >
        <Alert
          onClose={handleCloseToast}
          severity="warning" // Deixa o popup em tom amarelado/laranja (Atenção)
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>

  );
}
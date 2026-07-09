import { ChangeEvent, useState } from "react";
import { boletoCalcularDataPorFator, boletoCapturaValor } from "../../../utils/dadosBoleto";
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext";

export default function useFormaPagamento() {
  const { listPagto, setListPagto } = useSolicitacaoPagamentoContext();
  const [idFormaPagto, setIdFormaPagto] = useState("");
  const tmovPagtoToSelect = [{ value: "-1", label: "Boleto" }];
  const [pagtoDataVencimento, setPagtoDataVencimento] = useState("");
  const [pagtoValor, setPagtoValor] = useState(0);
  const [pagtoCodigoBarras, setPagtoCodigoBarras] = useState("");

  function handleAddPayment() {
    setListPagto([
      ...listPagto,
      {
        TMOVPAGTO_T_IPTE: pagtoCodigoBarras,
        TMOVPAGTO_T_DATAVENCIMENTO: pagtoDataVencimento,
        TMOVPAGTO_T_VALOR: pagtoValor.toFixed(2),
        TMOVPAGTO_T_SEQF: (listPagto.length + 1).toString(),
        TMOVPAGTO_T_IDFORMAPAGTO: idFormaPagto.toString(),
      },
    ]);
    handleResetPagto();
  }
  function handleResetPagto() {
    setPagtoCodigoBarras("");
    setPagtoDataVencimento("");
    setPagtoValor(0);
  }
  function handleDeletePayment(id: number) {
    setListPagto(listPagto.filter((e) => parseInt(e.TMOVPAGTO_T_SEQF) !== id));
  }
  function handleCodigoBarrasChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const codigo = e.target.value;
    setPagtoCodigoBarras(codigo);
    setPagtoValor(boletoCapturaValor(codigo));
    setPagtoDataVencimento(boletoCalcularDataPorFator(codigo));
  }

  function handleClearPagamentoClick() {
    setListPagto([]);
  }
  return {
    handleAddPayment,
    handleClearPagamentoClick,
    handleCodigoBarrasChange,
    handleDeletePayment,
    tmovPagtoToSelect,
    setIdFormaPagto,
    idFormaPagto,
    pagtoCodigoBarras,
    pagtoValor,
    pagtoDataVencimento,
    setPagtoDataVencimento,
    setPagtoValor
  };
}

import axios, { AxiosError } from "axios";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import fluigConfig from "../../../config";
import { sqlBody } from "../../../utils/sqlBody";
import { useContratoContext } from "../../Contratos/hooks/useContratoContext";
import { IFormaPagtoForn } from "../@types/SolicitacaoPagamentoType";
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext";

export default function useDadosBancarios() {
  const { contrato } = useContratoContext();
  const { solicitacaoPagamento, setSolicitacaoPagamento, listPagto, setListPagto } =
    useSolicitacaoPagamentoContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [seqPagtoSelecionado, setSeqPagtoSelecionado] = useState<string>("");
  const [formaPagamentoList, setFormaPagamentoList] = useState<IFormaPagtoForn[]>([]);
  const [isLoadingFormaPagto, setIsLoadingFormaPagto] = useState(false);
  const [errorFormaPagto, setErrorFormaPagto] = useState("");

  useEffect(() => {
    if (contrato.TMOV_T_CODCFO) {
      getFormaPagtoForn();
    } else {
      setFormaPagamentoList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contrato.TMOV_T_CODCFO, contrato.TMOV_T_CODCOLCFO]);

  async function getFormaPagtoForn() {
    setIsLoadingFormaPagto(true);
    setErrorFormaPagto("");
    const parameters =
      "CODCOLCFO=" +
      (contrato.TMOV_T_CODCOLCFO ?? "") +
      "|CODCFO=" +
      (contrato.TMOV_T_CODCFO ?? "") +
      "|CODCOLIGADA=" +
      (contrato.TMOV_T_CODCOLIGADA ?? "") +
      "|BUSCADOR=";

    await axios({
      url: fluigConfig.formaPagto,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca: "FL.DS.G.4.002",
        parameters,
      }),
    })
      .then((r) => {
        const values = r.data?.content?.values;
        const primeiro = Array.isArray(values) ? values[0] : values;
        if (!primeiro) {
          setFormaPagamentoList([]);
          return;
        }

        const error = primeiro.ERRO;
        if (error) throw Error(error);

        const dados = JSON.parse(primeiro.MESSAGE);
        setFormaPagamentoList(Array.isArray(dados) ? dados : new Array(dados));
      })
      .catch((e) => {
        const detalhe =
          e instanceof AxiosError || e instanceof Error ? e.message : String(e);
        setErrorFormaPagto(
          `Falha ao buscar formas de pagamento do fornecedor.\nParâmetros usados: ${parameters}\nDetalhe: ${detalhe}`,
        );
        setFormaPagamentoList([]);
        console.error("getFormaPagtoForn - error:", e, "| parameters:", parameters);
      })
      .finally(() => {
        setIsLoadingFormaPagto(false);
      });
  }

  function handleChange(campo: string, valor: string) {
    setSolicitacaoPagamento({ ...solicitacaoPagamento, [campo]: valor });
  }

  function handleFormaPagamentoChange(idPgto: string) {
    const forma = formaPagamentoList.find(
      (item) => String(item.IDPGTO) === String(idPgto),
    );
    setSolicitacaoPagamento({
      ...solicitacaoPagamento,
      TMOV_T_IDFORMAPAGTO: idPgto,
      TMOV_T_DESCIDFORMAPAGTO: forma?.DESCRICAO ?? "",
      FDADOSPGTO_T_NUMEROBANCO: forma?.NUMEROBANCO ?? "",
      FDADOSPGTO_T_CODIGOAGENCIA: forma?.CODIGOAGENCIA ?? "",
      FDADOSPGTO_T_DIGITOAGENCIA: forma?.DIGITOAGENCIA ?? "",
      FDADOSPGTO_T_CONTACORRENTE: forma?.CONTACORRENTE ?? "",
      FDADOSPGTO_T_DIGITOCONTA: forma?.DIGITOCONTA ?? "",
    });
  }

  function somenteNumeros(valor: string, tamanho: number) {
    return valor.replace(/\D/g, "").slice(0, tamanho);
  }

  function handleAddRowPagto() {
    setListPagto([
      ...listPagto,
      {
        TMOVPAGTO_T_SEQF: (listPagto.length + 1).toString(),
        TMOVPAGTO_T_IDFORMAPAGTO: solicitacaoPagamento.TMOV_T_IDFORMAPAGTO ?? "",
        TMOVPAGTO_T_DESCFORMAPAGTO: solicitacaoPagamento.TMOV_T_DESCIDFORMAPAGTO ?? "",
        TMOVPAGTO_T_IPTE: "",
        TMOVPAGTO_T_DATAVENCIMENTO: "",
        TMOVPAGTO_T_VALOR: "",
      },
    ]);
  }

  function handleMenuOpen(e: MouseEvent<HTMLElement>, seq: string) {
    setMenuAnchor(e.currentTarget);
    setSeqPagtoSelecionado(seq);
  }

  function handleMenuClose() {
    setMenuAnchor(null);
    setSeqPagtoSelecionado("");
  }

  function handleReplicatePagto() {
    const pagto = listPagto.find((item) => item.TMOVPAGTO_T_SEQF === seqPagtoSelecionado);
    if (pagto) {
      setListPagto([
        ...listPagto,
        { ...pagto, TMOVPAGTO_T_SEQF: (listPagto.length + 1).toString() },
      ]);
    }
    handleMenuClose();
  }

  function handleDeletePagto() {
    setListPagto(listPagto.filter((item) => item.TMOVPAGTO_T_SEQF !== seqPagtoSelecionado));
    handleMenuClose();
  }

  function handlePagtoFieldChange(seq: string, campo: string, valor: string) {
    setListPagto(
      listPagto.map((item) =>
        item.TMOVPAGTO_T_SEQF === seq ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  const valorTotalPagto = useMemo(
    () =>
      listPagto
        .reduce((total, item) => total + (parseFloat(item.TMOVPAGTO_T_VALOR ?? "0") || 0), 0)
        .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [listPagto],
  );

  return {
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
  };
}

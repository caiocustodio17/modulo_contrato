import { GridRowParams } from "@mui/x-data-grid";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../../config";
import { sqlBody } from "../../../utils/sqlBody";
import { useContratoContext } from "../../Contratos/hooks/useContratoContext";
import { ITItmmov, ITItmmovData } from "../@types/SolicitacaoPagamentoType";
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext";

export default function useItensPagamento() {
  const {
    setListItems,
    listItems,
    setListItemsSelect,
    setOpenSelectItem,
    setItemSelecionado,
    setOpenInvoiceItemSelect,
    itemSelecionado,
    invoiceItemSelected,
  } = useSolicitacaoPagamentoContext();
  const { contrato, setError, setOpenError, listRateio } = useContratoContext();
  const { solicitacaoPagamento } = useSolicitacaoPagamentoContext();
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState<ITItmmov>({} as ITItmmov);
  // function validarBusca() {
  //   const localError = [];
  //   if (!notaSelecioanda.model_type)
  //     localError.push(
  //       "Favor selecionar uma nota fiscal para continuar com a operação."
  //     );
  //   if (localError.length > 0) {
  //     setError(`[${localError.join("],[")}]`);
  //     setOpenError(true);
  //   } else {
  //     setIsLoading(true);
  //     getProdutos();
  //   }
  // }
  function handleSearchItemClick() {
    const errors: string[] = [];
    if (!contrato.TMOV_T_CODCOLIGADA)
      errors.push("Favor selecionar uma coligada.");
    if (!solicitacaoPagamento.TMOVCOMPL_T_CODTIPO)
      errors.push("Favor selecionar o tipo (Serviço/Mercadoria).");
    const temNat =
      listRateio.some((r) => r.CODTBORCAMENTO && r.CODTBORCAMENTO !== "null") ||
      !!contrato.TMOV_T_CODTBORCAMENTO;
    if (!temNat)
      errors.push("Favor informar ao menos uma natureza orçamentária no rateio.");
    if (errors.length > 0) {
      setError(errors.join("\n"));
      setOpenError(true);
      return;
    }
    setListItemsSelect([]);
    setIsLoading(true);
    getProdutos();
  }

  function handleClearItemClick() {
    setItemSelecionado({} as ITItmmovData);
  }
  function handleAddItemClick() {
    const codNatProduto = itemSelecionado.CODTBORCAMENTO;
    const natDoRateio = listRateio.find(
      (r) => r.CODTBORCAMENTO === codNatProduto,
    );

    setListItems([
      ...listItems,
      {
        TITMMOV_T_SEQF: (listItems.length + 1).toString(),
        TITMMOV_T_CODIGOPRD: itemSelecionado.CODIGOPRD,
        TITMMOV_T_NOMEFANTASIA: itemSelecionado.NOMEFANTASIA,
        TITMMOV_T_CODUND: itemSelecionado.CODUND,
        TITMMOV_T_IDPRD: itemSelecionado.IDPRD?.toString(),
        TITMMOV_T_CODTBORCAMENTO:
          codNatProduto || natDoRateio?.CODTBORCAMENTO || contrato.TMOV_T_CODTBORCAMENTO,
        TITMMOV_T_DESCTBORCAMENTO:
          codNatProduto || natDoRateio?.DESCRICAO_NAT || contrato.TMOV_T_TBORCAMENTO,
        TITMMOV_T_PRECOUNITARIO: invoiceItemSelected.unit_price?.toFixed(2),
        TITMMOV_T_QUANTIDADE: invoiceItemSelected.quantity?.toFixed(2),
        TITMMOV_T_VALORTOTALITEM: invoiceItemSelected.total_value?.toFixed(2),
      },
    ]);
  }
  function handleSearchInvoiceItemClick() {
    setOpenInvoiceItemSelect(true);
  }
  function handleRowSelectedClick(params: GridRowParams) {
    const item = params.row;
    setItemSelecionado(item);
    setOpenSelectItem(false);
  }
  async function getProdutos() {
    // Build CODTBORCAMENTO filter from contract rateio
    const codigosNat = Array.from(
      new Set(
        listRateio
          .map((r) => r.CODTBORCAMENTO)
          .filter((c): c is string => !!c && c !== "null" && c !== "undefined"),
      ),
    );

    // Fallback: se o rateio ainda nao carregou (listRateio vazio), usa a natureza do contrato.
    if (codigosNat.length === 0 && contrato.TMOV_T_CODTBORCAMENTO) {
      codigosNat.push(contrato.TMOV_T_CODTBORCAMENTO);
    }

    // CSV das naturezas (ex.: "35.01.04,35.01.05"). Sem codigos => "@" (sentinela = todos).
    // RM nao aceita parametro nomeado com valor vazio, entao NUNCA mandamos vazio.
    // "@" e tratado na sentenca FL.DS.G.1 como "sem filtro / todos os produtos".
    const filtroNat = codigosNat.length > 0 ? codigosNat.join(",") : "@";

    const parameters =
      "CODCOLIGADA=" +
      contrato.TMOV_T_CODCOLIGADA +
      ";TIPO=" +
      solicitacaoPagamento.TMOVCOMPL_T_CODTIPO +
      ";LIMITEFLUIG=300" +
      ";BUSCADOR=" +
      `${itemSelecionado.CODIGOPRD ?? "@"}%${itemSelecionado.NOMEFANTASIA ?? "@"}` +
      ";CODTBORCAMENTO=" +
      filtroNat;

    console.log("filtros nat", filtroNat);
    console.log("itensRateio", listRateio);

    await axios({
      url: fluigConfig.produtos,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca: "FL.DS.G.1",
        parameters,
      }),
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);

        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        setListItemsSelect(Array.isArray(dados) ? dados : new Array(dados));
        setError("");
      })
      .catch((e) => {
        const detalhe =
          e instanceof AxiosError || e instanceof Error ? e.message : String(e);
        setError(
          `Falha ao buscar produtos.\nParâmetros usados: ${parameters}\nDetalhe: ${detalhe}`,
        );
        setOpenError(true);
        console.error("getProdutos- error: ", e, "| parameters:", parameters);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenSelectItem(true);
      });
  }
  return {
    isLoading,
    handleSearchItemClick,
    handleClearItemClick,
    handleRowSelectedClick,
    handleAddItemClick,
    handleSearchInvoiceItemClick,
    item,
    setItem,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AddOutlined,
  ClearAll,
  DeleteOutline,
  LinkOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useContratoContext } from "../../Contratos/hooks/useContratoContext";
import {
  ITItmmov,
  //ITItmmovData
} from "../@types/SolicitacaoPagamentoType";
import fluigConfig from "../../../config";
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext";
import InvoiceItemsModalSelect from "./InvoiceItemModalSelect";
import ItensModalSelect from "./ItemModalSelect";
import useItensPagamento from "./useItensPagamento";

export default function ItensPagamentoForm({ readOnly = false }: { readOnly?: boolean }) {
  const { contrato, listRateio } = useContratoContext();
  const {
    isLoading,
    handleSearchItemClick,
    handleClearItemClick,
    handleSearchInvoiceItemClick,
  } = useItensPagamento();
  const {
    listItems,
    itemSelecionado,
    setItemSelecionado,
    setListItems,
    solicitacaoPagamento,
    setSolicitacaoPagamento,
  } = useSolicitacaoPagamentoContext();
  const [data, setData] = useState<ITItmmov[]>([]);
  const [valorAux, setValorAux] = useState<string>("");

  useEffect(() => {
    try {
      // Example: get itensString from window.location.search or another source
      const searchParams = new URLSearchParams(window.location.search);
      const itensString = searchParams.get("itens") || "[]";
      const itensRecebidos = JSON.parse(decodeURIComponent(itensString));

      const itensAdaptados: ITItmmov[] = itensRecebidos.map(
        (item: any, idx: number) => ({
          TITMMOV_T_SEQF: (idx + 1).toString(),
          TITMMOV_T_CODIGOPRD: item.codigo,
          TITMMOV_T_NOMEFANTASIA: item.nome,
          TITMMOV_T_CODUND: item.codUni || "",
          TITMMOV_T_IDPRD: item.idPrd,
          TITMMOV_T_CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO,
          TITMMOV_T_DESCTBORCAMENTO: item.natureza,
          TITMMOV_T_PRECOUNITARIO: item.valor,
          TITMMOV_T_QUANTIDADE: item.quantidade || "1",
          TITMMOV_T_VALORTOTALITEM: item.valor,
        }),
      );
      setListItems(itensAdaptados);
    } catch (e) {
      console.log("❌ Erro ao processar itens recebidos via URL:", e);
    }
  }, [contrato, setListItems]);

  useEffect(() => {
    setData(
      listItems.map((item, idx) => {
        return { ...item, id: idx };
      }),
    );
    return () => {
      setData([]);
    };
  }, [listItems]);

  const findLastPayment = useCallback(async () => {
    if (!contrato.IDFLUIG) {
      console.warn("[findLastPayment] IDFLUIG não encontrado no contrato.");
      return;
    }

    try {
      console.log(`[findLastPayment] Buscando histórico ou dados originais para IDFLUIG: ${contrato.IDFLUIG}`);

      // 1. Busca histórico de pagamentos (ML001090 e ML001091)
      const responsePagamento = await axios.post(fluigConfig.datasetUrl, {
        name: "ds_dw_sql",
        fields: [
          `SELECT TOP 1 ml91.* FROM ML001090 ml90
         JOIN ML001091 ml91 ON ml90.documentid = ml91.documentid
         WHERE ml90.TCNT_T_IDCONTRATO = '${contrato.IDFLUIG}' 
         ORDER BY ml90.documentid DESC`,
          `java:/jdbc/AppDS`,
        ],
      });

      const valoresPagamento = Array.isArray(responsePagamento.data.content.values)
        ? responsePagamento.data.content.values
        : responsePagamento.data.content.values ? [responsePagamento.data.content.values] : [];

      // 2. Se NÃO houver pagamento anterior, busca os itens ORIGINAIS do contrato
      if (valoresPagamento.length === 0) {
        console.info("[findLastPayment] Sem pagamentos anteriores. Buscando dados nas tabelas ML001134/ML001144/ML001143.");

        const responseContrato = await axios.post(fluigConfig.datasetUrl, {
          name: "ds_dw_sql",
          fields: [
            `SELECT 
              ml44.TITMMOV_T_IDPRD,
              ml44.TITMMOV_T_CODIGOPRD,
              ml44.TITMMOV_T_NOMEFANTASIA,
              ml44.TITMMOV_T_CODUND,
              ml44.TITMMOV_T_QUANTIDADE,
              ml44.TITMMOV_T_PRECOUNITARIO,
              ml44.TITMMOV_T_VALORTOTALITEM,
              ml43.TMOV_T_CODTBORCAMENTO,
              ml43.TMOV_T_TBORCAMENTO
           FROM ML001134 ml34
           INNER JOIN ML001144 ml44 ON ml34.documentid = ml44.documentid
           LEFT JOIN ML001143 ml43 ON ml34.documentid = ml43.documentid
           WHERE ml34.processNumber = '${contrato.IDFLUIG}'`,
            `java:/jdbc/AppDS`,
          ],
        });

        const itensOriginais = Array.isArray(responseContrato.data.content.values)
          ? responseContrato.data.content.values
          : responseContrato.data.content.values ? [responseContrato.data.content.values] : [];

        if (itensOriginais.length > 0) {
          const mappedItens = itensOriginais.map((item: any, idx: number) => ({
            TITMMOV_T_SEQF: String(idx + 1),
            TITMMOV_T_CODIGOPRD: item.TITMMOV_T_CODIGOPRD,
            TITMMOV_T_NOMEFANTASIA: item.TITMMOV_T_NOMEFANTASIA,
            TITMMOV_T_CODUND: item.TITMMOV_T_CODUND,
            TITMMOV_T_IDPRD: item.TITMMOV_T_IDPRD || "",
            TITMMOV_T_CODTBORCAMENTO: item.TMOV_T_CODTBORCAMENTO || contrato.TMOV_T_CODTBORCAMENTO,
            TITMMOV_T_DESCTBORCAMENTO: item.TMOV_T_TBORCAMENTO || contrato.TMOV_T_TBORCAMENTO,
            TITMMOV_T_QUANTIDADE: item.TITMMOV_T_QUANTIDADE,
            TITMMOV_T_PRECOUNITARIO: item.TITMMOV_T_PRECOUNITARIO,
            TITMMOV_T_VALORTOTALITEM: item.TITMMOV_T_VALORTOTALITEM,
          }));

          console.log("[findLastPayment] Itens originais carregados com sucesso:", mappedItens);
          setListItems(mappedItens);
          return;
        }
        return;
      }

      // 3. Se houver histórico de pagamento, usa o último como base
      const ultimo = valoresPagamento[0];
      const itemInserir: ITItmmov = {
        TITMMOV_T_SEQF: (listItems.length + 1).toString(),
        TITMMOV_T_CODIGOPRD: ultimo.TITMMOV_T_CODIGOPRD,
        TITMMOV_T_NOMEFANTASIA: ultimo.TITMMOV_T_NOMEFANTASIA,
        TITMMOV_T_CODUND: ultimo.TITMMOV_T_CODUND,
        TITMMOV_T_IDPRD: ultimo.TITMMOV_T_IDPRD,
        TITMMOV_T_CODTBORCAMENTO: ultimo.TITMMOV_T_CODTBORCAMENTO || contrato.TMOV_T_CODTBORCAMENTO,
        TITMMOV_T_DESCTBORCAMENTO: ultimo.TITMMOV_T_DESCTBORCAMENTO || contrato.TMOV_T_TBORCAMENTO,
        TITMMOV_T_PRECOUNITARIO: ultimo.TITMMOV_T_PRECOUNITARIO,
        TITMMOV_T_QUANTIDADE: ultimo.TITMMOV_T_QUANTIDADE,
        TITMMOV_T_VALORTOTALITEM: (
          Number(ultimo.TITMMOV_T_PRECOUNITARIO) * parseFloat(ultimo.TITMMOV_T_QUANTIDADE)
        ).toFixed(2),
      };

      console.log("[findLastPayment] Inserindo item baseado no último pagamento.");
      setListItems([...listItems, itemInserir]);

    } catch (e) {
      console.error("[findLastPayment] Erro crítico: ", e);
    }
  }, [
    contrato.IDFLUIG,
    contrato.TMOV_T_CODTBORCAMENTO,
    contrato.TMOV_T_TBORCAMENTO,
    contrato.TF_T_VALORCONTRATO,
    listItems,
    setListItems,
  ]);

  useEffect(() => {
    if (contrato.IDFLUIG && listItems.length === 0) {
      void findLastPayment();
    }
  }, [contrato.IDFLUIG, listItems.length, findLastPayment]);

  const columnsItens: GridColDef[] = [
    { field: "TITMMOV_T_SEQF", headerName: "#", width: 50 },
    { field: "TITMMOV_T_CODIGOPRD", headerName: "Cód. Item", width: 100 },
    { field: "TITMMOV_T_NOMEFANTASIA", headerName: "Item", width: 200 },
    { field: "TITMMOV_T_CODUND", headerName: "Cód. Und.", width: 100 },
    {
      field: "TITMMOV_T_DESCTBORCAMENTO",
      headerName: "Nat. Orçamentária",
      width: 150,
    },
    { field: "TITMMOV_T_QUANTIDADE", headerName: "Qtde.", width: 100 },
    { field: "TITMMOV_T_PRECOUNITARIO", headerName: "R$ Unit.", width: 100 },
    { field: "TITMMOV_T_VALORTOTALITEM", headerName: "R$ Total", width: 100 },
    {
      field: "",
      headerName: "...",
      type: "actions",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutline color="error" />}
          label="Excluir Item"
          onClick={() => {
            setListItems(
              listItems.filter(
                (e) => e.TITMMOV_T_SEQF !== params.row.TITMMOV_T_SEQF,
              ),
            );
          }}
        />,
      ],
    },
  ];
  function handleAddItemSolicitacao() {
    const codNatProduto = itemSelecionado.CODTBORCAMENTO;
    const natDoRateio = listRateio.find(
      (r) => r.CODTBORCAMENTO === codNatProduto,
    );

    const itemInserir: ITItmmov = {
      TITMMOV_T_SEQF: (listItems.length + 1).toString(),
      TITMMOV_T_CODIGOPRD: itemSelecionado.CODIGOPRD,
      TITMMOV_T_NOMEFANTASIA: itemSelecionado.NOMEFANTASIA,
      TITMMOV_T_CODUND: itemSelecionado.CODUND,
      TITMMOV_T_IDPRD: itemSelecionado.IDPRD?.toString(),
      TITMMOV_T_CODTBORCAMENTO:
        codNatProduto ||
        natDoRateio?.CODTBORCAMENTO ||
        contrato.TMOV_T_CODTBORCAMENTO,
      TITMMOV_T_DESCTBORCAMENTO:
        codNatProduto || natDoRateio?.DESCRICAO_NAT || contrato.TMOV_T_TBORCAMENTO,
      TITMMOV_T_PRECOUNITARIO: itemSelecionado.PRECOUNITARIO?.toFixed(2),
      TITMMOV_T_QUANTIDADE: itemSelecionado.QUANTIDADE ?? "",
      TITMMOV_T_VALORTOTALITEM: (
        itemSelecionado.PRECOUNITARIO * parseFloat(itemSelecionado.QUANTIDADE)
      ).toFixed(2),
    };
    if (
      itemInserir.TITMMOV_T_CODIGOPRD == "undefined" ||
      itemInserir.TITMMOV_T_QUANTIDADE == "" ||
      itemInserir.TITMMOV_T_PRECOUNITARIO == "undefined" ||
      itemInserir.TITMMOV_T_NOMEFANTASIA == "undefined"
    ) {
      return;
    }

    setListItems([...listItems, itemInserir]);
    //setItemSelecionado({} as ITItmmovData)
  }

  return (
    <>
      {!readOnly && <Grid container spacing={1} marginTop={1}>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Tipo"
            focused
            value={solicitacaoPagamento.TMOVCOMPL_T_CODTIPO ?? ""}
            onChange={(e) =>
              setSolicitacaoPagamento({
                ...solicitacaoPagamento,
                TMOVCOMPL_T_CODTIPO: e.target.value,
              })
            }
          >
            <MenuItem value="S">Serviço</MenuItem>
            <MenuItem value="P">Produto</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            id="TITMMMOV_T_CODIGOPRD"
            label="Cód. Produto"
            focused
            value={itemSelecionado.CODIGOPRD ?? ""}
            onChange={(e) =>
              setItemSelecionado({
                ...itemSelecionado,
                CODIGOPRD: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            size="small"
            id="TITMMMOV_T_NOMEFANTASIA"
            label="Item"
            focused
            value={itemSelecionado.NOMEFANTASIA ?? ""}
            onChange={(e) =>
              setItemSelecionado({
                ...itemSelecionado,
                NOMEFANTASIA: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            aria-label="Buscar produto do RM"
            onClick={handleSearchItemClick}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : <SearchOutlined />}
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <TextField
            fullWidth
            size="small"
            id="TITMMOV_T_QUANTIDADE"
            label="Qtde."
            focused
            type="number"
            value={itemSelecionado.QUANTIDADE ?? ""}
            onChange={(e) =>
              setItemSelecionado({
                ...itemSelecionado,
                QUANTIDADE: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <TextField
            fullWidth
            size="small"
            id="TITMMMOV_T_PRECOUNITARIO"
            label="R$ Unit."
            focused
            type="number"
            value={valorAux ?? ""}
            onChange={(e) => {
              setValorAux(e.target.value);
            }}
            onBlur={() => {
              setItemSelecionado({
                ...itemSelecionado,
                PRECOUNITARIO: parseFloat(valorAux),
              });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            aria-label="Vincular com itens da nota"
            onClick={handleSearchInvoiceItemClick}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : <LinkOutlined />}
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            color="success"
            aria-label="incluir item na solicitação"
            onClick={handleAddItemSolicitacao}
          >
            <AddOutlined />
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            color="error"
            aria-label="limpar busca"
            onClick={handleClearItemClick}
          >
            <DeleteOutline />
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            color="error"
            aria-label="Remover tudo"
            onClick={() => {
              setListItems([]);
              handleClearItemClick();
            }}
          >
            <ClearAll />
          </Button>
        </Grid>
      </Grid>}

      <Box sx={{ width: "100%", height: 200, mt: 2 }}>
        <DataGrid columns={columnsItens} rows={data} density="compact" />
      </Box>
      <ItensModalSelect />
      <InvoiceItemsModalSelect />
    </>
  );
}

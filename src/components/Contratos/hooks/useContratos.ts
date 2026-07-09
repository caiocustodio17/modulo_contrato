import { GridRowParams } from "@mui/x-data-grid";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import fluigConfig from "../../../config";
import { IContratoData } from "../ContratosTypes";
import { useContratoContext } from "./useContratoContext";
import { sqlBody } from "../../../utils/sqlBody";

export default function useContratos() {
  const {
    setContrato,
    setEditForm,
    setError,
    setOpenError,
    setMedicoes,
    setOpenEdit,
    setResponsaveis,
    setListRateio,
    setOpenMedicao,
    contrato,
  } = useContratoContext();
  const [data, setData] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const handleRowClick = (params: GridRowParams<IContratoData>) => {
    void ToleranciaContrato(params.row);
    void MedicoesContrato(params.row);
    void GetResponsavel(params.row);
    void RateioList(params.row);
    setContrato(params.row);
  };

  const handleRow = (params: IContratoData) => {
    void ToleranciaContrato(params);
    void MedicoesContrato(params);
    void GetResponsavel(params);
    void RateioList(params);
    setContrato(params);
    setError("");
    if (params.STATUSCODE == "2") {
      setEditForm(false);
      setOpenMedicao(true);
    } else {
      setError("Somente contratos em andamento podem ser medidos.");
      setOpenError(true);
    }
  };

  const handleDoubleRowClick = (params: GridRowParams<IContratoData>) => {
    setEditForm(false);
    setContrato(params.row);
    void GetResponsavel(params.row);
    void RateioList(params.row);
    setOpenEdit(true);
  };
  const handleRefreshClick = () => {
    setLoading(true);
    getContratos();
  };

  useEffect(() => {
    getContratos();
  }, []);

  async function RateioList(item: IContratoData) {
    await axios
      .post(fluigConfig.datasetUrl, {
        name: "ds_dw_sql",
        fields: [
          `SELECT
              [NOME] = ISNULL(ml34.DESCRICAO_CODCCUSTO, ''), 
              [CODCCUSTO] = ISNULL(ml34.TMOV_T_CODCCUSTO, ''), 
              [DESCRICAO_NAT] = ISNULL(ml44.TMOV_T_TBORCAMENTO, ''),
              
              [VALOR] = ISNULL(ml44.TF_T_VALOR_RATEIO_ESPELHADO, '0.00'),
              [PERCENTUAL] = ISNULL(ml44.TF_T_PERCENTUAL_RATEIO, '100.00'),
              [CODTBORCAMENTO] = ISNULL(ml44.TMOV_T_CODTBORCAMENTO, '')
            FROM ML001134 ml34
              INNER JOIN ML001143 ml44 on ml34.documentid = ml44.documentid
              WHERE ml34.processNumber = '${item.IDFLUIG}'`,
          `java:/jdbc/AppDS`,
        ],
      })
      .then((r) => {
        const dadosRecebidos = r.data.content.values;

        console.table(dadosRecebidos);

        setListRateio(r.data.content.values);
      })
      .catch((e) => {
        console.error("--- [DEBUG] RateioList Erro ---", e);
        setError(e instanceof AxiosError ? e.message : String(e));
        setOpenError(true);
      });
  }
  async function MedicoesContrato(item: IContratoData) {
    await axios
      .post(fluigConfig.datasetUrl, {
        name: "ds_dw_sql",
        fields: [
          `SELECT
              SPV2.*,
                  [id] = SPV2.DOCUMENTID,
                  [STATUSNAME] =CASE
                      WHEN PWF.STATUS = 0 THEN 'Aberto'
                      WHEN PWF.STATUS = 1 THEN 'Cancelado'
                      WHEN PWF.STATUS = 2 THEN 'Finalizado'
                      ELSE '-x-'
                  END,
                  [STATUSCODE] = PWF.STATUS,
                  [IDFLUIG] = PWF.NUM_PROCES
              FROM ML001090 SPV2 (NOLOCK)
              INNER JOIN PROCES_WORKFLOW PWF (NOLOCK) ON
              SPV2.DOCUMENTID = PWF.NR_DOCUMENTO_CARD
              WHERE 1=1
              AND PWF.START_DATE >= '2023-09-01'
              AND PWF.STATUS IN (0,2)
              AND SPV2.TCNT_T_IDCONTRATO = '${item.IDFLUIG}'
          `,
          `java:/jdbc/AppDS`,
        ],
      })
      .then((r) => {
        setMedicoes(r.data.content.values);
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        setOpenError(true);
      });
  }
  async function ToleranciaContrato(item: IContratoData) {
    await axios
      .post(
        fluigConfig.contratos,
        sqlBody({
          codSentenca: "FL.DS.5.0037",
          parameters:
            `CODCOLIGADA=${item.TMOV_T_CODCOLIGADA}|` +
            `CODFILIAL=${item.TMOV_T_CODFILIAL}|` +
            `CODCCUSTO=${item.TMOV_T_CODCCUSTO}|` +
            `LIMITEFLUIG=300|` +
            `BUSCADOR=${item.TMOV_T_TBORCAMENTO}`,
        }),
      )
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) {
          setContrato(item);
          return;
        }
        const objJson = JSON.parse(r.data.content.values[0].MESSAGE);
        const dados = Array.isArray(objJson) ? objJson : new Array(objJson);
        setContrato({
          ...item,
          TOL_VALORFIL: dados[0].TOL_VALORFIL ?? "",
          TOL_PERCFIL: dados[0].TOL_PERCFIL ?? "",
          TOL_VALORGLB: dados[0].TOL_VALORGLB ?? "",
          TOL_PERCGLB: dados[0].TOL_PERCGLB ?? "",
          TOL_VALORGERAL: dados[0].TOL_VALORGERAL ?? "",
          TOL_PERCGERAL: dados[0].TOL_PERCGERAL ?? "",
        });
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        setOpenError(true);
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function GetResponsavel(item: any) {
    const body = {
      name: "ds_dw_sql",
      fields: [
        `SELECT * FROM ${fluigConfig.ml[1]} RESP (NOLOCK) 
        WHERE RESP.DOCUMENTID = '${item.documentid}' AND RESP.VERSION = '${item.version}' AND RESP.MASTERID = '${item.ID}'`,
        `java:/jdbc/AppDS`,
      ],
    };
    await axios({
      url: fluigConfig.datasetUrl,
      method: fluigConfig.method,
      data: body,
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);
        const response = r.data;
        if (response.content.values) {
          setResponsaveis(
            Array.isArray(response.content.values)
              ? response.content.values
              : new Array(response.content.values),
          );
        }
      })
      .catch((e) => {
        setErr(e instanceof AxiosError ? e.message : String(e));
        console.error("getResponsavel - error: ", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  async function getContratos() {
    if (data.length > 1 || contrato.IDFLUIG != undefined) return;

    const fmtValor = (v: string) =>
      v?.replace(/\./g, "").replace(",", ".") ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processarItem = (item: any): any => ({
      ...item,
      id: item.ID,
      TMOV_T_CODTBORCAMENTO: item.TMOV_T_CODTBORCAMENTO_AGG || "",
      TMOV_T_TBORCAMENTO: item.TMOV_T_TBORCAMENTO_AGG || "",
      TF_T_VALORCONTRATO: fmtValor(item.TF_T_VALORCONTRATO),
      TF_T_VALOR_01: fmtValor(item.TF_T_VALOR_01),
      TF_T_VALOR_02: fmtValor(item.TF_T_VALOR_02),
      TF_T_VALOR_03: fmtValor(item.TF_T_VALOR_03),
      TF_T_VALOR_04: fmtValor(item.TF_T_VALOR_04),
      TF_T_VALOR_05: fmtValor(item.TF_T_VALOR_05),
      TF_T_VALOR_06: fmtValor(item.TF_T_VALOR_06),
      TF_T_VALOR_07: fmtValor(item.TF_T_VALOR_07),
      TF_T_VALOR_08: fmtValor(item.TF_T_VALOR_08),
      TF_T_VALOR_09: fmtValor(item.TF_T_VALOR_09),
      TF_T_VALOR_10: fmtValor(item.TF_T_VALOR_10),
      TF_T_VALOR_11: fmtValor(item.TF_T_VALOR_11),
      TF_T_VALOR_12: fmtValor(item.TF_T_VALOR_12),
      STATUSNAME:
        item.STATUSCODE == 0
          ? "Cadastrando"
          : item.STATUSCODE == 1
            ? "Cancelado"
            : item.STATUSCODE == 2 && new Date(item.TF_T_DATAFIM) < new Date()
              ? "Vencido"
              : "Andamento",
    });

    const body = {
      name: "ds_dw_sql",
      fields: [
        `SELECT
          ML.*,
          [STATUSCODE] = PWF.STATUS,
          [IDFLUIG] = PWF.NUM_PROCES,
          [TMOV_T_CODTBORCAMENTO_AGG] = STUFF((
            SELECT ',' + ml44.TMOV_T_CODTBORCAMENTO
            FROM ML001143 ml44 (NOLOCK)
            WHERE ml44.documentid = ML.documentid
              AND ISNULL(ml44.TMOV_T_CODTBORCAMENTO, '') NOT IN ('', 'null')
            FOR XML PATH('')
          ), 1, 1, ''),
          [TMOV_T_TBORCAMENTO_AGG] = STUFF((
            SELECT ',' + ml44.TMOV_T_TBORCAMENTO
            FROM ML001143 ml44 (NOLOCK)
            WHERE ml44.documentid = ML.documentid
              AND ISNULL(ml44.TMOV_T_TBORCAMENTO, '') NOT IN ('', 'null')
            FOR XML PATH('')
          ), 1, 1, '')
        FROM ${fluigConfig.ml[0]} ML (NOLOCK)
          INNER JOIN DOCUMENTO DOC (NOLOCK) ON
            ML.DOCUMENTID = DOC.NR_DOCUMENTO
            AND ML.VERSION = DOC.NR_VERSAO
            AND DOC.VERSAO_ATIVA = 1
          INNER JOIN PROCES_WORKFLOW PWF (NOLOCK) ON
            ML.DOCUMENTID = PWF.NR_DOCUMENTO_CARD
        WHERE 1=1
          AND ML.TMOV_T_CGCFIL IS NOT NULL
        `,
        `java:/jdbc/AppDS`,
      ],
    };
    await axios({
      url: fluigConfig.contratos,
      method: fluigConfig.method,
      data: body,
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);
        const response = r.data;
        if (response.content.values) {
          const raw = Array.isArray(response.content.values)
            ? response.content.values
            : [response.content.values];
          const processed = raw.map(processarItem);
          setData(processed);
          const params = new URLSearchParams(window.location.search);
          const objParams = Object.fromEntries(params.entries());
          if (objParams.contrato != undefined) {
            const resultContrato = processed.find(
              (item: IContratoData) => item.IDFLUIG === objParams.contrato,
            );
            handleRow(resultContrato);
          }
        }
      })
      .catch((e) => {
        setErr(e instanceof AxiosError ? e.message : String(e));
        console.error("getContratos - error: ", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return {
    data,
    err,
    loading,
    handleDoubleRowClick,
    handleRowClick,
    handleRefreshClick,
  };
}

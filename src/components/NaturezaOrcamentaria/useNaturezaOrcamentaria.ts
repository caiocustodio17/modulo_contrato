import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useNaturezaOrcamentariaContext } from "./useNaturezaOrcamentariaContext";

export default function useNaturezaOrcamentaria() {
  const { contrato, editForm, setContrato, setError } = useContratoContext();
  const { setNaturezasOrcamentaria, setOpenNaturezaOrcamentaria } =
    useNaturezaOrcamentariaContext();
  const [isLoading, setIsLoading] = useState(false);
  const readOnly = editForm ? false : true;
  const focused = editForm;

  function validaPreRequisitos() {
    const errors: string[] = [];
    if (!contrato.TMOV_T_CODCOLIGADA || !contrato.TMOV_T_CODFILIAL)
      errors.push("Destinatário inválido.");
    if (!contrato.TMOV_T_CODCCUSTO) errors.push("Centro de Custo inválido.");
    if (errors.length > 0) {
      setError(JSON.stringify(errors));
      setIsLoading(false);
      setOpenNaturezaOrcamentaria(true);
    } else {
      setIsLoading(true);
      getNaturezaOrcamentaria();
    }
  }
  function handleSearcNaturezaOrcamentariaClick() {
    validaPreRequisitos();
  }
  function handleClearNaturezaOrcamentariaClick() {
    setContrato({
      ...contrato,
      TMOV_T_TBORCAMENTO: "",
      TMOV_T_CODTBORCAMENTO: "",
    });
  }
  async function getNaturezaOrcamentaria(
    index?: number,
    linhaRateio?: Array<{
      CODCCUSTO?: string;
      DESCRICAO_NAT?: string;
      CODTBORCAMENTO?: string;
    }>
  ) {
    setNaturezasOrcamentaria([]);

    const codCustoParaBusca =
      index !== undefined ? linhaRateio?.[index]?.CODCCUSTO : contrato.TMOV_T_CODCCUSTO;
    const termoBuscaNomeNat =
      index !== undefined ? linhaRateio?.[index]?.DESCRICAO_NAT : contrato.TMOV_T_TBORCAMENTO;
    const termoBuscaCodNat =
      index !== undefined ? linhaRateio?.[index]?.CODTBORCAMENTO : contrato.TMOV_T_CODTBORCAMENTO;

    await axios({
      url: fluigConfig.naturezaOrcamentaria,
      method: fluigConfig.method,
      // data: sqlBody({
      //   codSentenca: "FL.DS.5.0037",
      //   parameters: `CODCOLIGADA=${
      //     contrato.TMOV_T_CODCOLIGADA ?? "-1"
      //   }|CODFILIAL=${contrato.TMOV_T_CODFILIAL ?? "-1"}|CODCCUSTO=${
      //     contrato.TMOV_T_CODCCUSTO ?? "@"
      //   }|LIMITEFLUIG=300|BUSCADOR=${contrato.TMOV_T_TBORCAMENTO ?? "@"}%${
      //     contrato.TMOV_T_CODTBORCAMENTO ?? "@"
      //   }`,
      // }),
      data: sqlBody({
      codSentenca: "FL.DS.5.0037",
      parameters: `CODCOLIGADA=${contrato.TMOV_T_CODCOLIGADA ?? "-1"}` +
                  `|CODFILIAL=${contrato.TMOV_T_CODFILIAL ?? "-1"}` +
                  `|CODCCUSTO=${codCustoParaBusca ?? "@"}` + // <-- AQUI ESTÁ A MUDANÇA
                  `|LIMITEFLUIG=300` +
                  `|BUSCADOR=${termoBuscaNomeNat?? "@"}%${termoBuscaCodNat ?? "@"}`
    }),
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);

        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        setNaturezasOrcamentaria(
          Array.isArray(dados) ? dados : new Array(dados)
        );
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        throw Error(e);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenNaturezaOrcamentaria(true);
      });
  }
  return {
    isLoading,
    getNaturezaOrcamentaria,
    handleClearNaturezaOrcamentariaClick,
    handleSearcNaturezaOrcamentariaClick,
    focused,
    readOnly,
  };
}

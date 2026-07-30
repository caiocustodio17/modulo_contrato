import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useFornecedorContext } from "./useFornecedorContext";

export type IBuscaFornecedor = {
  codCfo?: string;
  nomeFantasia?: string;
  cnpj?: string;
};

export default function useFornecedores() {
  const { setError } = useContratoContext();
  const { setFornecedores, setOpenFornecedor } = useFornecedorContext();
  const [isLoading, setIsLoading] = useState(false);

  async function buscarFornecedores(filtros: IBuscaFornecedor = {}) {
    setFornecedores([]);
    setIsLoading(true);

    await axios({
      url: fluigConfig.fornecedores,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca: "DW.CNT.0004",
        parameters: `BUSCADOR=${filtros.codCfo ?? ""}${filtros.nomeFantasia ?? ""}${filtros.cnpj ?? ""}`,
      }),
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);

        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        setFornecedores(Array.isArray(dados) ? dados : new Array(dados));
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        throw Error(e);
      })
      .finally(() => {
        setOpenFornecedor(true);
        setIsLoading(false);
      });
  }

  return { isLoading, buscarFornecedores };
}

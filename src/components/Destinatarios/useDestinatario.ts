import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useDestinatarioContext } from "./useDestinatarioContext";

export type IBuscaDestinatario = {
  codColigada?: string;
  codFilial?: string;
  nomeFantasia?: string;
  cnpj?: string;
};

export default function useDestinatario() {
  const { setError } = useContratoContext();
  const { setDestinatarios, setOpenDestinatario } = useDestinatarioContext();
  const [isLoading, setIsLoading] = useState(false);

  async function buscarDestinatarios(filtros: IBuscaDestinatario = {}) {
    setDestinatarios([]);
    setIsLoading(true);
    await axios({
      url: fluigConfig.filiais,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca: "DW.CNT.0005",
        parameters: `CODCOLIGADA=${
          filtros.codColigada || "-1"
        }|CODFILIAL=${
          filtros.codFilial || "-1"
        }|NOMEFANTASIA=${
          filtros.nomeFantasia || "@"
        }|CNPJ=${
          filtros.cnpj || "@"
        }`,
      }),
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);

        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        setDestinatarios(Array.isArray(dados) ? dados : new Array(dados));
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        throw Error(e)
      })
      .finally(() => {
        setIsLoading(false);
        setOpenDestinatario(true);
      });
  }

  return {
    isLoading,
    buscarDestinatarios,
  };
}

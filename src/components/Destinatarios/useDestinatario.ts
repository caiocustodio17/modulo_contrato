import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useDestinatarioContext } from "./useDestinatarioContext";

export default function useDestinatario() {
  const { contrato, editForm, setContrato, setError } = useContratoContext();
  const { setDestinatarios, setOpenDestinatario } = useDestinatarioContext();
  const [isLoading, setIsLoading] = useState(false);
  const readOnly = editForm ? false : true;
  const focused = editForm;

  function handleClearClick() {
    setContrato({
      ...contrato,
      TMOV_T_CODFILIAL: "",
      DESCRICAO_CODFILIAL: "",
      TMOV_T_CGCFIL: "",
      TMOV_T_CODCOLIGADA: "",
    });
  }
  function handleSearchDestinatarioClick() {
    getFilais();
  }
  async function getFilais() {
    setDestinatarios([]);
    setIsLoading(true);
    await axios({
      url: fluigConfig.filiais,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca: "DW.CNT.0005",
        parameters: `CODCOLIGADA=${
          contrato.TMOV_T_CODCOLIGADA ?? "-1"
        }|CODFILIAL=${
          contrato.TMOV_T_CODFILIAL ?? "-1"
        }|NOMEFANTASIA=${
          contrato.DESCRICAO_CODFILIAL?? "@"
        }|CNPJ=${
          contrato.TMOV_T_CGCFIL?? "@"
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
    readOnly,
    focused,
    handleClearClick,
    handleSearchDestinatarioClick,
  };
}

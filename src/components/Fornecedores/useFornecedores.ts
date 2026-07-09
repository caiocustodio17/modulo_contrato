import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useFornecedorContext } from "./useFornecedorContext";


export default function useFornedor(){
  const { contrato, setContrato, editForm, setError } =
    useContratoContext();
  const {setFornecedores, setOpenFornecedor} = useFornecedorContext()
  const [isLoading, setIsLoading] = useState(false);
  const readOnly = editForm ? false : true;
  const focused = editForm;

  function handleSearchFornecedorClick() {
    getFornecedores();
  }
  function handleClearClick() {
    setContrato({
      ...contrato,
      TMOV_T_CODCFO: "",
      DESCRICAO_CODCFO: "",
      TMOV_T_CGCCFO: "",
    });
  }
  async function getFornecedores() {
    setFornecedores([])
    setIsLoading(true);

    await axios({
      url: fluigConfig.fornecedores,
      method: fluigConfig.method,
      data:
        sqlBody({
          codSentenca: "DW.CNT.0004",
          parameters: `BUSCADOR=${contrato.TMOV_T_CODCFO ?? ""}${contrato.DESCRICAO_CODCFO ?? ""}${contrato.TMOV_T_CGCCFO ?? ""}`}),
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO
        if(error) throw Error(error)

        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        setFornecedores((Array.isArray(dados)) ? dados : new Array(dados))
        setError("")
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e))
        throw Error(e);
      })
      .finally(() => {
        setOpenFornecedor(true);
        setIsLoading(false);
      });
  }
  return {isLoading,readOnly, focused, handleClearClick, handleSearchFornecedorClick }
}

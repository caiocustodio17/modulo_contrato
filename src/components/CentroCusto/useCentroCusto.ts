import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from '../../config';
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useCentroCustoContext } from "./useCentroCustoContext";

export default function useCentroCusto(){
  const { contrato, editForm, setContrato, setError } = useContratoContext();
  const {setCentroCustos, centroCustos, setOpenCentroCusto} = useCentroCustoContext()
  const [isLoading, setIsLoading] = useState(false)
  const readOnly = editForm ? false : true;
  const focused = editForm;

  function validaPreRequisitos(){
    if(!contrato.TMOV_T_CODCOLIGADA || !contrato.TMOV_T_CODFILIAL) {
      setError('Favor informar um destinatário.')
      setCentroCustos([]);
      setIsLoading(false)
      setOpenCentroCusto(true)
    } else {
      setIsLoading(true)
      getCentroCusto();
    }
  }
  function handleSearchCCustoClick(){
    validaPreRequisitos()
  }
  function handleClearCCustoClick(){
    setContrato({...contrato,TMOV_T_CODCCUSTO: "", DESCRICAO_CODCCUSTO:""})
  }
  async function getCentroCusto(){
    setCentroCustos([]);
    await axios({
      url:fluigConfig.centroCusto,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca:'FL.DS.5.0033',
        parameters:`CODCOLIGADA=${contrato.TMOV_T_CODCOLIGADA?? '@'
          };CODFILIAL=${contrato.TMOV_T_CODFILIAL?? '@'
          };LIMITEFLUIG=300|BUSCADOR=${contrato.TMOV_T_CODCCUSTO??`@`}%${contrato.DESCRICAO_CODCCUSTO??`@`}`})
    }).then((r)=>{
      const error = r.data.content.values[0].ERRO;
      if (error) throw Error(error);

      const dados = JSON.parse(r.data.content.values[0].MESSAGE);
      setCentroCustos(Array.isArray(dados) ? dados : new Array(dados));
      setError("");
    })
    .catch((e) => {
      setError(e instanceof AxiosError ? e.message : String(e));
      console.error("getCentroCusto - error: ", e);
    }).finally(()=>{
      setIsLoading(false)
      setOpenCentroCusto(true)
    })
  }
  return {isLoading, centroCustos,handleClearCCustoClick, handleSearchCCustoClick, focused, readOnly}
}

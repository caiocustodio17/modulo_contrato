import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from '../../config';
import { sqlBody } from "../../utils/sqlBody";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { useCentroCustoContext } from "./useCentroCustoContext";

export type IBuscaCentroCusto = {
  codColigada?: string;
  codFilial?: string;
  codCcusto?: string;
  nome?: string;
};

export default function useCentroCusto(){
  const { contrato, setError } = useContratoContext();
  const {setCentroCustos, setOpenCentroCusto} = useCentroCustoContext()
  const [isLoading, setIsLoading] = useState(false)

  function validaPreRequisitos(){
    if(!contrato.TMOV_T_CODCOLIGADA || !contrato.TMOV_T_CODFILIAL) {
      setError('Informe a coligada/filial do contrato antes de buscar o centro de custo.')
      setCentroCustos([]);
      setIsLoading(false)
      setOpenCentroCusto(true)
      return false
    }
    return true
  }
  async function buscarCentroCustos(filtros: IBuscaCentroCusto = {}){
    if (!validaPreRequisitos()) return
    setIsLoading(true)
    setCentroCustos([]);
    await axios({
      url:fluigConfig.centroCusto,
      method: fluigConfig.method,
      data: sqlBody({
        codSentenca:'FL.DS.5.0033',
        parameters:`CODCOLIGADA=${filtros.codColigada ?? contrato.TMOV_T_CODCOLIGADA ?? '@'
          };CODFILIAL=${filtros.codFilial ?? contrato.TMOV_T_CODFILIAL ?? '@'
          };LIMITEFLUIG=300|BUSCADOR=${filtros.codCcusto ?? `@`}%${filtros.nome ?? `@`}`})
    }).then((r)=>{
      const error = r.data.content.values[0].ERRO;
      if (error) throw Error(error);

      const dados = JSON.parse(r.data.content.values[0].MESSAGE);
      setCentroCustos(Array.isArray(dados) ? dados : new Array(dados));
      setError("");
    })
    .catch((e) => {
      setError(e instanceof AxiosError ? e.message : String(e));
      console.error("buscarCentroCustos - error: ", e);
    }).finally(()=>{
      setIsLoading(false)
      setOpenCentroCusto(true)
    })
  }
  return {isLoading, buscarCentroCustos}
}
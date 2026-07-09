/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from '../../config';
import { IMedicaoContrato } from "./@Types/MedicaoContrato";
import { sqlBody } from "../../utils/sqlBody";
export function useRelAnexos() {
    const [data, setData] = useState<IMedicaoContrato[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [openRelAnexos, setOpenRelAnexos] = useState(false);
    const [columns, setColumns] = useState<any | null>(null)
    type handleOrcamentoProps = {
        codColigada: string;
        codFilial: string;
        codOrcamento: string;
        idContrato: string;
        codCcusto: string;
    }
    async function handleAditivosContrato(idContrato: string) {
        console.log('handleAditivosContrato params: ', { idContrato })
        throw Error("Function not implemented.");
    }
    async function handleAnexosContrato(idContrato: string) {
        console.log('handleAnexosContrato params: ', { idContrato })
        throw Error("Function not implemented.");
    }
    async function handleOrcamentoContrato({ codColigada, codFilial, codOrcamento, idContrato, codCcusto }: handleOrcamentoProps) {
        setIsLoading(true);
        await axios
          .post(
            fluigConfig.datasetUrl,
            sqlBody({
              codSentenca: "DW.CNT.0007",
              parameters: `CODCOLIGADA=${codColigada}|CODFILIAL=${codFilial}|CCUNAT=${codCcusto}-${codOrcamento}|SEPARADOR=_SEPCCUNAT_|IDCNT=${idContrato}`,
            })
          )
          .then((d) => {
            const error = d.data.content.values[0].ERRO;
            if (error) throw Error(error);
            const dados = JSON.parse(d.data.content.values[0].MESSAGE);
            const dadosList = Array.isArray(dados) ? dados : new Array(dados)
            setData(dadosList.map((item,idx)=>{return {...item, id:idx}}));
            setError("");
          })
          .catch((e) => {
            setError(e instanceof AxiosError ? e.message : String(e));
            console.error("getOrcamento - error: ", e);
          })
          .finally(() => {
            setIsLoading(false);
          });
        }
    async function handleMedicoesContrato(idContrato: string) {
        setIsLoading(true);
        setData(null);
        const data = {
            name: "ds_dw_sql",
            fields: [`SELECT
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
                    AND SPV2.TCNT_T_IDCONTRATO = '${idContrato}'
                `, `java:/jdbc/AppDS`],
        };
        await axios.post(fluigConfig.contratos, data)
            .then(r => {
                console.log('handleMedicoesContrato response: ', r)
                if (r.data.content.values.length === 0) setError(r.data.content.message ?? 'Nenhuma medição encontrada');
                setData(r.data.content.values)
            })
            .catch(e => {
                console.log('handelMedicoesContrato error: ', e)
                setError(e instanceof AxiosError ? e.message : String(e))
            })
            .finally(() => setIsLoading(false))
    }
    function handleAnexosMedicao(idContrato: string) {
        setIsLoading(true);
        setData(null);
        const data = {
            name: "ds_dw_sql",
            fields: [`
                    SELECT 
                    [id] = ATTACHMENTS.id,
                    [namefile] = ATTACHMENTS.name,
                    [idmedicao] = ATTACHMENTS.IDMEDICAO
                    FROM ML001090 SPV2 (NOLOCK)
                    
                    INNER JOIN PROCES_WORKFLOW PWF (NOLOCK) ON
                    SPV2.DOCUMENTID = PWF.NR_DOCUMENTO_CARD
                    
                    CROSS APPLY(
                        SELECT 
                            [id] = FDOC.NR_DOCUMENTO,
                            [IDMEDICAO] = FILTER_PROCES.PAI_NM_DOCUMENTO,
                            [name] = FDOC.DS_PRINCIPAL_DOCUMENTO
                        FROM DOCUMENTO FDOC (NOLOCK)
                        CROSS APPLY 
                        (SELECT
                            [PAI_NM_DOCUMENTO] = DOC.DS_PRINCIPAL_DOCUMENTO,
                            [PAI_NR_DOCUMENTO] = DOC.NR_DOCUMENTO
                        FROM DOCUMENTO DOC (NOLOCK)
                        WHERE 
                            DOC.NR_DOCUMENTO = FDOC.NR_DOCUMENTO_PAI
                            AND DOC.DS_PRINCIPAL_DOCUMENTO = CONVERT(VARCHAR(MAX),PWF.NUM_PROCES)
                            AND LOG_DELETE='false'
                        )FILTER_PROCES
                    )ATTACHMENTS
                    WHERE 
                            SPV2.TCNT_T_IDCONTRATO = '${idContrato}'
                `, `java:/jdbc/AppDS`],
        };
        axios.post(fluigConfig.contratos, data)
            .then(r => {
                console.log('handleAnexosMedicao response: ', r)
                if (r.data.content.values.length === 0) setError(r.data.content.message ?? 'Nenhuma anexo encontrada');
                setData(r.data.content.values)
            })
            .catch(e => {
                console.log('handleAnexosMedicao error: ', e)
                setError(e instanceof AxiosError ? e.message : String(e))
            })
            .finally(() => setIsLoading(false))
    }
    return {
        handleAnexosMedicao,
        handleMedicoesContrato,
        handleAnexosContrato,
        handleAditivosContrato,
        handleOrcamentoContrato,
        data,
        title,
        setTitle,
        openRelAnexos,
        setOpenRelAnexos,
        isLoading,
        error,
        columns,
        setColumns
    }
}
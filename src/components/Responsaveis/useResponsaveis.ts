/* eslint-disable @typescript-eslint/no-explicit-any */
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import axios from "../../utils/baseService";
import { sqlBody } from "../../utils/sqlBody";
import { IContratoRespData } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";

export default function useResponsaveis() {
  const { editForm, setError, setOpenError } = useContratoContext();
  const [responsavel, setResponsavel] = useState<IContratoRespData>(
    {} as IContratoRespData
  );
  const [openPapelSelect, setOpenPapelSelect] = useState(false);
  const [openFuncaoSelect, setOpenFuncaoSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [papelList, setPapelList] = useState([]);
  const [funcaoList, setFuncaoList] = useState([]);
  const readOnly = editForm ? false : true;
  const focused = editForm;
  const papelColumns: GridColDef[] = [
    { field: "id", headerName: "Id." },
    { field: "DESCRIPTION", headerName: "Nome", flex: 1 },
  ];
  const funcaoColumns: GridColDef[] = [
    { field: "TFCNTRESP_T_CODIGO", headerName: "Cód." },
    { field: "TFCNTRESP_T_DESCRICAO", headerName: "Descrição" },
  ];
  function handleSelectFuncaoModalClick(params: GridRowParams) {
    setResponsavel({
      ...responsavel,
      TRESP_T_CODFUNCAO: params.row.TFCNTRESP_T_CODIGO,
      TRESP_T_FUNCAO: params.row.TFCNTRESP_T_DESCRICAO,
    });
    setOpenFuncaoSelect(false);
  }
  function handleSearchPapelClick() {
    setIsLoading(true);
    getPapel();
  }
  function handleSelectPapelModalClick(params: GridRowParams) {
    setResponsavel({
      ...responsavel,
      TRESP_T_SEQF: params.row.ROLE_ID,
      TRESP_T_CODPAPEL: params.row.ROLE_CODE,
      TRESP_T_PAPEL: params.row.DESCRIPTION,
    });
    setOpenPapelSelect(false);
  }
  function handleSearchFuncaoClick() {
    setIsLoading(true);
    getFuncao();
  }

  async function getFuncao() {
    await axios({
      url: fluigConfig.funcoes,
      method: fluigConfig.method,
      data: sqlBody({ codSentenca: "DW.CNT.0001", parameters: "" }),
    })
      .then((d) => {
        const error = d.data.content.values[0].ERRO;
        if (error) throw Error(error);
        const dados = JSON.parse(d.data.content.values[0].MESSAGE);
        setFuncaoList(dados);
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        console.log("Error: ", e);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenFuncaoSelect(true);
      });
  }
  async function getPapel() {
    await axios({
      url: fluigConfig.papeis,
      method: fluigConfig.method,
      data: {
        name: "ds_dw_sql",
        fields: ["SELECT DISTINCT * FROM FDN_ROLE", `java:/jdbc/AppDS`],
      },
    })
      .then((d) => {
        setPapelList(
          d.data.content.values.map((item: any) => {
            return { ...item, id: item.ROLE_ID };
          })
        );
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        setOpenError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenPapelSelect(true);
      });
  }
  return {
    responsavel,
    setResponsavel,
    focused,
    readOnly,
    isLoading,
    handleSearchFuncaoClick,
    handleSearchPapelClick,
    funcaoColumns,
    funcaoList,
    setOpenFuncaoSelect,
    openFuncaoSelect,
    handleSelectFuncaoModalClick,
    papelColumns,
    setOpenPapelSelect,
    openPapelSelect,
    papelList,
    handleSelectPapelModalClick,
  };
}

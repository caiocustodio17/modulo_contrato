import { GridColDef } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import DataGridComponent from "../Global/DataGridComponent";
import ErrorComponent from "../Global/ErrorComponent";
import useNotas from "./useNotas";
import useNotasContext from "./useNotasContext";
import { AccountTreeOutlined } from "@mui/icons-material";
import fluigConfig from "../../config";

export default function NotasComponent(){
  const {isLoading, handleGetNotas, handleClickRow} = useNotas()
  const {notas} = useNotasContext()
  const {error} = useContratoContext()
  useEffect(()=>{
    handleGetNotas()
  },[])
  const columnsNotas :GridColDef[] = [
    {field: 'id', headerName: 'Id.', width:100},
    {field: 'id_medicao', headerName: 'Id. Medição',
    renderCell: (params) => {
      return (
        (params.value) &&
        <a href={`${fluigConfig.visualizarProcesso}${params.value}`} target="_blank">
          <div className="text-blue-500 text-sm flex flex-row gap-1"><span><AccountTreeOutlined/></span><span>{params.value}</span></div>
        </a>
      );
    },
    width:100},
    {field: 'model_type', headerName: 'Tipo', width:100},
    {field: 'number', headerName: 'Num. Nota', width:100},
    {field: 'issue_date', headerName: 'Emissão', width:100},
    {field: 'total_value', headerName: 'Valor', width:100},
    {field: 'access_key', headerName: 'Chave Acesso', width:400},
  ]

  return (
    <>
    <DataGridComponent
    columns={columnsNotas}
    rows={notas}
    loading={isLoading}
    onRowClick={handleClickRow}
    />
    <ErrorComponent message={error}/>
    </>
  )
}



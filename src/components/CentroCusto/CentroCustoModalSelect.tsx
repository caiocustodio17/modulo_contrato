import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { ICentroCusto } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import { useCentroCustoContext } from "./useCentroCustoContext";

export function CentroCustoModalSelect(){
  const {openCentroCusto, setOpenCentroCusto, centroCustos, setCentroCustos, onSelectCentroCusto} = useCentroCustoContext()
  const {error} = useContratoContext();
  const [data,setData] = useState<ICentroCusto[]>([])
  const columnsCentroCusto :GridColDef[] = [
    {field:'CODCOLIGADA', headerName:'Cód. Coligada', width: 100},
    {field:'CODCCUSTO', headerName:'Cód. C. Custo', width: 100},
    {field:'NOME', headerName:'Nome', width: 300}
  ]
  function handleRowSelectedClick(params: GridRowParams){
    const {row} = params
    onSelectCentroCusto?.(row)
    setOpenCentroCusto(false)
    setCentroCustos([])
  }
  useEffect(()=>{
    setData(centroCustos.map((item,idx)=>{return{...item, id:idx}}))
  },[centroCustos, openCentroCusto])
  return (
    <ModalSelectorComponent
    columns={columnsCentroCusto}
    rows={data}
    title="Selecione o Centro de Custo"
    open={openCentroCusto}
    messageError={error}
    onRowClick={handleRowSelectedClick}
    onClose={()=>setOpenCentroCusto(false)}
    />
  )
}
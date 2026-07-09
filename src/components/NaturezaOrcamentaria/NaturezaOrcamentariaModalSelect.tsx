import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { INaturezaOrcamentaria } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import { useNaturezaOrcamentariaContext } from "./useNaturezaOrcamentariaContext";

export function NaturezaOrcamentariaModalSelect({ onSelecionar }: { onSelecionar?: (nat: INaturezaOrcamentaria) => void }){
  const {openNaturezaOrcamentaria, setOpenNaturezaOrcamentaria, naturezasOrcamentaria, setNaturezasOrcamentaria} = useNaturezaOrcamentariaContext()
  const {contrato, setContrato, error} = useContratoContext();
  const [data,setData] = useState<INaturezaOrcamentaria[]>([])
  const columnsCentroCusto :GridColDef[] = [
    {field:'CODTBORCAMENTO', headerName:'Cód. Natureza Orçamentária', width: 100},
    {field:'DESCRICAO', headerName:'Nome', width: 300}
  ]
  function handleRowSelectedClick(params: GridRowParams){
    const {row} = params

    const codigo = row.CODTBORCAMENTO;
    const descricao = row.DESCRICAO || row.DESCRICAO_NAT;

    setContrato({
      ...contrato,
      TMOV_T_CODTBORCAMENTO: codigo,
      TMOV_T_TBORCAMENTO: descricao
    })
    if (onSelecionar) {
      onSelecionar(row); 
    } else {
      setContrato({
        ...contrato,
        TMOV_T_CODTBORCAMENTO: codigo,
        TMOV_T_TBORCAMENTO: descricao
      });
    }
    setOpenNaturezaOrcamentaria(false)
    setNaturezasOrcamentaria([])
  }
  useEffect(()=>{
    setData(naturezasOrcamentaria.map((item,idx)=>{return{...item, id:idx}}))
  },[naturezasOrcamentaria, openNaturezaOrcamentaria])
  return (
    <ModalSelectorComponent
    columns={columnsCentroCusto}
    rows={data}
    title="Selecione a Natureza Orçamentária"
    open={openNaturezaOrcamentaria}
    messageError={error}
    onRowClick={handleRowSelectedClick}
    onClose={()=>setOpenNaturezaOrcamentaria(false)}
    />
  )
}

import { GridColDef } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useContratoContext } from "../../Contratos/hooks/useContratoContext"
import ModalSelectorComponent from "../../Global/ModalSelectorComponent"
import { ITItmmovData } from "../@types/SolicitacaoPagamentoType"
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext"
import useItensPagamento from "./useItensPagamento"

export default function ItensModalSelect(){
  const {openSelectItem, setOpenSelectItem, listItemsSelect} = useSolicitacaoPagamentoContext()
  const {handleRowSelectedClick} = useItensPagamento()
  const {error} = useContratoContext()
  const [data, setData] = useState<ITItmmovData[]>([])
  const colunasItemSelect :GridColDef[] = [
    {field:'CODIGOPRD', headerName:'Cód. Item',flex:1},
    {field:'NOMEFANTASIA', headerName:'Item', flex:1},
    {field:'CODUND', headerName:'Cód. Und',flex:1},
  ]
  useEffect(()=>{
    setData(listItemsSelect.map((item,idx)=>{return{...item, id:idx}}))
  },[listItemsSelect])

  return <ModalSelectorComponent
  title="Selecione o Item"
  open={openSelectItem}
  onClose={()=>setOpenSelectItem(false)}
  messageError={error}
  columns={colunasItemSelect}
  rows={data}
  onRowDoubleClick={handleRowSelectedClick}
  />
}

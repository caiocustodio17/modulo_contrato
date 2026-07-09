import { GridColDef, GridRowParams } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useContratoContext } from "../../Contratos/hooks/useContratoContext"
import ModalSelectorComponent from "../../Global/ModalSelectorComponent"
import { IInvoiceItem } from "../../Notas/@types/INotasTypes"
import useSolicitacaoPagamentoContext from "../useSolicitacaoPagamentoContext"

export default function InvoiceItemsModalSelect(){
const {setInvoiceItemSelected, openInvoiceItemSelect, setOpenInvoiceItemSelect, itemSelecionado, setListItems, listItems, itemVinculoSelecionado, setItemVinculoSelecionado} = useSolicitacaoPagamentoContext()
const {notaSelecioanda, contrato} = useContratoContext()
const [data,setData] = useState<IInvoiceItem[]>([])

useEffect(()=>{

  const invocieItem = (!notaSelecioanda.invoice_items)?[] : notaSelecioanda.invoice_items
  setData(invocieItem)
  if(!(Object.keys(itemVinculoSelecionado).length == 0)){
    setListItems([...listItems, itemVinculoSelecionado])
  }
},[notaSelecioanda,itemVinculoSelecionado])

const columnInoiveItemSelect :GridColDef[] = [
  {field:'id', headerName:'Id',width:100},
  {field:'description', headerName:'Descrição',width:300},
  {field:'quantity', headerName:'Qtde.',width:100},
  {field:'unit_price', headerName:'R$ Unit.',width:100},
  {field:'total_value', headerName:'R$ Total',width:100},
]
/*
function validar(){
  if(!itemSelecionado || (itemSelecionado.CODIGOPRD.length ==0 || itemSelecionado.NOMEFANTASIA.length ==0)){ alert('Um item do RM deve ser selecionado primeiro.');return false}
  return true
}
*/
function handleRowSelectInvoiceItem(params:GridRowParams<IInvoiceItem>){
  const {row} = params;
  setInvoiceItemSelected(row)
  setOpenInvoiceItemSelect(false);
  setItemVinculoSelecionado({
    TITMMOV_T_CODIGOPRD: itemSelecionado.CODIGOPRD,
    TITMMOV_T_NOMEFANTASIA: itemSelecionado.NOMEFANTASIA,
    TITMMOV_T_CODUND: itemSelecionado.CODUND,
    TITMMOV_T_IDPRD: itemSelecionado.IDPRD.toString(),
    TITMMOV_T_CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO,
    TITMMOV_T_DESCTBORCAMENTO: contrato.TMOV_T_TBORCAMENTO,
    TITMMOV_T_QUANTIDADE: row.quantity?.toFixed(2) ?? '0',
    TITMMOV_T_PRECOUNITARIO: row.unit_price?.toFixed(2) ?? '0',
    TITMMOV_T_VALORTOTALITEM: row.total_value?.toFixed(2) ?? '0',
    TITMMOV_T_SEQF: row.nitem?.toString() ?? '-1'
  })
}
  return (<ModalSelectorComponent
    title="Selecione o item da nota"
    open={openInvoiceItemSelect}
    onClose={()=>setOpenInvoiceItemSelect(false)}
    onRowDoubleClick={handleRowSelectInvoiceItem}
    getRowId={(e)=>e.nitem}
    columns={columnInoiveItemSelect}
    rows={data}
    />)
}

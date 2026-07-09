import DataGridComponent from "../Global/DataGridComponent";
import ErrorComponent from "../Global/ErrorComponent";
import ModalErrorComponent from "../Global/ModalErrorComponent";
import { SolicitacaoPagamentoProvider } from "../SolicitacaoPgto/SolicitacaoPagamentoContext";
import SolicitacaoPagamentoModal from "../SolicitacaoPgto/SolicitacaoPagamentoModal";
import ContratoModalEdit from "./ContratoModalEdit";
import contratosColumns from "./ContratosColumn";
import ContratosToolbar from "./ContratosToolbar";
import { useContratoContext } from "./hooks/useContratoContext";
import useContratos from "./hooks/useContratos";
export default function ContratosGridComponent() {
  const {openEdit, openMedicao, oepnError, error,setOpenError} = useContratoContext()
  const { data, loading, handleDoubleRowClick, handleRowClick, err } =
    useContratos();
    
  return (
    <>
      <DataGridComponent
        rows={data}
        columns={contratosColumns}
        loading={loading}
        customTollbar={<ContratosToolbar />}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleDoubleRowClick}
      />
      <ErrorComponent message={err} />
      {(openEdit) && <ContratoModalEdit />}
      {(openMedicao) &&(
        <SolicitacaoPagamentoProvider>
          <SolicitacaoPagamentoModal />
        </SolicitacaoPagamentoProvider>
      )}
      {(oepnError) && <ModalErrorComponent title="Erro" open={oepnError} message={error} onClose={()=>setOpenError(false)}/>}
    </>
  );
}

import ErrorComponent from "../Global/ErrorComponent";
import { ModalComponent } from "../Global/ModalComponent";
import { SolicitacaoPagamentoProvider } from "../SolicitacaoPgto/SolicitacaoPagamentoContext";
import ContratoModalEditButtons from "./ContratoModalEditButtons";
import ContratoFormEdit from "./EditForm/ContratoFormEdit";
import { useContratoContext } from "./hooks/useContratoContext";

export default function ContratoModalEdit(){
  const {contrato, setOpenEdit, openEdit, clearContext} = useContratoContext()
  function handleCloseModal(){
    clearContext()
    setOpenEdit(false);
    const baseURL = window.location.origin + window.location.pathname;
    window.history.pushState({}, "", baseURL);
  }
  return (
    <SolicitacaoPagamentoProvider>
      <ModalComponent
        title={`${contrato.DESCRICAO_CODCFO} - ${contrato.TF_T_CODCONTRATO}`}
        open={openEdit}
        onClose={handleCloseModal}
        actions={<ContratoModalEditButtons/>}
      >
        {(!contrato) ? <ErrorComponent message="Favor selecionar um contrato."/>: <ContratoFormEdit/>}
      </ModalComponent>
    </SolicitacaoPagamentoProvider>
  )
}

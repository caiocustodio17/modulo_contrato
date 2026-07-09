import ContratoFormEdit from "../Contratos/EditForm/ContratoFormEdit";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ErrorComponent from "../Global/ErrorComponent";
import { ModalComponent } from "../Global/ModalComponent";
import { TabPanelComponent, TabsCustomProps } from "../Global/TabPanelComponent";
import NotasComponent from "../Notas/NotasComponent";
import { NotasProvider } from "../Notas/NotasContext";
import SolicitacaoPagamentoForm from "./SolicitacaoPagamentoForm";

export default function SolicitacaoPagamentoModal() {
  const { openMedicao, setOpenMedicao, contrato } = useContratoContext()
  const indexTab = contrato?.IDFLUIG ? 2 : 0

  function handleCloseSolicitacaoPagamentoModal() {
    setOpenMedicao(false);

    const baseURL = window.location.origin + window.location.pathname;
    window.history.pushState({}, "", baseURL);
  }

  const tabsContent: TabsCustomProps[] = [
    { label: 'Contrato Selecionado', content: <ContratoFormEdit/>},
    { label: 'Notas Fiscais', content: <NotasProvider><NotasComponent/></NotasProvider> },
    { label: 'Solicitação de Pagamento', content: <SolicitacaoPagamentoForm /> }
  ]
  return (
    <ModalComponent title="Medição de Contrato" onClose={handleCloseSolicitacaoPagamentoModal} open={openMedicao}>
      {!contrato.TMOV_T_CODCOLIGADA
        ? <ErrorComponent message="Favor selecionar um contrato." />
        : <TabPanelComponent tabs={tabsContent} defaultTabIndex={indexTab} />}
    </ModalComponent>
  )
}
 
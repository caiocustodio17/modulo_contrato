import useSolicitacaoPagamentoContext from "./useSolicitacaoPagamentoContext"

export default function useAbrirSolicitacaoFluig(){
  const {solicitacaoPagamento} = useSolicitacaoPagamentoContext()
  function montarFormulario(){
    console.log('montarFormularFluig: ', solicitacaoPagamento)
  }
  return {montarFormulario}
}

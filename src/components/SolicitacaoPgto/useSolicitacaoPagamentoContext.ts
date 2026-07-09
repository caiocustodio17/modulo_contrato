import { useContext } from "react";
import { SolicitacaoPagamentoContext } from "./SolicitacaoPagamentoContext";

export default function useSolicitacaoPagamentoContext(){
  const context = useContext(SolicitacaoPagamentoContext);
  if(!context) throw Error("useSolicitacaoPagamentoContext deve envolver os componentes no solicitacaoPagamentoProvider")
  return context
}

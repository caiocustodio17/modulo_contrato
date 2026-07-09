import { useContext } from "react";
import { ContratoContext } from "../ContratosContext";

export const useContratoContext = ()=>{
  const context = useContext(ContratoContext)
  if(!context) throw new Error('useContratoContext deve ser declarado dentro de ContratoProvider');
  return context
}

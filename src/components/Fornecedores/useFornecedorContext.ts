import { useContext } from "react";
import { FornecedorContext } from "./FornecedoresContext";

export function useFornecedorContext(){
  const context = useContext(FornecedorContext)
  if(!context) throw new Error('useFornecedorContext deve envolver os componentes dentro de ContratoProvider');
  return context
}

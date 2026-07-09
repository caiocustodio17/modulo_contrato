import { useContext } from "react";
import { DestinatarioContext } from "./DestinatarioContext";

export function useDestinatarioContext(){
  const context = useContext(DestinatarioContext)
  if(!context) throw new Error('useDestinatarioContext deve envolver os componentes dentro de ContratoProvider');
  return context
}

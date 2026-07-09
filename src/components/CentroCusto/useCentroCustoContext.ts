import { useContext } from "react";
import { CentroCustocontext } from "./CentroCustoContext";

export function useCentroCustoContext() {
  const context = useContext(CentroCustocontext);
  if (!context) throw new Error('useCentroCustoContext deve envolver os componentes dentro de ContratoProvider');
  return context
}

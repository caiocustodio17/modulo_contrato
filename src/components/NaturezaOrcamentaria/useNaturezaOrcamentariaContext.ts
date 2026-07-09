import { useContext } from "react";
import { NaturezaOrcamentariaContext } from "./NaturezaOrcamentariaContext";

export function useNaturezaOrcamentariaContext() {
  const context = useContext(NaturezaOrcamentariaContext)
  if (!context) throw new Error('useNaturezaOrcamentariaContext deve envolver os componentes dentro de ContratoProvider');
  return context
}

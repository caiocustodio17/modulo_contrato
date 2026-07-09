import { ReactNode, createContext, useState } from "react"
import { INaturezaOrcamentaria } from "../Contratos/ContratosTypes"

type NaturezaOrcamentariaProps = {
  openNaturezaOrcamentaria: boolean
  setOpenNaturezaOrcamentaria: (open: boolean) => void
  naturezasOrcamentaria: INaturezaOrcamentaria[]
  setNaturezasOrcamentaria: (centroCusto: INaturezaOrcamentaria[]) => void
}

const initialCentroCusto: (INaturezaOrcamentaria & { ID: number })[] = [
  {
    TMOV_T_TBORCAMENTO: "",
    ID: -1,
    TMOV_T_CODTBORCAMENTO: ""
  }
]

export const NaturezaOrcamentariaContext = createContext<NaturezaOrcamentariaProps | undefined>(undefined)

type NaturezaOrcamentariaProviderProps = {
  children: ReactNode
}

export function NaturezaOrcamentariaProvider({ children }: NaturezaOrcamentariaProviderProps) {
  const [openNaturezaOrcamentaria, setOpenNaturezaOrcamentaria] = useState(false);
  const [naturezasOrcamentaria, setNaturezasOrcamentaria] = useState<INaturezaOrcamentaria[]>(initialCentroCusto)
  return (
    <NaturezaOrcamentariaContext.Provider value={{
      openNaturezaOrcamentaria, setOpenNaturezaOrcamentaria,
      naturezasOrcamentaria: naturezasOrcamentaria, setNaturezasOrcamentaria: setNaturezasOrcamentaria
    }}>
      {children}
    </NaturezaOrcamentariaContext.Provider>
  )
}

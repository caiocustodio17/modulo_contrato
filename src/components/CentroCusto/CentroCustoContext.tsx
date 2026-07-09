import { ReactNode, createContext, useState } from "react"
import { ICentroCusto } from "../Contratos/ContratosTypes"

type CentroCustoContextProps = {
  openCentroCusto: boolean
  setOpenCentroCusto: (open: boolean) => void
  centroCustos: ICentroCusto[]
  setCentroCustos: (centroCusto: ICentroCusto[]) => void
}

const initialCentroCusto: (ICentroCusto & { ID: number })[] = [
  {
    DESCRICAO_CODCCUSTO: "",
    ID: -1,
    TMOV_T_CODCCUSTO: ""
  }
]

export const CentroCustocontext = createContext<CentroCustoContextProps | undefined>(undefined)

type CentroCustoProviderProps = {
  children: ReactNode
}

export function CentroCustoProvider({ children }: CentroCustoProviderProps) {
  const [openCentroCusto, setOpenCentroCusto] = useState(false);
  const [centroCustos, setCentroCustos] = useState<ICentroCusto[]>(initialCentroCusto)
  return (
    <CentroCustocontext.Provider value={{
      openCentroCusto, setOpenCentroCusto,
      centroCustos, setCentroCustos
    }}>
      {children}
    </CentroCustocontext.Provider>
  )
}

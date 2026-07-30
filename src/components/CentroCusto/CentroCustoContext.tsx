import { ReactNode, createContext, useState } from "react"
import { ICentroCusto } from "../Contratos/ContratosTypes"

export type ICentroCustoSelecionado = ICentroCusto & {
  CODCOLIGADA?: string;
  CODCCUSTO?: string;
  NOME?: string;
}

type CentroCustoContextProps = {
  openCentroCusto: boolean
  setOpenCentroCusto: (open: boolean) => void
  centroCustos: ICentroCusto[]
  setCentroCustos: (centroCusto: ICentroCusto[]) => void
  onSelectCentroCusto: ((row: ICentroCustoSelecionado) => void) | null
  setOnSelectCentroCusto: (
    callback: ((row: ICentroCustoSelecionado) => void) | null,
  ) => void
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
  const [onSelectCentroCusto, setOnSelectCentroCustoState] = useState<
    ((row: ICentroCustoSelecionado) => void) | null
  >(null);

  function setOnSelectCentroCusto(
    callback: ((row: ICentroCustoSelecionado) => void) | null,
  ) {
    setOnSelectCentroCustoState(() => callback);
  }

  return (
    <CentroCustocontext.Provider value={{
      openCentroCusto, setOpenCentroCusto,
      centroCustos, setCentroCustos,
      onSelectCentroCusto, setOnSelectCentroCusto,
    }}>
      {children}
    </CentroCustocontext.Provider>
  )
}
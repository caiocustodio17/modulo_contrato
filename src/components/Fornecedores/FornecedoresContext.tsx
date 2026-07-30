import { ReactNode, createContext, useState } from "react";
import { IFornecedor } from "../Contratos/ContratosTypes";

export type IFornecedorSelecionado = IFornecedor & {
  CODCFO?: string;
  NOMEFANTASIA?: string;
  CGCCFO?: string;
  CODCOLIGADA?: string;
};

type FornecedorContextProps = {
  openFornecedor: boolean;
  setOpenFornecedor: (open: boolean) => void;
  fornecedores: IFornecedor[];
  setFornecedores: (fornecedor: IFornecedor[]) => void;
  onSelectFornecedor: ((row: IFornecedorSelecionado) => void) | null;
  setOnSelectFornecedor: (
    callback: ((row: IFornecedorSelecionado) => void) | null,
  ) => void;
};

const initialFornecedores: (IFornecedor & { ID: number })[] = [
  {
    ID: -1,
    DESCRICAO_CODCFO: "",
    TMOV_T_CGCCFO: "",
    TMOV_T_CODCFO: "",
    TMOV_T_CODCOLCFO: "",
  },
];

export const FornecedorContext = createContext<
  FornecedorContextProps | undefined
>(undefined);

type FornecedorProviderProps = {
  children: ReactNode;
};

export const FornecedorProvider: React.FC<FornecedorProviderProps> = ({
  children,
}) => {
  const [fornecedores, setFornecedores] =
    useState<IFornecedor[]>(initialFornecedores);
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [onSelectFornecedor, setOnSelectFornecedorState] = useState<
    ((row: IFornecedorSelecionado) => void) | null
  >(null);

  function setOnSelectFornecedor(
    callback: ((row: IFornecedorSelecionado) => void) | null,
  ) {
    setOnSelectFornecedorState(() => callback);
  }

  return (
    <FornecedorContext.Provider
      value={{
        fornecedores,
        setFornecedores,
        openFornecedor,
        setOpenFornecedor,
        onSelectFornecedor,
        setOnSelectFornecedor,
      }}
    >
      {children}
    </FornecedorContext.Provider>
  );
};

import { ReactNode, createContext, useState } from "react";
import { IFornecedor } from "../Contratos/ContratosTypes";

type FornecedorContextProps = {
  openFornecedor: boolean;
  setOpenFornecedor: (open: boolean) => void;
  fornecedores: IFornecedor[];
  setFornecedores: (fornecedor: IFornecedor[]) => void;
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
  return (
    <FornecedorContext.Provider
      value={{
        fornecedores,
        setFornecedores,
        openFornecedor,
        setOpenFornecedor,
      }}
    >
      {children}
    </FornecedorContext.Provider>
  );
};

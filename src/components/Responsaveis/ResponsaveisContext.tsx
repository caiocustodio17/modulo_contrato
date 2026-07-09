import { ReactNode, createContext, useState } from "react";
import { IContratoRespData } from "../Contratos/ContratosTypes";

type ResponsaveisContextProps = {
  openResponsaveis: boolean;
  setOpenResponsaveis: (open: boolean) => void;
  responsaveis: IContratoRespData[];
  setResponsaveis: (responsaveis: IContratoRespData[]) => void;
};
export const ResponsaveisContext = createContext<
  ResponsaveisContextProps | undefined
>(undefined);

export const ResponsaveisProvider = ({ children }: { children: ReactNode }) => {
  const [openResponsaveis, setOpenResponsaveis] = useState(false);
  const [responsaveis, setResponsaveis] = useState<IContratoRespData[]>([]);
  return (
    <ResponsaveisContext.Provider
      value={{
        openResponsaveis,
        setOpenResponsaveis,
        responsaveis,
        setResponsaveis,
      }}
    >
      {children}
    </ResponsaveisContext.Provider>
  );
};

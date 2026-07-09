import { ReactNode, createContext, useState } from "react";
import { IDestinatario } from "../Contratos/ContratosTypes";

type DestinatarioContextProps = {
  openDestinatario: boolean;
  setOpenDestinatario: (open: boolean) => void;
  destinatarios: IDestinatario[];
  setDestinatarios: (destinatario: IDestinatario[]) => void;
};

const initialDestinatario: (IDestinatario & { ID: number })[] = [
  {
    ID: -1,
    DESCRICAO_CODCOLIGADA: "",
    DESCRICAO_CODFILIAL: "",
    TMOV_T_CGCFIL: "",
    TMOV_T_CODCOLIGADA: "",
    TMOV_T_CODFILIAL: "",
  },
];

export const DestinatarioContext = createContext<DestinatarioContextProps | undefined>(undefined);

type DestinatarioProviderProps = {
  children: ReactNode;
};

export const DestinatarioProvider: React.FC<DestinatarioProviderProps> = ({children}) => {
  const [openDestinatario, setOpenDestinatario] = useState(false);
  const [destinatarios, setDestinatarios] = useState<IDestinatario[]>(initialDestinatario);
  return (
    <DestinatarioContext.Provider value={{
        openDestinatario, setOpenDestinatario,
        destinatarios, setDestinatarios,
      }}>
      {children}
    </DestinatarioContext.Provider>
  );
};

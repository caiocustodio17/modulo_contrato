import { ReactNode, createContext, useState } from "react";
import { IDestinatario } from "../Contratos/ContratosTypes";

export type IDestinatarioSelecionado = IDestinatario & {
  CODCOLIGADA?: string;
  CODFILIAL?: string;
  NOMEFANTASIA?: string;
  CGC?: string;
  TMOV_T_CGCCOL?: string;
};

type DestinatarioContextProps = {
  openDestinatario: boolean;
  setOpenDestinatario: (open: boolean) => void;
  destinatarios: IDestinatario[];
  setDestinatarios: (destinatario: IDestinatario[]) => void;
  onSelectDestinatario: ((row: IDestinatarioSelecionado) => void) | null;
  setOnSelectDestinatario: (
    callback: ((row: IDestinatarioSelecionado) => void) | null,
  ) => void;
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
  const [onSelectDestinatario, setOnSelectDestinatarioState] = useState<
    ((row: IDestinatarioSelecionado) => void) | null
  >(null);

  function setOnSelectDestinatario(
    callback: ((row: IDestinatarioSelecionado) => void) | null,
  ) {
    setOnSelectDestinatarioState(() => callback);
  }

  return (
    <DestinatarioContext.Provider value={{
        openDestinatario, setOpenDestinatario,
        destinatarios, setDestinatarios,
        onSelectDestinatario, setOnSelectDestinatario,
      }}>
      {children}
    </DestinatarioContext.Provider>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, createContext, useState } from "react";
import { ITaxDocument } from "../Notas/@types/INotasTypes";
import { IContratoData, IContratoRespData } from "./ContratosTypes";
import { IMedicaoContrato } from "../Relatorios/@Types/MedicaoContrato";

type ContratoContextProps = {
  listRateio: any[];  setListRateio: (listRateio: any[]) => void;
  contrato: IContratoData;  
  setContrato: (contrato: IContratoData) => void;
  responsaveis: IContratoRespData[];  setResponsaveis: (responsaveis: IContratoRespData[]) => void;
  openEdit: boolean;  setOpenEdit: (open: boolean) => void;
  openMedicao: boolean;  setOpenMedicao: (open: boolean) => void;
  editForm: boolean;  setEditForm: (editForm: boolean) => void;
  error : string;  setError: (error:string)=>void
  oepnError:boolean; setOpenError:(oepnError:boolean)=>void
  notaSelecioanda: ITaxDocument; setNotaSelecionada: (notaSelecionada:ITaxDocument)=>void;
  uploadedFile: string[]; setUploadedFile: (uploadedFile:string[])=>void;
  medicoes: IMedicaoContrato[]; setMedicoes: (medicoes: IMedicaoContrato[]) => void;
  pageLoading: boolean; setPageLoading: (pageLoading:boolean)=>void
  clearContext:()=>void
}

export const ContratoContext = createContext<ContratoContextProps | undefined>(
  undefined
);

type ContratoProviderProps = {
  children: ReactNode;
};
export const ContratoProvider: React.FC<ContratoProviderProps> = ({
  children,
}) => {
  const [listRateio, setListRateio] = useState<any[]>([] as any[]);
  const [contrato, setContrato] = useState<IContratoData>({} as IContratoData);
  const [responsaveis, setResponsaveis] = useState<IContratoRespData[]>([] as IContratoRespData[]);
  const [notaSelecioanda, setNotaSelecionada] = useState<ITaxDocument>({} as ITaxDocument)
  const [error, setError] = useState<string>("");
  const [openEdit, setOpenEdit] = useState(false);
  const [openMedicao, setOpenMedicao] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [oepnError, setOpenError] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string[]>([]);
  const [medicoes, setMedicoes] = useState<IMedicaoContrato[]>([] as IMedicaoContrato[]);
  const [pageLoading, setPageLoading] = useState(false);

  function clearContext(){
    setListRateio([] as any[])
    setContrato({} as IContratoData)
    setResponsaveis([] as IContratoRespData[])
    setNotaSelecionada({} as ITaxDocument)
    setMedicoes([] as IMedicaoContrato[])
    setUploadedFile([])
    setError("")
  }

  return (
    <ContratoContext.Provider
      value={{
        listRateio, setListRateio,
        contrato, setContrato,
        openEdit, setOpenEdit,
        openMedicao, setOpenMedicao,
        editForm, setEditForm,
        responsaveis, setResponsaveis,
        notaSelecioanda, setNotaSelecionada,
        clearContext,
        error, setError,
        oepnError, setOpenError,
        uploadedFile, setUploadedFile,
        medicoes, setMedicoes,
        pageLoading, setPageLoading
      }}
    >
      {children}
    </ContratoContext.Provider>
  );
};

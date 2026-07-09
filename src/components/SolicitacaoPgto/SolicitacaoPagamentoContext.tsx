/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, createContext, useState } from "react";
import { IInvoiceItem } from "../Notas/@types/INotasTypes";
import {
  ISolicitacaoPagamento,
  ITItmmov,
  ITItmmovData,
  ITmovpagto
} from "./@types/SolicitacaoPagamentoType";

type SolicitacaoPagamentoContextProps = {
  listRateios: any[]; setListRateios: (listRateios: any[]) => void;
  solicitacaoPagamento: ISolicitacaoPagamento; setSolicitacaoPagamento: (solicitacaoPagamento: ISolicitacaoPagamento) => void;
  listPagto: ITmovpagto[]; setListPagto: (listPagto: ITmovpagto[]) => void;
  listItems: ITItmmov[]; setListItems:(listItems: ITItmmov[])=>void
  listItemsSelect: ITItmmovData[]; setListItemsSelect:(listItemsSelect: ITItmmovData[])=>void
  openSelectItem: boolean;setOpenSelectItem:(openSelectItem: boolean)=>void
  itemSelecionado: ITItmmovData; setItemSelecionado:(itemSelecionado: ITItmmovData)=>void
  invoiceItemSelected: IInvoiceItem; setInvoiceItemSelected:(invoiceItemSelected: IInvoiceItem)=>void
  openInvoiceItemSelect: boolean; setOpenInvoiceItemSelect:(openInvoiceItemSelect: boolean)=>void
  itemVinculoSelecionado: ITItmmov; setItemVinculoSelecionado:(itemVinculoSelecionado: ITItmmov)=>void
};

export const SolicitacaoPagamentoContext = createContext<SolicitacaoPagamentoContextProps | undefined>(undefined);

type SolicitacaoPagamentoProviderProps = {
  children: ReactNode;
};

export function SolicitacaoPagamentoProvider({children}: SolicitacaoPagamentoProviderProps) {
  const [listRateios, setListRateios] = useState<any[]>([] as any[]);
  const [solicitacaoPagamento, setSolicitacaoPagamento] =useState<ISolicitacaoPagamento>({} as ISolicitacaoPagamento);
  const [listPagto, setListPagto] = useState<ITmovpagto[]>([] as ITmovpagto[]);
  const [listItems, setListItems] = useState<ITItmmov[]>([] as ITItmmov[]);
  const [itemVinculoSelecionado, setItemVinculoSelecionado] = useState<ITItmmov>({} as ITItmmov);
  const [listItemsSelect, setListItemsSelect] = useState<ITItmmovData[]>([] as ITItmmovData[]);
  const [itemSelecionado, setItemSelecionado] = useState<ITItmmovData>({} as ITItmmovData);
  const [invoiceItemSelected, setInvoiceItemSelected] = useState<IInvoiceItem>({} as IInvoiceItem);
  const [openSelectItem, setOpenSelectItem] = useState(false);
  const [openInvoiceItemSelect, setOpenInvoiceItemSelect] = useState(false);
  return (
    <SolicitacaoPagamentoContext.Provider
      value={{
        listRateios, setListRateios,
        solicitacaoPagamento, setSolicitacaoPagamento,
        listPagto, setListPagto,
        listItems, setListItems,
        listItemsSelect, setListItemsSelect,
        openSelectItem, setOpenSelectItem,
        itemSelecionado, setItemSelecionado,
        invoiceItemSelected, setInvoiceItemSelected,
        openInvoiceItemSelect, setOpenInvoiceItemSelect,
        itemVinculoSelecionado, setItemVinculoSelecionado
      }}
    >
      {children}
    </SolicitacaoPagamentoContext.Provider>
  );
}

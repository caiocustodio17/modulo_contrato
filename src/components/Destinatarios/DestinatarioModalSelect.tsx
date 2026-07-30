import {
  GridColDef, GridRowParams
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { IDestinatario } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import { useDestinatarioContext } from "./useDestinatarioContext";

type DestinatarioModalSelectProps = {
  title?: string;
  somenteColigadaFilial?: boolean;
};

export function DestinatarioModalSelect({
  title = "Selecione a Escola",
  somenteColigadaFilial = false,
}: DestinatarioModalSelectProps) {
  const { openDestinatario, setOpenDestinatario, destinatarios, setDestinatarios, onSelectDestinatario } = useDestinatarioContext();
  const { error } = useContratoContext()
  const [data, setData] = useState<IDestinatario[]>([]);
  const columnsDestinatario: GridColDef[] = somenteColigadaFilial
    ? [
        { headerName: "Cód. Coligada", field: "CODCOLIGADA", width: 120 },
        { headerName: "Cód. Filial", field: "CODFILIAL", width: 120 },
      ]
    : [
        { headerName: "Cód. Coligada", field: "CODCOLIGADA", width: 100 },
        { headerName: "Cód. Filial", field: "CODFILIAL", width: 100 },
        { headerName: "Nome", field: "NOMEFANTASIA", width: 300 },
        { headerName: "Cnpj", field: "CGC", width: 150 },
      ];
  function handleRowSelectedClick(param: GridRowParams) {
    const { row } = param
    onSelectDestinatario?.(row)
    setOpenDestinatario(false)
    setDestinatarios([])
  }
  useEffect(() => {
    setData(
      destinatarios.map((item, idx) => {
        return { ...item, id: idx }
      })
    )
  }, [destinatarios, openDestinatario])
  return (
    <ModalSelectorComponent
      title={title}
      columns={columnsDestinatario}
      rows={data}
      onClose={() => setOpenDestinatario(false)}
      open={openDestinatario}
      messageError={error}
      onRowClick={handleRowSelectedClick}
    />
  );
}
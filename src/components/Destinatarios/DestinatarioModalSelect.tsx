import {
  GridColDef, GridRowParams
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { IDestinatario } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import { useDestinatarioContext } from "./useDestinatarioContext";

export function DestinatarioModalSelect() {
  const { openDestinatario, setOpenDestinatario, destinatarios, setDestinatarios } = useDestinatarioContext();
  const { contrato, setContrato, error } = useContratoContext()
  const [data, setData] = useState<IDestinatario[]>([]);
  const columnsDestinatario: GridColDef[] = [
    { headerName: "Cód. Coligada", field: "CODCOLIGADA", width: 100 },
    { headerName: "Cód. Filial", field: "CODFILIAL", width: 100 },
    { headerName: "Nome", field: "NOMEFANTASIA", width: 300 },
    { headerName: "Cnpj", field: "CGC", width: 150 },
  ];
  function handleRowSelectedClick(param: GridRowParams) {
    const { row } = param
    setContrato({
      ...contrato,
      TMOV_T_CODCOLIGADA: row.CODCOLIGADA,
      TMOV_T_CODFILIAL: row.CODFILIAL,
      DESCRICAO_CODFILIAL: row.NOMEFANTASIA,
      TMOV_T_CGCFIL: row.CGC,
      TMOV_T_CGCCOL: row.TMOV_T_CGCCOL,
      DESCRICAO_CODCOLIGADA: row.DESCRICAO_CODCOLIGADA
     })
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
      title="Selecione a Escola"
      columns={columnsDestinatario}
      rows={data}
      onClose={() => setOpenDestinatario(false)}
      open={openDestinatario}
      messageError={error}
      onRowClick={handleRowSelectedClick}
    />
  );
}

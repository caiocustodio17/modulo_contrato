import { GridRowParams } from "@mui/x-data-grid";

import { useEffect, useState } from "react";
import { IFornecedor } from "../Contratos/ContratosTypes";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import { fornecedoresColumns } from "./FornecedoresColumns";
import { useFornecedorContext } from "./useFornecedorContext";
export default function FornecedorModalSelect() {
  const { error } = useContratoContext();
  const { setOpenFornecedor, fornecedores, openFornecedor, setFornecedores, onSelectFornecedor } =
    useFornecedorContext();
  const [data, setData] = useState<IFornecedor[]>([]);
  function handleRowClick(param: GridRowParams) {
    onSelectFornecedor?.(param.row);
    setOpenFornecedor(false);
    setFornecedores([])
  }
  useEffect(() => {
    setData(
      fornecedores.map((item, idx) => {
        return { ...item, id: idx };
      })
    );
  }, [fornecedores, openFornecedor]);
  return (
    <ModalSelectorComponent
      columns={fornecedoresColumns}
      rows={data}
      title={"Selecione o Fornecedor"}
      onClose={() => setOpenFornecedor(false)}
      open={openFornecedor}
      onRowClick={handleRowClick}
      messageError={error}
    />
  );
}

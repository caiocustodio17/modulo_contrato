import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import ModalSelectorComponent from '../Global/ModalSelectorComponent';

interface ICentroCustoSQL {
  CODCCUSTO: string;
  NOME: string;
}

interface ModalCentroCustoProps {
  abert: boolean;
  centros: ICentroCustoSQL[];
  onFechar: () => void;
  onSelecionar: (centro: ICentroCustoSQL) => void;
  error?: string;
}

export function ModalCentroCusto({
  abert,
  centros,
  onFechar,
  onSelecionar,
  error
}: ModalCentroCustoProps) {
  const [data, setData] = useState<ICentroCustoSQL[]>([]);

  useEffect(() => {
    setData(
      centros.map((item, idx) => ({
        ...item,
        id: idx
      }))
    );
  }, [centros]);

  const columns: GridColDef[] = [
    { field: 'CODCCUSTO', headerName: 'Código', width: 120 },
    { field: 'NOME', headerName: 'Nome', flex: 1 }
  ];

  const handleRowClick = (params: GridRowParams) => {
    const { row } = params;
    onSelecionar({
      CODCCUSTO: row.CODCCUSTO,
      NOME: row.NOME
    });
    onFechar();
  };

  return (
    <ModalSelectorComponent
      title="Selecione um Centro de Custo"
      columns={columns}
      rows={data}
      open={abert}
      messageError={error}
      onRowClick={handleRowClick}
      onClose={onFechar}
    />
  );
}

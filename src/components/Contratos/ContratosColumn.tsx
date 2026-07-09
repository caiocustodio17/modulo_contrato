import { AccountTreeOutlined } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import fluigConfig from "../../config";
const contratosColumns: GridColDef[] = [
  {
    field: "id",
    headerName: "#",
    width: 50,
    valueGetter: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
  },
  { field: "TF_T_CODCONTRATO", headerName: "Cod. Contrato", width: 100 },
  { field: "STATUSNAME", headerName: "Status", width: 100 },
  {
    field: "IDFLUIG",
    headerName: "ID. FLUIG",
    width: 100,
    renderCell: (params) => {
      return (
        <a href={`${fluigConfig.visualizarProcesso}${params.value}`} target="_blank">
          <div className="text-blue-500 text-sm flex flex-row gap-1"><span><AccountTreeOutlined/></span><span>{params.value}</span>
          </div>
        </a>
      );
    },
  },
  { field: "TMOV_T_CODFILIAL", headerName: "Cod. Filial", width: 50 },
  { field: "DESCRICAO_CODFILIAL", headerName: "Filial", width: 200 },
  { field: "TMOV_T_CGCFIL", headerName: "Cnpj Filial", width: 150 },
  { field: "TMOV_T_CODCFO", headerName: "Cod. Cfo", width: 100 },
  { field: "DESCRICAO_CODCFO", headerName: "Fornecedor", width: 300 },
  { field: "TMOV_T_CGCCFO", headerName: "Cnpj Fornec.", width: 150 },
  { field: "TMOV_T_CODCCUSTO", headerName: "Cod. C. Custo", width: 100 },
  { field: "DESCRICAO_CODCCUSTO", headerName: "Centro de Custo", width: 200 },
  {
    field: "TMOV_T_CODTBORCAMENTO",
    headerName: "Cod. Natureza Orc.",
    width: 100,
  },
  {
    field: "TMOV_T_TBORCAMENTO",
    headerName: "Natureza Orçamentária",
    width: 200,
  },
  { field: "TF_T_VALORCONTRATO", headerName: "Valor", width: 100 },
  { field: "TF_T_DATAINICIO", headerName: "Data Inicio", width: 100 },
  { field: "TF_T_DATAFIM", headerName: "Data Final", width: 100 },
];
export default contratosColumns;

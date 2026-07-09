import { GridColDef } from "@mui/x-data-grid";

export  const fornecedoresColumns:GridColDef[] =[
  { flex:1, field: 'CODCFO', headerName:'Cód. Fornecedor'},
  { flex:1, field: 'NOMEFANTASIA', headerName:'Fornecedor'},
  { flex:1, field: 'CGCCFO', headerName:'Cnpj/Cpf'}
]

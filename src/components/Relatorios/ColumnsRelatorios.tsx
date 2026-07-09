import { GridColDef } from "@mui/x-data-grid";
import fluigConfig from '../../config';
import { AccountTreeOutlined, FileOpenOutlined } from "@mui/icons-material";
import { IMedicaoContrato } from "./@Types/MedicaoContrato";
import { openDocument } from "../../utils/viewDocumentFluig";

const orcamento: GridColDef[] = [
    { field: "DATAINI", headerName: "Data Ini", width: 150 },
    { field: "CODCCUSTO", headerName: "Cód. CCusto", width: 100 },
    { field: "DESCRICAO_CODCCUSTO", headerName: "Nome CCusto", width: 200 },
    { field: "CODTBORCAMENTO", headerName: "Cod. Nat. Orc.", width: 100 },
    { field: "DESCRICAO_CODTBORCAMENTO", headerName: "Natura Orçamentária", width: 200 },
    { field: "ORCADO", headerName: "Orçado", renderCell:(params)=>{ 
        return (params.value) && parseFloat(params.value).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})
    }, width: 100 },
    { field: "COMPROMETIDO", headerName: "Comprometido", renderCell:(params)=>{ 
        return (params.value) && parseFloat(params.value).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})
    }, width: 100 },
    { field: "REALIZADO", headerName: "Realizado", renderCell:(params)=>{ 
        return (params.value) && parseFloat(params.value).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})
    }, width: 100 },
    { field: "DISPONIVEL", headerName: "Disponível", renderCell:(params)=>{ 
        return <span style={{color: params.value < 0 ? 'red' : ''}}> {(params.value) && parseFloat(params.value).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</span>
    }, width: 100 },
    { field: "REQUISITADO", headerName: "Requisitado", renderCell:(params)=>{ 
        return (params.value) && parseFloat(params.value).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})
    }, width: 100 }
  ];

const medicoes: GridColDef<IMedicaoContrato>[] = [
    {
        field: "IDFLUIG",
        headerName: "ID. FLUIG",
        flex:1,
        renderCell: (params) => {
            return (
                <a href={`${fluigConfig.visualizarProcesso}${params.value}`} target="_blank">
                    <div className="text-blue-500 text-sm flex flex-row gap-1"><span><AccountTreeOutlined /></span><span>{params.value}</span>
                    </div>
                </a>
            );
        },
    },
    { field: 'STATUSNAME', headerName: 'Status',  flex:1},
    { field: 'STATUSCODE', headerName: 'Status Code',  flex:1},
    { field: 'TCNT_T_MONTH', headerName: 'Período Medição',  flex:1},
    { field: 'TMOV_T_DATASAIDA', headerName: 'Data Entrada',  flex:1},
    { field: 'TMOV_T_DATAEMISSAO', headerName: 'Data Emissão',  flex:1},
    { field: 'TMOV_T_DATAEXTRA1', headerName: 'Data Vencimento',  flex:1},
    { field: 'TMOV_T_VALORBRUTO', headerName: 'Valor',  flex:1},
]

const anexosMedicoes: GridColDef[] = [
    {field:'id', headerName:'Id. Documento', flex:1,
    renderCell: (params) => {
        console.log('anexosMedicooes:renderCell:params: ',params)
        return (
            <a href="#" onClick={()=>openDocument(params.value)}>
                <div className="text-blue-500 text-sm flex flex-row gap-1"><span><FileOpenOutlined/></span><span>{params.value}</span>
                </div>
            </a>
        );
    }
    },
    {field:'idmedicao', headerName:'Id. Medição', flex:1,
    renderCell: (params) => {
        return (
            <a href={`${fluigConfig.visualizarProcesso}${params.value}`} target="_blank">
                <div className="text-blue-500 text-sm flex flex-row gap-1"><span><AccountTreeOutlined/></span><span>{params.value}</span>
                </div>
            </a>
        );
    }
    },
    {field:'namefile', headerName:'Arquivo', flex:1},
]
export {
    medicoes,
    anexosMedicoes,
    orcamento
}
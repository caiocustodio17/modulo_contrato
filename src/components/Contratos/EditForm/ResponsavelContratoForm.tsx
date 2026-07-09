/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AddOutlined,
  ClearAllOutlined,
  DeleteOutline,
  SearchOutlined,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";
import fluigConfig from "../../../config";
import ModalSelectorComponent from "../../Global/ModalSelectorComponent";
import { IContratoRespData } from "../ContratosTypes";
import { useContratoContext } from "../hooks/useContratoContext";

import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import axios, { AxiosError } from "axios";
import { sqlBody } from "../../../utils/sqlBody";
export default function ResponsavelContratoForm() {
  const { editForm, responsaveis, setResponsaveis, setError, setOpenError } =
    useContratoContext();
  const [responsavel, setResponsavel] = useState<IContratoRespData>(
    {} as IContratoRespData
  );
  const [openPapelSelect, setOpenPapelSelect] = useState(false);
  const [openFuncaoSelect, setOpenFuncaoSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [papelList, setPapelList] = useState([]);
  const [funcaoList, setFuncaoList] = useState([]);
  const readOnly = editForm ? false : true;
  const focused = editForm;
  const papelColumns: GridColDef[] = [
    { field: "id", headerName: "Id." },
    { field: "DESCRIPTION", headerName: "Nome", flex: 1 },
  ];
  const funcaoColumns: GridColDef[] = [
    { field: "TFCNTRESP_T_CODIGO", headerName: "Cód." },
    { field: "TFCNTRESP_T_DESCRICAO", headerName: "Descrição" },
  ];
  function handleSelectFuncaoModalClick(params: GridRowParams) {
    setResponsavel({
      ...responsavel,
      TRESP_T_CODFUNCAO: params.row.TFCNTRESP_T_CODIGO,
      TRESP_T_FUNCAO: params.row.TFCNTRESP_T_DESCRICAO,
    });
    setOpenFuncaoSelect(false);
  }
  function handleSearchPapelClick() {
    setIsLoading(true);
    getPapel();
  }
  function handleSelectPapelModalClick(params: GridRowParams) {
    setResponsavel({
      ...responsavel,
      TRESP_T_SEQF: params.row.ROLE_ID,
      TRESP_T_CODPAPEL: params.row.ROLE_CODE,
      TRESP_T_PAPEL: params.row.DESCRIPTION,
    });
    setOpenPapelSelect(false);
  }
  function handleSearchFuncaoClick() {
    setIsLoading(true);
    getFuncao();
  }

  async function getFuncao() {
    await axios({
      url: fluigConfig.funcoes,
      method: fluigConfig.method,
      data: sqlBody({ codSentenca: "DW.CNT.0001", parameters: "" }),
    })
      .then((d) => {
        const error = d.data.content.values[0].ERRO;
        if (error) throw Error(error);
        const dados = JSON.parse(d.data.content.values[0].MESSAGE);
        setFuncaoList(dados);
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        console.log("Error: ", e);
      })
      .finally(() => {
        setIsLoading(false)
        setOpenFuncaoSelect(true);
      });
  }
  async function getPapel() {
    await axios({
      url: fluigConfig.papeis,
      method: fluigConfig.method,
      data: {
        name: "ds_dw_sql",
        fields: ["SELECT DISTINCT * FROM FDN_ROLE", `java:/jdbc/AppDS`],
      },
    })
      .then((d) => {
        setPapelList(
          d.data.content.values.map((item: any) => {
            return { ...item, id: item.ROLE_ID };
          })
        );
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        setOpenError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setOpenPapelSelect(true);
      });
  }
  return (
    <>
      <Grid container spacing={1} marginTop={1}>
        <Grid item xs={12} sm={12} md={1}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TRESP_T_CODFUNCAO"
            label="Cód. Função"
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            value={responsavel?.TRESP_T_CODFUNCAO ?? ""}
            onChange={(e) =>
              setResponsavel({
                ...responsavel,
                TRESP_T_CODFUNCAO: e.target.value,
                TRESP_T_SEQF: (responsaveis.length + 1).toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TRESP_T_FUNCAO"
            label="Função"
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            value={responsavel?.TRESP_T_FUNCAO ?? ""}
            onChange={(e) =>
              setResponsavel({
                ...responsavel,
                TRESP_T_FUNCAO: e.target.value,
                TRESP_T_SEQF: (responsaveis.length + 1).toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled={readOnly || isLoading}
            onClick={handleSearchFuncaoClick}
          >
            {isLoading ? <CircularProgress size={20} /> : <SearchOutlined />}
          </Button>
        </Grid>

        <Grid item xs={12} sm={12} md={1}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TRESP_T_CODPAPEL"
            label="Cód. Papel"
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            value={responsavel?.TRESP_T_CODPAPEL ?? ""}
            onChange={(e) =>
              setResponsavel({
                ...responsavel,
                TRESP_T_CODPAPEL: e.target.value,
                TRESP_T_SEQF: (responsaveis.length + 1).toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <TextField
            focused={focused}
            fullWidth
            size="small"
            id="TRESP_T_PAPEL"
            label="Papel"
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            value={responsavel?.TRESP_T_PAPEL ?? ""}
            onChange={(e) =>
              setResponsavel({
                ...responsavel,
                TRESP_T_PAPEL: e.target.value,
                TRESP_T_SEQF: (responsaveis.length + 1).toString(),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled={readOnly}
            onClick={handleSearchPapelClick}
          >
            <SearchOutlined />
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            color="success"
            onClick={() => {
              setResponsaveis([...responsaveis, responsavel]);
              setResponsavel({} as IContratoRespData);
            }}
            disabled={readOnly}
          >
            <AddOutlined />
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} md={1}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="large"
            disabled={readOnly}
            onClick={() => setResponsavel({} as IContratoRespData)}
          >
            <DeleteOutline />
          </Button>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="large"
            disabled={readOnly}
            onClick={() => setResponsaveis([])}
          >
            <ClearAllOutlined />
          </Button>
        </Grid>
      </Grid>
      <TableContainer
        sx={{ marginTop: 2 }}
        component={Paper}
        variant="outlined"
      >
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Cód. Função</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Cód. Papel</TableCell>
              <TableCell>Papel</TableCell>
              <TableCell>...</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responsaveis.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.TRESP_T_SEQF}</TableCell>
                <TableCell>{item.TRESP_T_CODFUNCAO}</TableCell>
                <TableCell>{item.TRESP_T_FUNCAO}</TableCell>
                <TableCell>{item.TRESP_T_CODPAPEL}</TableCell>
                <TableCell>{item.TRESP_T_PAPEL}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    disabled={readOnly}
                    onClick={() => {
                      setResponsaveis(
                        responsaveis.filter(
                          (e) => e.TRESP_T_SEQF !== item.TRESP_T_SEQF
                        )
                      );
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ModalSelectorComponent
        title="Selecione a Função"
        columns={funcaoColumns}
        rows={funcaoList}
        onClose={() => setOpenFuncaoSelect(false)}
        open={openFuncaoSelect}
        onRowClick={handleSelectFuncaoModalClick}
        getRowId={(params) => params.TFCNTRESP_T_CODIGO}
      />
      <ModalSelectorComponent
        title="Selecione o papel"
        columns={papelColumns}
        onClose={() => setOpenPapelSelect(false)}
        open={openPapelSelect}
        rows={papelList}
        onRowClick={handleSelectPapelModalClick}
      />
    </>
  );
}

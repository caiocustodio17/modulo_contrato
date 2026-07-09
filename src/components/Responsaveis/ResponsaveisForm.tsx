import {
  SearchOutlined,
  AddOutlined,
  DeleteOutline,
  ClearAllOutlined,
} from "@mui/icons-material";
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { IContratoRespData } from "../Contratos/ContratosTypes";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import useResponsaveis from "./useResponsaveis";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";

export default function ResponsaveisForm() {
  const { responsaveis, setResponsaveis } = useContratoContext();
  const {
    responsavel,
    setResponsavel,
    focused,
    readOnly,
    isLoading,
    handleSearchFuncaoClick,
    handleSearchPapelClick,
    funcaoColumns,
    funcaoList,
    setOpenFuncaoSelect,
    openFuncaoSelect,
    handleSelectFuncaoModalClick,
    papelColumns,
    setOpenPapelSelect,
    openPapelSelect,
    papelList,
    handleSelectPapelModalClick,
  } = useResponsaveis();
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
            // onChange={(e) =>
            //   setResponsavel({
            //     ...responsavel,
            //     TRESP_T_CODFUNCAO: e.target.value,
            //     TRESP_T_SEQF: (responsaveis.length + 1).toString(),
            //   })
            // }
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
            // onChange={(e) =>
            //   setResponsavel({
            //     ...responsavel,
            //     TRESP_T_FUNCAO: e.target.value,
            //     TRESP_T_SEQF: (responsaveis.length + 1).toString(),
            //   })
            // }
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
            // onChange={(e) =>
            //   setResponsavel({
            //     ...responsavel,
            //     TRESP_T_CODPAPEL: e.target.value,
            //     TRESP_T_SEQF: (responsaveis.length + 1).toString(),
            //   })
            // }
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
              if (responsavel?.TRESP_T_CODFUNCAO && responsavel?.TRESP_T_CODPAPEL) {
                setResponsaveis([...responsaveis, responsavel]);
                setResponsavel({} as IContratoRespData);
              }
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

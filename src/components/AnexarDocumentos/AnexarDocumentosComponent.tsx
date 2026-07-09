import {
  AttachFileOutlined
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useUploadFile } from "./useUploadFile";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";

export default function AnexarDocumentosComponent() {
  const {handleChangeFile, uploadedFile} = useUploadFile()
  const {notaSelecioanda} = useContratoContext()
  return (
    <div>
      <Grid
        container
        spacing={1}
        marginTop={1}
      >
        <Grid item xs={12} sm={3}>

            <Button
              component="label"
              color="primary"
              size="large"
              fullWidth
              variant="outlined"
              startIcon={<AttachFileOutlined />}
              sx={{margin:'12px 0 12px 0'}}
              >
                Anexar arquivo
              <input
                hidden
                accept="application/pdf"
                type="file"
                onChange={handleChangeFile}
              />
            </Button>
        </Grid>
        <Grid item xs={12} sm={9}>
        {notaSelecioanda.id && (
              <Alert severity="warning">Não é necessário inserir uma nota fiscal no PDF.</Alert>
            )}
        </Grid>
      </Grid>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Nome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFile.map((item,idx) => (
              <TableRow key={idx+1}>
                <TableCell>{idx+1}</TableCell>
                <TableCell>{item}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

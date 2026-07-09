import { CancelOutlined, SaveOutlined } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import useSolicitacaoPagamento from "./useSolicitacaoPagamento";

export default function SolicitacaoPagamentoBotoes(){
  
  const {handleCancel, handleSaveClick} = useSolicitacaoPagamento()
  return (
    <Grid>
        <Grid item display={"flex"} gap={1} mt={2}>
          <Button
            sx={{ flex: 1 }}
            variant="outlined"
            size="large"
            color="success"
            startIcon={<SaveOutlined />}
            onClick={handleSaveClick}
          >
            Salvar
          </Button>
          <Button
            sx={{ flex: 1 }}
            variant="outlined"
            size="large"
            color="error"
            startIcon={<CancelOutlined />}
            onClick={handleCancel}
            type="reset"
          >
            Cancelar
          </Button>
        </Grid>
      </Grid>
  )
}

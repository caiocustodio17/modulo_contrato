import { CancelOutlined, SaveOutlined } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { IContratoData } from "./ContratosTypes";
import { useContratoContext } from "./hooks/useContratoContext";
import useSaveContrato from "./hooks/useSaveContrato";

export default function ContratoModalEditButtons(){
  const {setOpenEdit, editForm, setNotaSelecionada, setContrato} = useContratoContext()
  const {save} = useSaveContrato();
  function handleReset(){
    setNotaSelecionada({})
    setContrato({} as IContratoData)
    setOpenEdit(false)
  }
  return(
    <Box sx={{display:'flex', gap:1, flexDirection:'row', mt:5}}>
      <Button disabled={editForm ? false : true} sx={{flexGrow:1}} size="large" variant="outlined" type="button" fullWidth color="success" endIcon={<SaveOutlined/>} onClick={save}>Salvar</Button>
      <Button disabled={editForm ? false : true} sx={{flexGrow:1}} size="large" variant="outlined" fullWidth color="error" endIcon={<CancelOutlined/>} onClick={()=>handleReset()}>Cancelar</Button>
    </Box>
  )
}

import { Box } from "@mui/material"
import { DataGrid, DataGridProps, ptBR } from "@mui/x-data-grid"

interface DataGridComponentProps extends DataGridProps{
  customTollbar?: JSX.Element
  size?: string | number
}
export default function DataGridComponent(props:DataGridComponentProps) {
  return (
    <Box sx= {{width:'100%', height:props.size ?? '70vh'}}>
    <DataGrid
    density="compact"
    loading={props.loading}
    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
    sx={{
      cursor: "pointer",
    }}
    slots={{
      toolbar: ()=>props.customTollbar,
    }}
    {...props}
  />
  </Box>
  )
}

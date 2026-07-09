import { Box } from "@mui/material";
import { DataGrid, DataGridProps, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import ErrorComponent from "./ErrorComponent";
import { ModalComponent } from "./ModalComponent";
type ModalSelectorProps = DataGridProps & {
  title: string;
  onClose: () => void;
  messageError?:string
  open: boolean
}
export default function ModalSelectorComponent(props: ModalSelectorProps) {
  const {title, onClose, open} = props
  return (
    <ModalComponent title={title} onClose={onClose} open={open}>
      <Box width={"100%"} height={300}>
      <DataGrid
        {...props}
        slots={{
          toolbar: () => (
            <GridToolbarContainer
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <GridToolbarQuickFilter />
            </GridToolbarContainer>
          ),
        }}
        sx={{
          cursor: "pointer",
        }}
        density="compact"
      />
      </Box>
      <ErrorComponent message={props.messageError??""}/>
    </ModalComponent>
  );
}

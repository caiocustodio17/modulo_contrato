import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { ReactNode } from "react";

type CustomTolbarProps = {
  children?: ReactNode;
};
export function CustomToolbarComponent(props: CustomTolbarProps) {
  return (
    <GridToolbarContainer sx={{display:'flex', justifyContent:'space-between'}}>
      <div>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      {props.children}
      </div>
      <GridToolbarQuickFilter debounceMs={500}/>
    </GridToolbarContainer>
  );
}

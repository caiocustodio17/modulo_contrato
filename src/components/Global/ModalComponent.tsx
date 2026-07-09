import { CancelOutlined } from "@mui/icons-material";
import {
  AppBar,
  Dialog,
  DialogProps,
  IconButton,
  Toolbar,
  Typography
} from "@mui/material";
import { ReactNode } from "react";
export type ModalComponentProps = DialogProps & {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};
export function ModalComponent(props: ModalComponentProps) {
  return (
    <Dialog maxWidth={false} fullWidth {...props}>

        <AppBar position="static">
          <Toolbar variant="dense" sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Typography variant="h6" color="inherit" component="div">
              {props.title}
            </Typography>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={props.onClose}
            >
              <CancelOutlined />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div style={{padding:'16px', margin:'12px 12px 0px 12px'}}>
        {props.children}
        </div>

      <div style={{padding:16}}>
      {props.actions}
      </div>
    </Dialog>
  );
}

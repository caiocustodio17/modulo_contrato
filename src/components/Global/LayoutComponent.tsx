import { HelpOutline, WorkOutline } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Card,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import ModalErrorComponent from "./ModalErrorComponent";
import ModalLoadingComponent from "./ModalLoadingComponent";

type LayoutProps = {
  children: ReactNode;
  title: string;
};

export default function LayoutComponent({ children, title }: LayoutProps) {
  const { error, oepnError, setOpenError, setPageLoading, pageLoading } = useContratoContext();
  return (
    <>
      <Card style={{ marginTop: 97, marginRight: 20, marginLeft: 90 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton edge="start" color="inherit" aria-label="menu">
              <WorkOutline />
            </IconButton>
            <Typography
              variant="h6"
              color="inherit"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
            <IconButton edge="end" color="inherit">
              <HelpOutline />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: 1 }}>{children}</Box>
      </Card>
      <ModalLoadingComponent
      onClose={() => setPageLoading(false)}
      open={pageLoading}
      />
      <ModalErrorComponent
        message={error}
        title="Erro"
        open={oepnError}
        onClose={() => setOpenError(false)}
      />
    </>
  );
}

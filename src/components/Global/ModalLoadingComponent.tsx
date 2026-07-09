import { Box, CircularProgress, Dialog } from "@mui/material";

export default function ModalLoadingComponent(props: {
  onClose: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      onClose={props.onClose}
      title="executando ..."
      open={props.open}
      maxWidth={"md"}
      fullWidth
    >
      <Box
        sx={{
          height: 200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
        executando
      </Box>
    </Dialog>
  );
}

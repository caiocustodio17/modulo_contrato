import { Alert, Dialog } from "@mui/material";

export default function ModalErrorComponent(props: {
  onClose: () => void;
  title: string;
  open: boolean;
  message: string;
}) {
  return (
    <Dialog
      onClose={props.onClose}
      title={props.title}
      open={props.open}
      maxWidth={"md"}
      fullWidth
    >
        {props.message.length > 0 && (
          <Alert sx={{minHeight:200}} severity="error">
            {props.message}
          </Alert>
        )}
    </Dialog>
  );
}

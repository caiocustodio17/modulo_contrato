import { Alert } from "@mui/material";

type ErrorComponentProps = {
  message: string | string[];
};
export default function ErrorComponent({ message }: ErrorComponentProps) {
  return (
    <>
    {message.length > 0 && (
    <Alert severity="error">
     <pre>{message}</pre>
    </Alert>
    )}
    </>
  );
}

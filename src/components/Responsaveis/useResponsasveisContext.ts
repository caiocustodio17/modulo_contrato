import { useContext } from "react";
import { ResponsaveisContext } from "./ResponsaveisContext";

export function useResponsaveisContext() {
  const context = useContext(ResponsaveisContext);
  if (!context)
    throw new Error(
      "useResponsaveisContext deve envolver os componentes dentro de ResponsaveisProvider"
    );
  return context;
}

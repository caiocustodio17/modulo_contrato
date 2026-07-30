import { StyledEngineProvider } from "@mui/material/styles";
import ContratosGridComponent from "./components/Contratos/ContratosComponent";
import LayoutComponent from "./components/Global/LayoutComponent";
import jsonConfig from "../package.json";
import { AppProviders } from "./AppProviders";

export function App() {
  return (
    <StyledEngineProvider injectFirst>
      <AppProviders>
        <LayoutComponent title="Gestão de Contratos">
          <div
            style={{
              width: "100%",
              padding: 2,
              textAlign: "center",
              fontSize: "smalller",
            }}
          >
            <ContratosGridComponent />
            Versão: {jsonConfig.version}
          </div>
        </LayoutComponent>
      </AppProviders>
    </StyledEngineProvider>
  );
}

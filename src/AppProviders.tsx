import { ReactNode } from "react";
import { ContratoProvider } from "./components/Contratos/ContratosContext";
import { NaturezaOrcamentariaProvider } from "./components/NaturezaOrcamentaria/NaturezaOrcamentariaContext";

// App-wide providers, mounted once, outermost first.
const PROVIDERS = [ContratoProvider, NaturezaOrcamentariaProvider];

export function AppProviders({ children }: { children: ReactNode }) {
  return PROVIDERS.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children as JSX.Element,
  );
}

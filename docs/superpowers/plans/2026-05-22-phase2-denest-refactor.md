# Phase 2 — De-nest, Clean Code & Bug Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Rateio component, the provider tree, and `useSolicitacaoPagamento` understandable, and fix two user-reported bugs, without changing behavior except the named fixes.

**Architecture:** Three independent areas. B: extract `useControleRateio` from the Rateio monolith + fix Bug A (clear-refill) and Bug B (stuck add button). A: mount each provider once (remove duplicate Natureza + double Solicitação providers). C: fix a render-phase setState, extract a pure `buildSolicitacaoPayload`, guard its rewrite with a golden-JSON script.

**Tech Stack:** React 18, Vite 4, axios, TypeScript (strict), MUI. No test runner (one on-demand Node script for the payload).

---

## ⛔ Project-specific execution rules (READ FIRST)

- **DO NOT `git commit` anything.** The user commits Phase 2 themselves. Every task ends at verification; leave changes in the working tree. There are **no commit steps** in this plan by design.
- **DO NOT touch `vite.config.ts`** (gitignored) or the user's WIP files unless a task explicitly says so.
- **Verification, not tests:** `npx tsc --noEmit` must show only the known pre-existing `useSaveContrato.ts(8,1)` TS6133 error and zero new errors. Refactored files must add zero new lint problems (`npm run lint` already fails on ~17 pre-existing problems — your file must not appear among them). Behavioral checks are done in the running dev app (`npm run dev`, mocks on) by the user.
- **Relocated code moves verbatim.** Where a step says "move … verbatim," copy the existing lines unchanged; do not re-derive logic. This is a refactor — behavior is preserved by default.

---

## File Structure

```text
# Area B — Rateio
src/components/Contratos/EditForm/useControleRateio.ts     CREATE  state + logic hook (extracted)
src/components/Contratos/EditForm/ControleRateioForm.tsx   MODIFY  render-only; consumes the hook; Bug A + Bug B fixed
src/components/Rateio/CentroCustoRateioForm.tsx            MODIFY  LinhaRateio: remove dead props + refill effect
src/components/Rateio/test.tsx                             DELETE  unused legacy duplicate
src/components/Rateio/CentroCustoRateioItem.tsx            DELETE  unused legacy duplicate

# Area A — Providers
src/AppProviders.tsx                                       CREATE  ordered provider composer
src/App.tsx                                                MODIFY  use AppProviders
src/components/Contratos/ContratosContext.tsx              MODIFY  drop internal NaturezaOrcamentariaProvider
src/components/SolicitacaoPgto/SolicitacaoPagamentoModal.tsx MODIFY remove inner SolicitacaoPagamentoProvider + console.log

# Area C — Hook + payload
src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts  CREATE  pure payload builder
src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts  MODIFY  fix render setState; call builder; de-noise
scripts/check-payload.mts                                  CREATE  golden-diff script
scripts/payload-golden.json                                CREATE  golden output (generated, NOT committed)
```

---

# AREA B — Rateio refactor + bug fixes

## Task B1: Delete unused legacy Rateio files

**Files:**
- Delete: `src/components/Rateio/test.tsx`
- Delete: `src/components/Rateio/CentroCustoRateioItem.tsx`

- [ ] **Step 1: Re-confirm they are unused**

Run (Grep tool or rg): search the whole `src/` for imports of these modules:
- pattern `Rateio/test` → expect 0 import matches.
- pattern `CentroCustoRateioItem` → expect 0 import matches.
Both files export a legacy `CentroCustoRateioForm`; the active import in `ControleRateioForm.tsx` is `import { LinhaRateio } from '../../Rateio/CentroCustoRateioForm'` (a *different* file, `CentroCustoRateioForm.tsx`). If either dead file IS imported somewhere, STOP and report — do not delete.

- [ ] **Step 2: Delete both files**

Remove `src/components/Rateio/test.tsx` and `src/components/Rateio/CentroCustoRateioItem.tsx`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: only the pre-existing `useSaveContrato.ts(8,1)` error; no "cannot find module" errors. Leave changes in the working tree (no commit).

---

## Task B2: Fix Bug B (stuck "+" button)

**Files:**
- Modify: `src/components/Contratos/EditForm/ControleRateioForm.tsx` (the `isBlock` effect, currently lines ~59-73)

- [ ] **Step 1: Replace the isBlock effect**

Find:
```ts
  useEffect(() => {
    if(rateios.length <= 1) return
    let soma = 0;
    rateios.forEach((rateio) => {
      soma += Number(rateio.PERCENTUAL || 0)
    })
    soma = Math.round(soma)

    if(soma == 100) {
      setIsBlock(true) 
    } else{
      setIsBlock(false)
    }

  },[isBlock, rateios])
```
Replace with:
```ts
  useEffect(() => {
    if (rateios.length <= 1) {
      setIsBlock(false);
      return;
    }
    const soma = Math.round(
      rateios.reduce((acc, rateio) => acc + Number(rateio.PERCENTUAL || 0), 0)
    );
    setIsBlock(soma === 100);
  }, [rateios]);
```
Key changes: when `rateios.length <= 1`, reset `isBlock` to `false` (so removing the last extra line re-enables `+`); removed `isBlock` from the dependency array.

- [ ] **Step 2: Verify (build)**

Run: `npx tsc --noEmit` → only the pre-existing error.

- [ ] **Step 3: Verify (behavior — user runs)**

In the dev app: open a contract → Rateio. Click `+` (adds a line, sum=100% → `+` disables). Click `−` (removes it). Expected: `+` becomes enabled again. Report this needs a user/browser check; leave in working tree.

---

## Task B3: Fix Bug A part 1 — remove LinhaRateio auto-refill effect

**Files:**
- Modify: `src/components/Rateio/CentroCustoRateioForm.tsx` (the `LinhaRateio` component)

- [ ] **Step 1: Remove the refill effect**

Find and DELETE this block (currently ~lines 50-54):
```ts
  React.useEffect(() => {
    if (valorTotalContrato && !valor) {
      onChange(index, "VALOR", valorTotalContrato);
    }
  }, [valorTotalContrato, index, onChange, valor]);
```
This effect re-fills the value with the contract total whenever the field is empty — i.e., the moment the user clears it. Removing it stops the auto-refill. If `React` is now an unused import, remove the `React` import; if other `React.` usages remain, keep it.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error; no "React is declared but never read" from this file.

---

## Task B4: Fix Bug A part 2 — stop row-0 sync from re-forcing VALOR

**Files:**
- Modify: `src/components/Contratos/EditForm/ControleRateioForm.tsx` (the `rateios.length <= 1` sync effect, currently lines ~77-124)

**Context:** This effect re-applies `contrato` values to row 0 whenever its deps change. Today it overwrites `VALOR` with `String(valorTotal || '')` every time, which (together with B3) is the second source of the clear-then-refill behavior. The fix keeps syncing the *identity* fields (centro de custo + natureza) from `contrato`, but stops overwriting `VALOR`/`PERCENTUAL` that the user controls. Initial seeding of `VALOR` already happens in the `useState` initializer (lines ~31-44) and in the empty-array branch, so row 0 still starts with the contract total.

- [ ] **Step 1: Edit the single-line sync branch**

In the effect, find the object assigned to `novosRateios[0]` in the non-empty branch (currently ~lines 95-104):
```ts
    const novosRateios = [...prevRateios];
    novosRateios[0] = {
        ...novosRateios[0],
        CODCCUSTO: contrato.TMOV_T_CODCCUSTO || '',
        NOME: contrato.DESCRICAO_CODCCUSTO || '',
        VALOR:  String(valorTotal || ''),
        // PERCENTUAL:  novosRateios[0].PERCENTUAL === '' ? '' : '100.00',
        PERCENTUAL: '100.00',
        CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || '',
        DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || ''
      };
```
Replace with (drop the `VALOR` and `PERCENTUAL` overwrites so user edits/clears persist; keep identity fields synced):
```ts
    const novosRateios = [...prevRateios];
    novosRateios[0] = {
        ...novosRateios[0],
        CODCCUSTO: contrato.TMOV_T_CODCCUSTO || '',
        NOME: contrato.DESCRICAO_CODCCUSTO || '',
        CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || '',
        DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || ''
      };
```
Leave the empty-array branch (lines ~83-92) and the `novosRateios.length > 1` value-adjust block (lines ~105-121) unchanged — those handle initial seed and multi-line rebalancing, not the clear-refill bug.

- [ ] **Step 2: Remove now-unneeded deps**

In the same effect's dependency array, remove `contrato.TF_T_VALORCONTRATO` and `valorTotal` ONLY IF they are no longer referenced inside the effect after Step 1. Check: the `length > 1` adjust block still uses `valorTotal`, so KEEP `valorTotal`; `contrato.TF_T_VALORCONTRATO` is `valorTotal`'s source — keep it too if `valorTotal` is derived from it. Net: likely no dep change is safe. Only edit deps if tsc/eslint flags an unused one. Do not introduce an exhaustive-deps churn.

- [ ] **Step 3: Verify (build + behavior)**

Run: `npx tsc --noEmit` → only the pre-existing error.
User behavioral check: open a contract with a contract value → Rateio → clear all characters in row 0's Valor field → it stays empty (does not snap back to the contract total). Report as needing a user/browser check.

---

## Task B5: Remove dead props from LinhaRateio

**Files:**
- Modify: `src/components/Rateio/CentroCustoRateioForm.tsx` (`LinhaRateioProps` interface + destructure)
- Modify: `src/components/Contratos/EditForm/ControleRateioForm.tsx` (the `<LinhaRateio .../>` props passed)

- [ ] **Step 1: Confirm which props are unread**

In `CentroCustoRateioForm.tsx`, the `LinhaRateio` body reads: `index`, `codCusto`, `nome`, `valor`, `percentual`, `codNat`, `nomeNat`, `isLoading`, `focused`, `onChange`, `getNaturezaOrcamentaria`, `disabled`, `valorTotalContrato`. It does NOT read: `onBuscar`, `onLimpar`, `currentEditingIndex`, `onBlur`. Verify by reading the component body before editing.

- [ ] **Step 2: Remove the four dead props from the interface**

In `LinhaRateioProps`, delete these members:
```ts
  currentEditingIndex: number | null;
  onBuscar: (index: number) => void;
  onLimpar: (index: number) => void;
  ...
  onBlur?: unknown;
```
(Keep all props the body actually reads.)

- [ ] **Step 3: Stop passing them from the parent**

In `ControleRateioForm.tsx`, in the `<LinhaRateio ... />` JSX (currently ~lines 383-405), remove the props that no longer exist on the interface:
```tsx
            currentEditingIndex={currentEditingIndex}
            onBuscar={(idx) => {
              setModalAtivo('centroCusto');
              buscarCentroCusto(idx);
            }}
            onLimpar={limparRateio}
```
IMPORTANT: this means `buscarCentroCusto`, `limparRateio`, `setModalAtivo`, and `currentEditingIndex` may become unused in `ControleRateioForm`. If `LinhaRateio` no longer triggers centro-custo search or clear, confirm whether those handlers are still reachable from any other UI in this form. If they become genuinely unreachable, that is a behavior change — STOP and report DONE_WITH_CONCERNS describing what would be lost (e.g., "removing onBuscar leaves no way to search centro de custo per line"). Do not silently drop reachable functionality. (The Natureza search button inside `LinhaRateio` uses `getNaturezaOrcamentaria`, which stays.)

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error; no "declared but never read" from these two files (remove any handler that genuinely became unused AND unreachable, per Step 3 — but only after reporting).

---

## Task B6: Extract `useControleRateio` hook

**Files:**
- Create: `src/components/Contratos/EditForm/useControleRateio.ts`
- Modify: `src/components/Contratos/EditForm/ControleRateioForm.tsx` (becomes render-only)

**Context:** This is a behavior-preserving move. All state and handlers currently inside `ControleRateioMonolitico` (after Tasks B2/B4/B5) move into a hook; the component keeps only JSX. Move logic VERBATIM — do not re-derive.

- [ ] **Step 1: Create the hook file with this exact public interface**

`useControleRateio.ts` exports `useControleRateio()` returning exactly:
```ts
export interface ICentroCustoSQL {
  ID?: number;
  CODCCUSTO: string;
  NOME: string;
  VALOR?: string;
  PERCENTUAL?: string;
  CODTBORCAMENTO?: string;
  DESCRICAO_NAT?: string;
}

export function useControleRateio(): {
  rateios: ICentroCustoSQL[];
  isLoading: boolean;
  focused: boolean;
  error: string;
  isBlock: boolean;
  openCentroCusto: boolean;
  rateioCentroCustos: ICentroCustoSQL[];
  currentEditingIndex: number | null;
  contrato: ReturnType<typeof useContratoContext>["contrato"];
  adicionarRateio: () => void;
  removerRateio: () => void;
  atualizarRateio: (index: number, campo: keyof ICentroCustoSQL, valorInput: string) => void;
  limparRateio: (index: number) => void;
  buscarCentroCusto: (index: number) => Promise<void>;
  buscarNaturezaOrcamentaria: (index: number) => Promise<void>;
  handleCentroCustoSelected: (centroSelecionado: ICentroCustoSQL) => void;
  setModalAtivo: (m: "centroCusto" | "natureza" | null) => void;
  closeCentroCusto: () => void;
  selectNatureza: (naturezaSelecionada: any) => void;
};
```
Move into this hook, VERBATIM from `ControleRateioForm.tsx`: the `useContratoContext`/`useNaturezaOrcamentariaContext` reads, `valorTotal`, all `useState` declarations, the two `useEffect`s (the B2-fixed isBlock effect and the B4-fixed sync effect), the `setListRateio` effect, and the handlers `adicionarRateio`, `removerRateio`, `atualizarRateio`, `validarPreRequisitos`, `buscarCentroCusto`, `buscarNaturezaOrcamentaria`, `handleCentroCustoSelected`, `limparRateio`. Add two small wrappers used by the JSX so the component stays declarative:
```ts
  const closeCentroCusto = () => {
    setOpenCentroCusto(false);
    setCurrentEditingIndexForModal(null);
    setRateioCentroCustos([]);
  };
```
and `selectNatureza` = the inline `onSelecionar` arrow currently passed to `<NaturezaOrcamentariaModalSelect>` (move it verbatim into the hook as a named function). Keep the same imports the moved code needs (`axios`, `AxiosError`, `fluigConfig`, `sqlBody`, both context hooks). Return the object above.

- [ ] **Step 2: Reduce ControleRateioForm to render-only**

Replace `ControleRateioForm.tsx` body with consumption of the hook. Keep the existing JSX structure (the scrollable Box + `LinhaRateio` map + `+`/`−` buttons + `<ModalCentroCusto>` + `<NaturezaOrcamentariaModalSelect>`), wiring props from the hook. Concretely:
```tsx
import { Box, Button, Grid } from '@mui/material';
import { LinhaRateio } from '../../Rateio/CentroCustoRateioForm';
import { ModalCentroCusto } from '../../Rateio/CentroCustoRateioModalSelect';
import { NaturezaOrcamentariaModalSelect } from '../../NaturezaOrcamentaria/NaturezaOrcamentariaModalSelect';
import { useControleRateio } from './useControleRateio';

export default function ControleRateioForm() {
  const r = useControleRateio();
  return (
    <>
      <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '8px', marginBottom: '16px' }}>
        {r.rateios.map((rateio, index) => (
          <LinhaRateio
            key={index}
            index={index}
            codCusto={rateio.CODCCUSTO}
            nome={rateio.NOME}
            valor={rateio.VALOR}
            percentual={rateio.PERCENTUAL}
            codNat={rateio.CODTBORCAMENTO}
            nomeNat={rateio.DESCRICAO_NAT}
            isLoading={r.isLoading}
            focused={r.focused}
            onChange={(idx, campo, valor) => r.atualizarRateio(idx, campo, valor)}
            getNaturezaOrcamentaria={r.buscarNaturezaOrcamentaria}
            valorTotalContrato={r.contrato.TF_T_VALORCONTRATO}
          />
        ))}
      </Box>
      <Grid item xs={12} sm={12} md={1}>
        <Button onClick={r.adicionarRateio} disabled={r.isBlock}>+</Button>
        <Button onClick={r.removerRateio} disabled={r.rateios.length <= 1}>-</Button>
      </Grid>
      <ModalCentroCusto
        abert={r.openCentroCusto}
        centros={r.rateioCentroCustos}
        onFechar={r.closeCentroCusto}
        onSelecionar={r.handleCentroCustoSelected}
        error={r.error}
      />
      <NaturezaOrcamentariaModalSelect onSelecionar={r.selectNatureza} />
    </>
  );
}
```
Note: the `<LinhaRateio>` props here already exclude the props removed in B5. If B5 reported that per-line centro-custo search/clear was reachable and must stay, KEEP the corresponding props and hook methods and add them back here — match whatever B5 concluded. Keep the exported name compatible with existing imports of this module (it is a default export; the function may be renamed from `ControleRateioMonolitico` to `ControleRateioForm`).

- [ ] **Step 3: Verify the export name is still imported correctly**

Grep for how `ControleRateioForm` is imported by its consumer (the budget/edit form). It is a default import, so renaming the function is safe. Confirm no named import of `ControleRateioMonolitico` exists.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error. Confirm `ControleRateioForm.tsx` and `useControleRateio.ts` are absent from `npm run lint` output.
User behavioral check (regression): open a contract → Rateio renders, add/remove/clear/search/natureza all behave as before plus the B2/B4 fixes. Report as needing a user/browser check.

---

# AREA A — Provider de-nesting

## Task A1: Create AppProviders composer and use it in App.tsx

**Files:**
- Create: `src/AppProviders.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/AppProviders.tsx`**

```tsx
import { ReactNode } from "react";
import { ContratoProvider } from "./components/Contratos/ContratosContext";
import { NaturezaOrcamentariaProvider } from "./components/NaturezaOrcamentaria/NaturezaOrcamentariaContext";

// App-wide providers, mounted once, outermost first.
const PROVIDERS = [ContratoProvider, NaturezaOrcamentariaProvider];

export function AppProviders({ children }: { children: ReactNode }) {
  return PROVIDERS.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children as JSX.Element
  );
}
```

- [ ] **Step 2: Use it in `src/App.tsx`**

Replace the nested `<ContratoProvider><NaturezaOrcamentariaProvider>...` wrapper with `<AppProviders>`:
```tsx
import ContratosGridComponent from "./components/Contratos/ContratosComponent";
import LayoutComponent from "./components/Global/LayoutComponent";
import jsonConfig from "../package.json";
import { AppProviders } from "./AppProviders";

export function App() {
  return (
    <AppProviders>
      <LayoutComponent title="Gestão de Contratos">
        <div style={{ width: "100%", padding: 2, textAlign: "center", fontSize: "smalller" }}>
          <ContratosGridComponent />
          Versão: {jsonConfig.version}
        </div>
      </LayoutComponent>
    </AppProviders>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error. (Behavioral check happens after A2, since A2 removes the duplicate.)

---

## Task A2: Remove the duplicate NaturezaOrcamentariaProvider inside ContratoProvider

**Files:**
- Modify: `src/components/Contratos/ContratosContext.tsx` (the `return` of `ContratoProvider`, currently ~lines 58-80)

- [ ] **Step 1: Drop the inner provider wrap**

Find:
```tsx
    <ContratoContext.Provider
      value={{
        ...
      }}
    >
    <NaturezaOrcamentariaProvider>
        {children}
      </NaturezaOrcamentariaProvider>
    </ContratoContext.Provider>
```
Replace the children portion so it renders `{children}` directly (no inner `NaturezaOrcamentariaProvider`):
```tsx
    <ContratoContext.Provider
      value={{
        ...
      }}
    >
      {children}
    </ContratoContext.Provider>
```
Then remove the now-unused `import { NaturezaOrcamentariaProvider } ...` from this file.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error; no unused-import error in `ContratosContext.tsx`.
User behavioral check: app loads; open a contract → the budget/rateio Natureza Orçamentária selection still works (it now resolves to the single app-wide provider). Report as needing a user/browser check.

---

## Task A3: Single SolicitacaoPagamentoProvider mount

**Files:**
- Modify: `src/components/SolicitacaoPgto/SolicitacaoPagamentoModal.tsx`

**Context:** `ContratosComponent.tsx` already wraps the whole modal: `{openMedicao && <SolicitacaoPagamentoProvider><SolicitacaoPagamentoModal /></SolicitacaoPagamentoProvider>}`. The modal then wraps its form tab in a *second* `SolicitacaoPagamentoProvider`, giving that tab its own isolated state. Removing the inner one makes the whole modal share one state instance.

- [ ] **Step 1: Remove the inner provider around the form tab**

In `SolicitacaoPagamentoModal.tsx`, change the Solicitação tab content:
```tsx
    { label: 'Solicitação de Pagamento', content: <SolicitacaoPagamentoProvider><SolicitacaoPagamentoForm /></SolicitacaoPagamentoProvider> }
```
to:
```tsx
    { label: 'Solicitação de Pagamento', content: <SolicitacaoPagamentoForm /> }
```
Remove the now-unused `import { SolicitacaoPagamentoProvider } from "./SolicitacaoPagamentoContext";`. Also remove the stray `console.log(indexTab)` line.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error; no unused-import error in this file.
User behavioral check (the risky one): open a contract → medição modal → Solicitação de Pagamento tab. Confirm items/payment/rateio still load and the save flow works. **If the tab breaks (e.g., empty state), revert ONLY this file** (the double-mount was load-bearing) and report. Report as needing a user/browser check.

---

# AREA C — Hook decomposition + payload rewrite

## Task C1: Fix the render-phase setState in useSolicitacaoPagamento

**Files:**
- Modify: `src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts` (currently ~lines 64-68)

- [ ] **Step 1: Move the render-phase setState into an effect**

Find (executed during render — a React anti-pattern that can loop):
```ts
  if (listRateio.length > 0) {
    setListRateios(listRateio);
  }
  console.log("useContrato - listRateio: ", listRateio);
  console.log("useSolicitacaoPagamento - listRateios: ", listRateios);
```
Replace with:
```ts
  useEffect(() => {
    if (listRateio.length > 0) {
      setListRateios(listRateio);
    }
  }, [listRateio]);
```
(Removes the two debug `console.log`s and moves the sync into an effect keyed on `listRateio`.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error.
User behavioral check: open the Solicitação tab; rateio still populates from the contract's rateio. Report as needing a user/browser check.

---

## Task C2: Extract the payload builder VERBATIM (no logic change yet)

**Files:**
- Create: `src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts`
- Modify: `src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts` (`handleSaveClick`)

**Context:** Move the payload-building logic out of `handleSaveClick` into a pure function, UNCHANGED. The function takes plain inputs (no React, no `axios`, no `window`) and returns the `formData` array (and `formFields`). The hook keeps gathering inputs, the network call, version fetch, attachments, and `window.WCMAPI` reads.

- [ ] **Step 1: Define the pure builder with this exact signature**

`buildSolicitacaoPayload.ts`:
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import formatChaveNFE from "../../utils/formatChaveNFE";
import { ISolicitacaoPagamento, ITItmmov, ITmovpagto } from "./@types/SolicitacaoPagamentoType";

export interface BuildPayloadInput {
  listItems: ITItmmov[];
  listRateios: any[];
  listPagto: ITmovpagto[];
  contrato: any;
  solicitacaoPagamento: ISolicitacaoPagamento;
  dataFornecedor: { OPTANTEPELOSIMPLES: string; PORTE: string };
  valorEsperadoMes: string | undefined; // contrato value for the billing month
}

export interface BuildPayloadResult {
  formFields: Record<string, any>;
  formData: { name: string; value: any }[];
}

export function buildSolicitacaoPayload(input: BuildPayloadInput): BuildPayloadResult {
  const { listItems, listRateios, listPagto, contrato, solicitacaoPagamento, dataFornecedor, valorEsperadoMes } = input;
  // MOVE VERBATIM here: the body of handleSaveClick from the start of
  // `let formFields: any = {};` through the construction of `novasolicitacao`
  // and `formFields = { ...formFields, ...novasolicitacao };`, then build:
  //   const keys = Object.keys(formFields);
  //   const formData = keys.map((key) => ({ name: key, value: formFields[key] }));
  // Replace `valorEsperado(mesFaturamento)` references with `valorEsperadoMes`.
  // Do NOT change any arithmetic, field key, or rounding logic.
  // Return { formFields, formData }.
}
```
Move the existing logic verbatim. The only substitutions allowed: (a) inputs come from `input.*` instead of closure/context; (b) `valorEsperado(mesFaturamento)` → `valorEsperadoMes` (compute it in the hook and pass in); (c) drop the `console.log`/`console.group` debug lines. No other changes.

- [ ] **Step 2: Rewire handleSaveClick to call the builder**

In `useSolicitacaoPagamento.ts`, `handleSaveClick` becomes: compute `mesFaturamento` and `valorEsperadoMes`, call `buildSolicitacaoPayload({...})` to get `formData`, then keep the existing tail VERBATIM: `getVersionProcess()`, `anexos` construction (uses `window.WCMAPI`), the `data` object (processInstanceId/version/attachments/formData/selectedState/currentState), and the `return window.location.host.includes("localhost") ? data : await axios.post(...)` block including the `.then`/`.catch`. Keep `handleCancel`.

- [ ] **Step 3: Verify (build + behavior preserved)**

Run: `npx tsc --noEmit` → only the pre-existing error.
User behavioral check: on localhost, trigger save → `handleSaveClick` returns the `data` object; spot-check it has `formData` with the expected `TITMMOVRATCCU_*`, `TITMMOV_*`, `TMOVPAGTO_*`, `TCNT_*` keys. Report as needing a user/browser check. (Task C3 makes this rigorous.)

---

## Task C3: Golden-payload guard script

**Files:**
- Create: `scripts/check-payload.mts`
- Create (generated, NOT committed): `scripts/payload-golden.json`

- [ ] **Step 1: Write fixtures + script**

`scripts/check-payload.mts` imports `buildSolicitacaoPayload` and runs it over 3 fixtures, then compares to `payload-golden.json` if present, else writes it. Use exact fixtures:

```ts
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildSolicitacaoPayload, BuildPayloadInput } from "../src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts";

const here = dirname(fileURLToPath(import.meta.url));
const goldenPath = join(here, "payload-golden.json");

const baseContrato = {
  TMOV_T_CODCOLIGADA: "1", TMOV_T_CODFILIAL: "1", TMOV_T_CGCCOL: "08.666.306/0001-93",
  TMOV_T_CGCFIL: "08.666.306/0001-93", TMOV_T_CODCCUSTO: "3.04.02", DESCRICAO_CODCCUSTO: "TI - Sistemas",
  TMOV_T_CODCFO: "0297439", TMOV_T_CODCOLCFO: "0", TMOV_T_CGCCFO: "03.746.938/0015-49",
  DESCRICAO_CODCFO: "BRS SP", TMOV_T_CODTBORCAMENTO: "35.01.04", TMOV_T_TBORCAMENTO: "Softwares Recorrente",
  TF_T_CODCONTRATO: "CNT-01983", TF_T_CONTRATO: "Internet", IDFLUIG: "347511",
  DESCRICAO_CODCOLIGADA: "PHYSICS", DESCRICAO_CODFILIAL: "PHYSICS 1",
  TOL_VALORFIL: "1000.00", TOL_PERCFIL: "10.00", TOL_VALORGLB: "5000.00", TOL_PERCGLB: "15.00",
  TOL_VALORGERAL: "12000.00", TOL_PERCGERAL: "20.00",
  TF_T_VALOR_01: "1000.00", TF_T_VALOR_09: "1000.00",
};
const baseSolic = { TCNT_T_MONTH: "2023-09", TMOV_T_CHAVEACESSONFE: "" } as any;
const dataFornecedor = { OPTANTEPELOSIMPLES: "Optante", PORTE: "Normal" };

const fixtures: { name: string; input: BuildPayloadInput }[] = [
  {
    name: "1item-1rateio",
    input: {
      contrato: baseContrato, solicitacaoPagamento: baseSolic, dataFornecedor, valorEsperadoMes: "1000.00",
      listItems: [{ TITMMOV_T_SEQF: "1", TITMMOV_T_QUANTIDADE: "1", TITMMOV_T_PRECOUNITARIO: "1000.00", TITMMOV_T_VALORTOTALITEM: "1000.00" } as any],
      listRateios: [{ CODCCUSTO: "3.04.02", NOME: "TI - Sistemas", PERCENTUAL: "100.00" }],
      listPagto: [{ TMOVPAGTO_T_DATAVENCIMENTO: "2023-10-06", TMOVPAGTO_T_VALOR: "1000.00" } as any],
    },
  },
  {
    name: "2items-2rateios",
    input: {
      contrato: baseContrato, solicitacaoPagamento: baseSolic, dataFornecedor, valorEsperadoMes: "1000.00",
      listItems: [
        { TITMMOV_T_SEQF: "1", TITMMOV_T_QUANTIDADE: "2", TITMMOV_T_PRECOUNITARIO: "300.00", TITMMOV_T_VALORTOTALITEM: "600.00" } as any,
        { TITMMOV_T_SEQF: "2", TITMMOV_T_QUANTIDADE: "1", TITMMOV_T_PRECOUNITARIO: "400.00", TITMMOV_T_VALORTOTALITEM: "400.00" } as any,
      ],
      listRateios: [
        { CODCCUSTO: "3.04.02", NOME: "TI", PERCENTUAL: "70.00" },
        { CODCCUSTO: "3.01.01", NOME: "Adm", PERCENTUAL: "30.00" },
      ],
      listPagto: [{ TMOVPAGTO_T_DATAVENCIMENTO: "2023-10-06", TMOVPAGTO_T_VALOR: "1000.00" } as any],
    },
  },
  {
    name: "rounding-edge",
    input: {
      contrato: baseContrato, solicitacaoPagamento: baseSolic, dataFornecedor, valorEsperadoMes: "1000.00",
      listItems: [{ TITMMOV_T_SEQF: "1", TITMMOV_T_QUANTIDADE: "1", TITMMOV_T_PRECOUNITARIO: "100.00", TITMMOV_T_VALORTOTALITEM: "100.00" } as any],
      listRateios: [
        { CODCCUSTO: "a", NOME: "A", PERCENTUAL: "33.33" },
        { CODCCUSTO: "b", NOME: "B", PERCENTUAL: "33.33" },
        { CODCCUSTO: "c", NOME: "C", PERCENTUAL: "33.34" },
      ],
      listPagto: [{ TMOVPAGTO_T_DATAVENCIMENTO: "2023-10-06", TMOVPAGTO_T_VALOR: "100.00" } as any],
    },
  },
];

const actual = fixtures.map((f) => ({ name: f.name, formData: buildSolicitacaoPayload(f.input).formData }));

if (!existsSync(goldenPath)) {
  writeFileSync(goldenPath, JSON.stringify(actual, null, 2));
  console.log("WROTE GOLDEN:", goldenPath);
  process.exit(0);
}
const golden = JSON.parse(readFileSync(goldenPath, "utf8"));
const same = JSON.stringify(golden) === JSON.stringify(actual);
console.log(same ? "PAYLOAD OK: identical to golden" : "PAYLOAD MISMATCH vs golden");
if (!same) {
  for (let i = 0; i < actual.length; i++) {
    if (JSON.stringify(golden[i]) !== JSON.stringify(actual[i])) console.log("  differs:", actual[i].name);
  }
  process.exit(1);
}
```

- [ ] **Step 2: Generate the golden from the VERBATIM-extracted builder (pre-rewrite)**

Run: `npx tsx scripts/check-payload.mts` (tsx is not a dependency; use `npx tsx` which fetches it, or run via `node --experimental-strip-types` on Node ≥22 — try `npx tsx` first).
Expected: `WROTE GOLDEN: .../payload-golden.json`. This captures the CURRENT (pre-rewrite) output. Do NOT commit anything.
If the fixtures throw (e.g., a field the builder reads isn't in a fixture), add the missing field to the fixture with a realistic value and re-run until it writes the golden.

- [ ] **Step 3: Run again to confirm the guard passes against itself**

Run: `npx tsx scripts/check-payload.mts`
Expected: `PAYLOAD OK: identical to golden`.

---

## Task C4: Rewrite the builder for clarity (guarded)

**Files:**
- Modify: `src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts`

- [ ] **Step 1: Decompose into helpers**

Refactor the single function into named helpers within the file: `buildItemFields(listItems, contrato)`, `buildRateioFields(listItems, listRateios, contrato)`, `buildPagtoFields(listPagto, contrato)`, `applyRoundingFix(...)`, and a top-level `buildSolicitacaoPayload` that composes them plus the `novasolicitacao` object. Improve names and structure; the GOAL is identical output, so preserve every field key, the rateio distribution math, and the last-line rounding adjustment exactly.

- [ ] **Step 2: Run the guard — must be identical**

Run: `npx tsx scripts/check-payload.mts`
Expected: `PAYLOAD OK: identical to golden`. If `PAYLOAD MISMATCH`, the rewrite changed behavior — inspect the named-differing fixture, fix the rewrite until identical. Do NOT regenerate the golden (that would hide the regression).

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit` → only the pre-existing error; `buildSolicitacaoPayload.ts` absent from lint output.

---

## Task C5: De-noise useSolicitacaoPagamento

**Files:**
- Modify: `src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts`

- [ ] **Step 1: Remove dead commented blocks and debug logs**

Delete the large commented-out blocks (the commented `verifyValueMonthly`, the commented alternative rateio loops ~lines 315-382, the commented `getVersionProcess` variant) and the debug `console.log`/`console.group`/`console.groupEnd` calls in this file. KEEP: `console.error`/`console.log` inside `.catch` error handlers that aid real debugging only if they report errors; prefer `console.error` for those. Do NOT remove any functional code — only comments and debug logging.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → only the pre-existing error.
Run: `npx tsx scripts/check-payload.mts` → still `PAYLOAD OK` (this file's changes don't touch the builder, but confirm).
User behavioral check: save flow on localhost still returns the payload. Report as needing a user/browser check.

---

## Final verification (whole phase)

- [ ] `npx tsc --noEmit` → only `useSaveContrato.ts(8,1)` pre-existing error.
- [ ] `npm run lint` → no NEW files among the problems vs the Phase-1 baseline (17 pre-existing).
- [ ] `npx tsx scripts/check-payload.mts` → `PAYLOAD OK: identical to golden`.
- [ ] `npx vite build --outDir dist-verify --emptyOutDir` succeeds; then delete `dist-verify`.
- [ ] All changes left UNCOMMITTED in the working tree for the user.
- [ ] User performs the browser checks listed per task (Rateio bugs, provider modal/tabs, save flow).

---

## Self-Review

**Spec coverage:**
- Area B refactor + Bug A + Bug B + dead props + dead files → B1-B6. ✓
- Area A duplicate Natureza + double Solicitação providers + composer → A1-A3. ✓
- Area C render-setState fix + pure builder + golden guard + rewrite + de-noise → C1-C5. ✓
- No commits → stated in execution rules; no commit steps present. ✓
- Verify per area in dev app + payload script → per-task verify steps + final. ✓

**Placeholder scan:** Bug fixes and new glue code shown in full. Relocated code uses explicit "move verbatim" instructions (precise, not vague) because re-pasting 430 unchanged lines invites transcription errors; the golden script enforces equivalence for Area C, and tsc/app checks for Area B.

**Type consistency:** `ICentroCustoSQL` reused (B6 re-exports it from the hook; `ControleRateioForm` imports from the hook). `useControleRateio` return shape (B6) matches the props `ControleRateioForm` consumes. `BuildPayloadInput`/`BuildPayloadResult` (C2) reused by the script (C3) and rewrite (C4). `buildSolicitacaoPayload` name consistent across C2/C3/C4/C5.

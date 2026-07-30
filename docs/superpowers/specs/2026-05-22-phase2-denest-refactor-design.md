# Phase 2 — De-nest, Clean Code & Bug Fixes — Design

**Date:** 2026-05-22
**Status:** Approved (design)
**Depends on:** Phase 1 (`2026-05-22-fluig-dataset-mocks-design.md`) — local mocks let us verify each area in the running dev app.

## Problem

The codebase works but is hard to follow in three places:

1. **Rateio monolith** — `ControleRateioForm.tsx` (function literally named `ControleRateioMonolitico`, ~470 lines) tangles state, six effects, duplicated row-reset logic, inline modal handlers. It carries two user-visible bugs.
2. **Provider nesting** — `NaturezaOrcamentariaProvider` is mounted twice (App.tsx + re-wrapped inside `ContratoProvider`); `SolicitacaoPagamentoProvider` is mounted twice (once in `ContratosComponent`, again inside `SolicitacaoPagamentoModal` for the form tab), splitting state across two instances.
3. **Overloaded hook** — `useSolicitacaoPagamento.ts` (~621 lines) has a render-phase `setState`, three effects, and a ~430-line `handleSaveClick` that builds the Fluig payment payload, all buried under dead commented code and `console.log`s.

## Goal

Make these three areas understandable and fix the known bugs, **without changing behavior except the named fixes**. Each area is verified in the running dev app (mocks on) before the next begins. The payment-payload rewrite is guarded by a golden-output script.

## Non-goals

- No repo-wide formatting/lint sweep. Pre-existing lint debt and the `useSaveContrato.ts` build blocker stay (owner: user).
- No test framework. The only automated check is one on-demand Node script for the payload.
- No behavior changes outside the two named bugs and the render-phase `setState` correctness fix.

## Guiding rule

Behavior is preserved by default. `console.log` debug noise and large commented-out dead blocks are removed **only in files being refactored**, not elsewhere. `console.error`/`console.warn` for real error paths stay.

---

## Area B — Rateio refactor + Bug A + Bug B (do first)

**Why first:** self-contained, highest user value (fixes both reported bugs), and exercises the clean pattern the other areas follow.

### Refactor
- Extract **`useControleRateio()`** (new file under `src/components/Rateio/` or `Contratos/EditForm/`) owning: `rateios` state, `adicionarRateio` / `removerRateio` / `atualizarRateio` / `limparRateio`, the percent/value sync, `isBlock`, modal-open state, and the centro-custo + natureza-orçamentária searches.
- `ControleRateioForm` becomes render-only: maps `LinhaRateio`, renders the +/− buttons and the two modals, consuming the hook.
- `LinhaRateio` (`CentroCustoRateioForm.tsx`): remove dead props from the interface and stop passing them — confirmed-unused: `onBuscar`, `onLimpar`, `currentEditingIndex`, `onBlur`. (Verify against the component body before removing; remove only those the body never reads.)
- Identify and delete confirmed-dead Rateio files only after `grep` shows zero imports: candidates are `Rateio/test.tsx`, and the legacy default-export `CentroCustoRateioForm` / `CentroCustoRateioItem` if orphaned. If anything is still imported, leave it and note it.

### Bug A — clearing a value auto-refills the default
**Cause:** (1) `LinhaRateio` has a `useEffect` that writes `VALOR = valorTotalContrato` whenever `valor` is falsy — so clearing refills it; (2) the `rateios.length <= 1` effect re-forces row 0's `VALOR` to `valorTotal` on dependency changes.
**Fix:** delete the `LinhaRateio` refill effect. In `useControleRateio`, row-0 sync writes the *identity* fields from `contrato` (CODCCUSTO, NOME, CODTBORCAMENTO, DESCRICAO_NAT) but seeds `VALOR`/`PERCENTUAL` from `valorTotal` **only when the row is first created / on initial load**, never re-applying after the user has edited or cleared it. Result: an emptied value stays empty.

### Bug B — adding then removing a line disables the "+" button
**Cause:** the `isBlock` effect early-returns when `rateios.length <= 1` and never resets `isBlock`, so after add (sum hits 100% → `isBlock=true`) then remove (back to 1 line → early return), `isBlock` stays `true` and `disabled={isBlock}` keeps `+` disabled.
**Fix:** when `rateios.length <= 1`, set `isBlock=false` (don't early-return); remove `isBlock` from the effect's dependency array.

**Verify (dev app):** open a contract → clear a rateio value (stays empty), add a line then remove it (`+` re-enables), edit values (percentages still recompute), confirm rateio still flows into the save payload.

---

## Area A — Provider de-nesting

### Changes
- Remove the `NaturezaOrcamentariaProvider` wrap inside `ContratoProvider` (`ContratosContext.tsx`). Mount the app-wide providers (`ContratoProvider`, `NaturezaOrcamentariaProvider`) **once** in `App.tsx`, via a small `AppProviders` composer component that nests an ordered list (kills the JSX pyramid).
- Fix the double-mounted `SolicitacaoPagamentoProvider`: mount it once at the medição-modal boundary (`ContratosComponent`), and remove the inner `<SolicitacaoPagamentoProvider>` wrapping the form tab in `SolicitacaoPagamentoModal.tsx` so the whole modal shares one state instance.
- Feature pickers (`FornecedorProvider`, `DestinatarioProvider`, `CentroCustoProvider`, `NotasProvider`) remain mounted at their feature boundaries, each exactly once.

### Risk / fallback
The `SolicitacaoPagamentoProvider` consolidation assumes the double-mount is a bug, not intentional isolation. If merging the state visibly breaks a tab in the dev app, revert that single change and keep the rest of Area A.

**Verify (dev app):** grid renders; open edit + medição modals; the Notas and Solicitação tabs operate on shared state; all pickers open and select.

---

## Area C — Hook decomposition + payload rewrite (last, riskiest)

### Changes
- Fix the render-phase `setState` in `useSolicitacaoPagamento` (the `if (listRateio.length > 0) setListRateios(listRateio)` executed during render) — move into a `useEffect` keyed on `listRateio`.
- Extract a **pure** module `src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts` exporting `buildSolicitacaoPayload(input): { formData, formFields }` (no React, no network, no `window`), decomposed into helpers: `buildItemFields`, `buildRateioFields`, `buildPagtoFields`, `applyRoundingFix`. The input is a plain object (listItems, listRateios, listPagto, contrato, solicitacaoPagamento, dataFornecedor, uploadedFile, processVersion, explodedBudget, user codes).
- `handleSaveClick` in the hook becomes: gather inputs → `buildSolicitacaoPayload(...)` → on localhost return the payload, else `axios.post(... )` + attach/redirect. Version fetch and `window.WCMAPI` reads stay in the hook and are passed into the builder as plain values.
- Remove the dead commented blocks and `console.log`s in this file.

### Guard — golden payload script
1. First extract the **current** logic verbatim into `buildSolicitacaoPayload` (pure move, no logic change).
2. Add `scripts/check-payload.mts` with representative fixtures (cases: 1 item × 1 rateio; multiple items × multiple rateio lines; a rounding-edge case). It calls the builder and writes/compares JSON.
3. Generate `scripts/payload-golden.json` from step 1's output and commit it.
4. Rewrite the builder for clarity (decompose helpers, simplify rounding).
5. `node scripts/check-payload.mts` must report identical output vs golden. Any diff = regression; fix until identical.

### Honest limitation
The script proves the payload is unchanged **only for the fixtures written**. Coverage depends on those fixtures resembling real inputs (item × rateio combinations and the rounding edges). Real confidence still requires a live homolog submission.

**Verify:** `node scripts/check-payload.mts` → identical to golden; localhost save returns a well-formed payload object.

---

## Execution order

1. **Area B** (Rateio + bugs) — medium risk, high value.
2. **Area A** (providers) — medium risk.
3. **Area C** (hooks + payload) — high risk, guarded.

Each area is committed and verified in the running dev app before the next starts. Areas are independent enough that a problem in one doesn't block reverting just that area.

## Files (anticipated)

```text
# Area B
src/components/.../useControleRateio.ts            CREATE  state + logic hook
src/components/Contratos/EditForm/ControleRateioForm.tsx  MODIFY  render-only
src/components/Rateio/CentroCustoRateioForm.tsx    MODIFY  LinhaRateio: drop dead props, remove refill effect
src/components/Rateio/test.tsx                      DELETE? if unused (grep-confirmed)
src/components/Rateio/CentroCustoRateioItem.tsx     DELETE? if unused (grep-confirmed)

# Area A
src/App.tsx                                         MODIFY  AppProviders composer
src/AppProviders.tsx                                CREATE  ordered provider composition
src/components/Contratos/ContratosContext.tsx       MODIFY  drop internal NaturezaOrcamentariaProvider
src/components/Contratos/ContratosComponent.tsx     MODIFY  single SolicitacaoPagamentoProvider mount
src/components/SolicitacaoPgto/SolicitacaoPagamentoModal.tsx  MODIFY  remove inner provider

# Area C
src/components/SolicitacaoPgto/buildSolicitacaoPayload.ts    CREATE  pure payload builder
src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts    MODIFY  fix render setState, use builder, de-noise
scripts/check-payload.mts                            CREATE  golden-diff script
scripts/payload-golden.json                          CREATE  committed golden output
```

## Verification summary

- Per-area manual checks in the dev app (listed above).
- `npx tsc --noEmit` adds zero new errors (pre-existing `useSaveContrato.ts` error excluded).
- Refactored files introduce zero new lint problems.
- Area C: `node scripts/check-payload.mts` reports identical-to-golden.

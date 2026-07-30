# Fluig Dataset Mocks — Design

**Date:** 2026-05-22
**Status:** Approved (design)
**Phase:** 1 of 2 (Phase 2 = de-nesting the component/context structure, separate cycle)

## Problem

`wd_contratos` is a React + Vite SPA embedded inside TOTVS Fluig. Every data fetch is a POST to a Fluig dataset endpoint that only exists when the bundle is published inside Fluig. There is no way to run the app locally against representative data, so `npm run dev` shows an empty, error-throwing screen. A developer cannot exercise the Contratos grid or the open-contract flow without a live Fluig server.

The Angular sibling widget (`D:\code\setios\components\widget-angular-fluig`) already solves this with an HTTP interceptor that, in dev, matches dataset calls by `name` and returns mock `{ content: { values } }` payloads with simulated latency. We adapt that pattern to this project's axios-based stack.

## Goal

- `npm run dev` populates the Contratos grid and the open-contract flow (rateio, medições, responsáveis, tolerância) from local mock data, with no Fluig server.
- A single env flag (`VITE_USE_MOCKS`) flips dev between mocks and the real dev cloud.
- Production build never mocks; deploy path and behavior unchanged.
- **Zero changes to existing hooks / call sites.** Rewriting call sites to use a named service layer is Phase 2.

## Non-goals (Phase 1)

- De-nesting providers, splitting hooks, flattening contexts — Phase 2.
- Tests. The repo has none; the running app is the verification.
- Mocking every dataset on day one. Seed the main flow; make adding more trivial.

## Architecture

### Interception point

The app already centralizes HTTP in `src/utils/baseService.ts` (an axios instance with a request interceptor injecting the OAuth header). We attach a **custom axios adapter** to that instance. When dev-with-mocks is active, the adapter:

1. Inspects the outgoing request.
2. If it is a POST to the datasets endpoint, finds the first matching mock rule and resolves with `{ data: { content: { values } }, status: 200, ... }` — the exact shape existing code unwraps (`r.data.content.values`, `Array.isArray ? x : [x]`).
3. Adds a ~300ms delay to simulate network latency.
4. Anything else (or no matching rule) falls through to the real default adapter.

When the flag is off (or in a production build), the adapter is never attached and axios behaves exactly as today.

### Matching rules (the wrinkle)

Because call sites are untouched, mocks match on the **request body**, not on a per-call identifier:

- `dsIntegraFacilRM` calls (built by `src/utils/sqlBody.ts`) → match by the `SENTENCA` constraint value, e.g. `FL.DS.5.0037`.
- `ds_dw_sql` calls (raw SQL in `fields[0]`) → match by a **fingerprint substring** of the SQL, e.g. `FROM ML001134`, `ML001143`, `PROCES_WORKFLOW`.

Registry shape:

```ts
// src/mock/dataset-rules.ts
import { contratosMock } from './data/contratos';
import { rateioMock } from './data/rateio';
// ...

export const DATASET_RULES: MockRule[] = [
  { id: 'contratos',  match: sql('FROM ML001134'),     values: contratosMock },
  { id: 'rateio',     match: sql('ML001143'),           values: rateioMock },
  { id: 'medicoes',   match: sql('ML001090'),           values: medicoesMock },
  { id: 'tolerancia', match: sentenca('FL.DS.5.0037'),  values: toleranciaMock },
  { id: 'responsavel',match: sql('RESP.DOCUMENTID'),    values: responsaveisMock },
];
```

- `sql(substr)` → predicate testing whether `body.fields?.[0]` contains `substr`.
- `sentenca(code)` → predicate testing whether a constraint with `_field === 'SENTENCA'` has `_initialValue === code`.
- First matching rule wins.
- No match while mocks are on → `console.warn('[mock] no rule for', body)` and return empty `values`, so a missing mock is obvious immediately rather than silently breaking.

This is intentionally tolerant of the raw-SQL coupling: substrings are chosen to be stable identifiers (table names, sentence codes) rather than full query text.

### Toggle / config

`src/config.ts` currently hardcodes `environment = 'prod'` (the auto-detection is commented out). Replace with:

- `import.meta.env.DEV` distinguishes dev server from production build.
- `import.meta.env.VITE_USE_MOCKS` (string `'true'`/`'false'`) selects mock vs real cloud **within dev**. Default to mocks-on when the var is unset in dev.
- Effective state: `useMocks = import.meta.env.DEV && VITE_USE_MOCKS !== 'false'`.
- Production build (`import.meta.env.DEV === false`) → mocks always off, real (relative) URLs, `window.WCMAPI.userLogin`, exactly as today.
- When dev runs against the real cloud (`VITE_USE_MOCKS=false`), use the existing dev-branch URLs + OAuth header in `config.ts`.

Ship `.env.example` documenting `VITE_USE_MOCKS`. `.env.local` is gitignored (Vite default) so personal cloud creds stay local.

## Files

All new code isolated under `src/mock/`:

```text
src/mock/dataset-mock.adapter.ts   axios adapter: detect dataset POST, match rule, delay, respond; else passthrough
src/mock/dataset-rules.ts          MockRule[] registry + sql() / sentenca() helpers + MockRule type
src/mock/data/contratos.ts         mock rows for the Contratos grid query
src/mock/data/rateio.ts            mock rows for RateioList
src/mock/data/medicoes.ts          mock rows for MedicoesContrato
src/mock/data/tolerancia.ts        mock MESSAGE/ERRO payload for ToleranciaContrato (RM sentence)
src/mock/data/responsaveis.ts      mock rows for GetResponsavel
```

Touched existing files (minimal):

```text
src/utils/baseService.ts   attach the mock adapter behind the env flag
src/config.ts              replace hardcoded 'prod' with import.meta.env.DEV + VITE_USE_MOCKS
.env.example               new, documents VITE_USE_MOCKS
README.md                  rewritten (see below)
```

## Mock data notes

- Rows mirror the **column aliases the SQL produces**, not raw table columns — e.g. the contratos query aliases `[IDFLUIG] = PWF.NUM_PROCES`, `[STATUSCODE] = PWF.STATUS`, `[STATUSNAME] = CASE ...`, and `REPLACE(...)` on the `TF_T_VALOR_*` fields. Mocks provide the aliased field names the components read (`IContratoData`, `IMedicaoContrato`, etc.).
- `ToleranciaContrato` is special: the component reads `r.data.content.values[0].MESSAGE` and `JSON.parse`s it, then reads `TOL_VALORFIL`, `TOL_PERCFIL`, `TOL_VALORGLB`, etc. The mock must return a `values[0]` with `ERRO: ''` and a `MESSAGE` that is a JSON **string** of an array with those `TOL_*` keys.
- Rateio rows must align IDs with the seeded contrato (`RateioList` filters by `ml34.processNumber = '<IDFLUIG>'`), so the open-contract flow shows linked data.
- Inventing plausible rows (user-approved). Field names traced from the actual SQL in `useContratos.ts`.

## README rewrite (replaces the Bitbucket template)

Sections:

1. **What this is** — React + Vite widget embedded in TOTVS Fluig; not standalone.
2. **Run locally (mocks)** — `npm install`, `npm run dev`; dataset calls served from `src/mock/`. How the grid populates with no server.
3. **Run dev against real Fluig** — `VITE_USE_MOCKS=false` in `.env.local`; uses dev cloud URL + OAuth header in `config.ts`.
4. **Build & deploy to Fluig** — `npm run build`; note that `vite.config.ts` is gitignored and holds the hardcoded `outDir` into the Fluig layout path; `minify: false` is intentional.
5. **Dataset response shape gotcha** — `r.data.content.values` is object-or-array; errors arrive in `values[0].ERRO`, not HTTP status.
6. **Add a new mock** — add a row to `DATASET_RULES` with a `sql()`/`sentenca()` matcher and a data file. One-paragraph recipe.

## Verification

1. `VITE_USE_MOCKS` unset, `npm run dev` → Contratos grid renders seeded rows; opening a contract shows rateio + medições + responsáveis + tolerância from mocks; no network errors in console.
2. A query with no matching rule logs `[mock] no rule for ...`.
3. `VITE_USE_MOCKS=false`, `npm run dev` → requests go to the real dev cloud (adapter not attached).
4. `npm run build` → succeeds; bundle contains no mock adapter on the active path; deploy behavior unchanged.
5. `npm run lint` → passes (`--max-warnings 0`).

## Phase 2 (deferred, noted only)

Once mocks exist and the data layer is exercised locally, de-nest: flatten the double-wrapped providers (`ContratosContext` re-wraps `NaturezaOrcamentariaProvider`), extract SQL out of hooks into a named dataset service (at which point mock keys can become explicit ids instead of SQL fingerprints), and split the overloaded `use*` hooks. Separate spec.

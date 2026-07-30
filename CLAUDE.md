# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

React + TypeScript + Vite SPA ("Gestão de Contratos") that does **not** run standalone — it is built into a JS bundle and embedded as a custom layout/widget inside a **TOTVS Fluig** portal. At runtime it relies on globals injected by the Fluig host page (`window.WCMAPI`, `window.WCMC`) and talks to Fluig + TOTVS RM (ERP) over REST. Domain language is Brazilian Portuguese.

## Commands

```bash
npm run dev      # local Vite dev server
npm run build    # tsc typecheck + vite build into the Fluig layout folder (see Deploy)
npm run patch    # npm version patch + build (version is shown in the UI footer)
npm run lint     # eslint, --max-warnings 0 (warnings fail)
npm run mock     # json-server on :8080 against mock/db.json
```

No test runner is configured — there are no tests. `README.md` is the default Bitbucket template; ignore it.

## Deploy (read before building)

`vite.config.ts` is **gitignored** (each dev has a local copy) and contains a hardcoded `build.outDir` pointing into a Fluig webapp resources path. Multiple `outDir` lines are kept commented; switching DEV/HOMOLOG/PROD target means editing which line is active. `build.minify` is `false` on purpose (debuggable bundle inside Fluig). `base` is derived from the repo folder name and must match the Fluig layout name.

## Fluig / RM integration (the core of this codebase)

`src/config.ts` is the single source of endpoints. It has a `dev`/`prod` branch, but `environment` is **hardcoded to `'prod'`** (auto-detection is commented out). In prod, URLs are relative (same origin as Fluig) and the user comes from `window.WCMAPI.userLogin`; in dev, URLs point at the cloud instance and a hardcoded OAuth header is used.

`src/utils/baseService.ts` exports an axios instance whose request interceptor injects `fluigConfig.header` (OAuth) as `Authorization`. That header is only populated in the dev branch.

### Two ways data is fetched — both POST to the datasets endpoint

1. **`ds_dw_sql`** — raw SQL Server query passed in `fields[0]`, datasource `java:/jdbc/AppDS` in `fields[1]`. Queries hit Fluig form tables (`ML00xxxx`, e.g. `ML001134`), `PROCES_WORKFLOW`, `DOCUMENTO`. Values are string-interpolated directly into SQL (e.g. `WHERE ... = '${item.IDFLUIG}'`).
2. **`dsIntegraFacilRM`** via `src/utils/sqlBody.ts` — calls a named TOTVS RM stored sentence (`codSentenca`, e.g. `FL.DS.5.0037`) with pipe-delimited `parameters` (`CODFILIAL=1|CODCCUSTO=...`). Result/error come back as JSON strings inside the response.

### Response shape (important, repeated everywhere)

Dataset responses arrive as `r.data.content.values`. This is **either a single object or an array** — code normalizes with `Array.isArray(x) ? x : [x]`. Errors are surfaced as `r.data.content.values[0].ERRO` (and sometimes a JSON string in `.MESSAGE`), not via HTTP status — check it explicitly.

### Workflow processes

- Opening a process: navigate to a `pageworkflowview?processID=...` URL (see `config.ts` `abrirSolicitacao*`).
- Submitting a workflow form: POST to `/ecm/api/rest/ecm/workflowView/send` with a large `formData: [{name, value}, ...]` payload using RM field names. `src/Process/ProcessType.ts` holds the full template (`sendInitial` + `sendUrl`).
- Document viewing: `src/utils/viewDocumentFluig.ts` reaches into `window.opener.parent.ECM.documentView` and opens a `WCMC.panel`.
- File upload / attach: `/ecm/upload`, then attach via workflowView endpoints (`src/components/AnexarDocumentos/`).

### RM field-name vocabulary

Field/table prefixes you will see constantly: `TMOV_*` (movimento/header), `TITMMOV_*` (item), `TMOVPAGTO_*` (payment), `TCNT_*` (contrato), `FCFO_*`/`CFO` (fornecedor), `TBORCAMENTO`/`NAT` (natureza orçamentária). Domain terms: **rateio** = cost split across cost centers, **medição** = contract measurement/billing event, **solicitação de pagamento** = payment request, **natureza orçamentária** = budget category.

## Frontend structure & conventions

- **UI**: MUI (`@mui/material`, `@mui/x-data-grid`) + Emotion. Tailwind + PostCSS are also configured. No router.
- **State**: React Context per feature, no Redux/Zustand. Providers are nested in `src/App.tsx`.
- **Feature-folder pattern** under `src/components/<Feature>/`. A feature typically has:
  - `<Feature>Context.tsx` — `createContext` + provider holding `useState` slices.
  - `use<Feature>Context.ts` — consumer hook that throws if used outside its provider.
  - `use<Feature>.ts` — data-fetching / business-logic hook (does the axios calls).
  - `*Form.tsx` / `*ModalSelect.tsx` / `*Component.tsx` — presentation; selector features render as modal pickers.
- **Two primary flows**: `Contratos/` (contract grid, edit, medição) and `SolicitacaoPgto/` (payment-request wizard). The rest (`Fornecedores`, `CentroCusto`, `NaturezaOrcamentaria`, `Destinatarios`, `Responsaveis`, `Notas`) are mostly modal selectors feeding those two. `Global/` holds shared layout/modal/grid wrappers.
- **PDF**: `jspdf`, `pdf-lib`, `pdfjs-dist`, `html2canvas` generate boletos / documents (`utils/dadosBoleto.ts`, `utils/formatChaveNFE.ts`).

## Conventions & sharp edges

- TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters`; eslint runs with `--max-warnings 0`. But Fluig globals and dataset payloads are untyped — files routinely top with `/* eslint-disable @typescript-eslint/no-explicit-any */`. Match that locally rather than fighting the types.
- `window.WCMAPI` / `window.WCMC` are typed `any` in `global.d.ts` — they only exist when running inside Fluig, so dev mode can't exercise those paths.
- SQL is built by string interpolation; keep new queries in the same style but be aware values are not parameterized.
- Match the existing Portuguese naming for variables, files, and domain concepts.

# Fluig Dataset Mocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `npm run dev` run the widget locally with no Fluig server by intercepting dataset POSTs and serving local mock data, toggled by an env flag.

**Architecture:** A custom axios adapter attached to the shared `baseService` instance short-circuits POSTs to the Fluig datasets endpoint, matches the request body against a rule registry, and resolves the exact `{ content: { values } }` shape the app already unwraps. Matching uses unique SQL substrings or the RM `SENTENCA` code. Everything is gated behind `useMocks` (dev + `VITE_USE_MOCKS !== 'false'`); production builds never attach it. Existing hooks/call sites are untouched.

**Tech Stack:** React 18, Vite 4, axios 1.x, TypeScript (strict), MUI.

**Verification note:** This repo has no test runner and the approved spec (`docs/superpowers/specs/2026-05-22-fluig-dataset-mocks-design.md`) explicitly opts out of tests. Verification is `npx tsc --noEmit`, `npm run lint`, `npm run build`, and observing the running dev app. Do NOT add a test framework.

---

## File Structure

```text
src/vite-env.d.ts                  MODIFY  type VITE_USE_MOCKS on import.meta.env
src/config.ts                      MODIFY  env-based environment + export useMocks
.env.example                       CREATE  document VITE_USE_MOCKS
src/mock/dataset-rules.ts          CREATE  MockRule type, sql()/sentenca() helpers, DATASET_RULES registry
src/mock/data/contratos.ts         CREATE  rows for the Contratos grid query
src/mock/data/rateio.ts            CREATE  rows for RateioList
src/mock/data/medicoes.ts          CREATE  rows for MedicoesContrato
src/mock/data/tolerancia.ts        CREATE  values[0] with JSON-string MESSAGE for ToleranciaContrato
src/mock/data/responsaveis.ts      CREATE  rows for GetResponsavel
src/mock/dataset-mock.adapter.ts   CREATE  axios adapter: detect dataset POST, match, delay, respond; else delegate
src/utils/baseService.ts           MODIFY  attach adapter when useMocks is true
README.md                          MODIFY  rewrite for new devs
```

---

## Task 1: Env detection and mock toggle in config

**Files:**
- Modify: `src/vite-env.d.ts`
- Modify: `src/config.ts:30-32` (the `baseUrlProd` / `environment` block)
- Create: `.env.example`

- [ ] **Step 1: Type the custom env var**

Replace the entire contents of `src/vite-env.d.ts` with:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: Replace the hardcoded environment with env-based detection**

In `src/config.ts`, find this block:

```ts
const baseUrlDev = "https://nucleode135229.fluig.cloudtotvs.com.br:2250";
const baseUrlProd = "/api/public/ecm/dataset/datasets";
const environment = 'prod'
  // window.location.href.startsWith("http://localhost") ||
  // !window.location.host.includes("fluig.redeinspiraeducadores.com.br");
```

Replace it with:

```ts
const baseUrlDev = "https://nucleode135229.fluig.cloudtotvs.com.br:2250";
const baseUrlProd = "/api/public/ecm/dataset/datasets";

// Dev = Vite dev server; prod = built bundle published inside Fluig.
const isDev = import.meta.env.DEV;
// In dev, mocks are ON unless VITE_USE_MOCKS=false (then hit the real dev cloud).
export const useMocks = isDev && import.meta.env.VITE_USE_MOCKS !== "false";
const environment = isDev ? "dev" : "prod";
```

Leave the rest of `config.ts` unchanged — the existing `environment.includes("dev")` branch already builds the dev (cloud) config, and the `prod` branch the relative-URL config.

- [ ] **Step 3: Create `.env.example`**

Create `.env.example` with:

```dotenv
# Local development toggle for Fluig dataset mocks.
# Default (unset) in `npm run dev` = mocks ON, no Fluig server needed.
# Set to false to make the dev server hit the real Fluig dev cloud instead.
VITE_USE_MOCKS=true
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors. (`useMocks` is exported but not yet imported — that is fine, it is an export.)

- [ ] **Step 5: Commit**

```bash
git add src/vite-env.d.ts src/config.ts .env.example
git commit -m "feat: env-based dev detection and VITE_USE_MOCKS toggle"
```

---

## Task 2: Mock rule registry skeleton (types + matchers)

**Files:**
- Create: `src/mock/dataset-rules.ts`

- [ ] **Step 1: Create the registry skeleton with matcher helpers**

Create `src/mock/dataset-rules.ts` with:

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock rules matched against the Fluig dataset request BODY (call sites are untouched).
// ds_dw_sql calls carry raw SQL in fields[0]; dsIntegraFacilRM calls carry a SENTENCA constraint.

export type DatasetBody = {
  name?: string;
  fields?: unknown[];
  constraints?: Array<{ _field?: string; _initialValue?: string }>;
};

export type MockRule = {
  id: string;
  match: (body: DatasetBody) => boolean;
  values: Array<Record<string, any>>;
};

// Matches when the raw SQL (fields[0]) contains `substr`.
export const sql =
  (substr: string) =>
  (body: DatasetBody): boolean =>
    typeof body.fields?.[0] === "string" && (body.fields[0] as string).includes(substr);

// Matches a dsIntegraFacilRM call by its SENTENCA constraint value.
export const sentenca =
  (code: string) =>
  (body: DatasetBody): boolean =>
    !!body.constraints?.some((c) => c._field === "SENTENCA" && c._initialValue === code);

export const DATASET_RULES: MockRule[] = [];
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/mock/dataset-rules.ts
git commit -m "feat: add dataset mock rule types and matchers"
```

---

## Task 3: Mock data files

**Files:**
- Create: `src/mock/data/contratos.ts`
- Create: `src/mock/data/rateio.ts`
- Create: `src/mock/data/medicoes.ts`
- Create: `src/mock/data/tolerancia.ts`
- Create: `src/mock/data/responsaveis.ts`

Field names are taken from the actual SQL aliases in `src/components/Contratos/hooks/useContratos.ts` and the types in `src/components/Contratos/ContratosTypes.ts`. The Contratos grid (`ContratosColumn.tsx`) renders `TF_T_CODCONTRATO`, `STATUSNAME`, `IDFLUIG`, `TMOV_T_CODFILIAL`, `DESCRICAO_CODFILIAL`, `TMOV_T_CGCFIL`, `TMOV_T_CODCFO`, `DESCRICAO_CODCFO`, `TMOV_T_CGCCFO`, `TMOV_T_CODCCUSTO`, `DESCRICAO_CODCCUSTO`, `TMOV_T_CODTBORCAMENTO`, `TMOV_T_TBORCAMENTO`, `TF_T_VALORCONTRATO`, `TF_T_DATAINICIO`, `TF_T_DATAFIM`. The grid's row id is the `id` field. `STATUSCODE === "2"` is required for a contract to be eligible for medição.

- [ ] **Step 1: Create `src/mock/data/contratos.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Rows for the getContratos() query (FROM ML001134 ... 'Cadastrando' CASE).
// Mirrors the SQL aliases + fields read by the open-contract handlers.
export const contratosMock: Array<Record<string, any>> = [
  {
    id: "401001",
    ID: "401001",
    documentid: "715014",
    version: "1000",
    IDFLUIG: "347511",
    STATUSCODE: "2",
    STATUSNAME: "Andamento",
    TF_T_CODCONTRATO: "CNT-01983",
    TF_T_CONTRATO: "Fornecimento de Internet",
    TMOV_T_CODCOLIGADA: "1",
    DESCRICAO_CODCOLIGADA: "SISTEMA DE ENSINO PHYSICS",
    TMOV_T_CODFILIAL: "1",
    DESCRICAO_CODFILIAL: "PHYSICS - ALCINDO CACELA 1",
    TMOV_T_CGCFIL: "08.666.306/0001-93",
    TMOV_T_CODCFO: "0297439",
    DESCRICAO_CODCFO: "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
    TMOV_T_CGCCFO: "03.746.938/0015-49",
    TMOV_T_CODCCUSTO: "3.04.02",
    DESCRICAO_CODCCUSTO: "TI - Sistemas",
    TMOV_T_CODTBORCAMENTO: "35.01.04",
    TMOV_T_TBORCAMENTO: "Softwares Recorrente",
    TF_T_VALORCONTRATO: "12000.00",
    TF_T_DATAINICIO: "2023-09-01",
    TF_T_DATAFIM: "2026-12-31",
    TF_T_VALOR_01: "1000.00",
    TF_T_VALOR_02: "1000.00",
    TF_T_VALOR_03: "1000.00",
    TF_T_VALOR_04: "1000.00",
    TF_T_VALOR_05: "1000.00",
    TF_T_VALOR_06: "1000.00",
    TF_T_VALOR_07: "1000.00",
    TF_T_VALOR_08: "1000.00",
    TF_T_VALOR_09: "1000.00",
    TF_T_VALOR_10: "1000.00",
    TF_T_VALOR_11: "1000.00",
    TF_T_VALOR_12: "1000.00",
  },
  {
    id: "401002",
    ID: "401002",
    documentid: "715099",
    version: "1000",
    IDFLUIG: "347777",
    STATUSCODE: "0",
    STATUSNAME: "Cadastrando",
    TF_T_CODCONTRATO: "CNT-02050",
    TF_T_CONTRATO: "Licenciamento de Software RH",
    TMOV_T_CODCOLIGADA: "1",
    DESCRICAO_CODCOLIGADA: "INSPIRA MUDANCA",
    TMOV_T_CODFILIAL: "2",
    DESCRICAO_CODFILIAL: "INSPIRA MUDANCA",
    TMOV_T_CGCFIL: "28.580.065/0001-72",
    TMOV_T_CODCFO: "0086368",
    DESCRICAO_CODCFO: "DataWer LTDA",
    TMOV_T_CGCCFO: "39.489.289/0001-90",
    TMOV_T_CODCCUSTO: "3.04.02",
    DESCRICAO_CODCCUSTO: "TI - Sistemas",
    TMOV_T_CODTBORCAMENTO: "35.01.04",
    TMOV_T_TBORCAMENTO: "Softwares Recorrente",
    TF_T_VALORCONTRATO: "6000.00",
    TF_T_DATAINICIO: "2024-01-01",
    TF_T_DATAFIM: "2026-06-30",
    TF_T_VALOR_01: "500.00",
    TF_T_VALOR_02: "500.00",
    TF_T_VALOR_03: "500.00",
    TF_T_VALOR_04: "500.00",
    TF_T_VALOR_05: "500.00",
    TF_T_VALOR_06: "500.00",
    TF_T_VALOR_07: "500.00",
    TF_T_VALOR_08: "500.00",
    TF_T_VALOR_09: "500.00",
    TF_T_VALOR_10: "500.00",
    TF_T_VALOR_11: "500.00",
    TF_T_VALOR_12: "500.00",
  },
];
```

- [ ] **Step 2: Create `src/mock/data/rateio.ts`**

Aliases from the RateioList SELECT: `NOME`, `CODCCUSTO`, `VALOR`, `PERCENTUAL`, `CODTBORCAMENTO`, `DESCRICAO_NAT`.

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Rows for RateioList() (FROM ML001134 INNER JOIN ML001143). Percentuals sum to 100.
export const rateioMock: Array<Record<string, any>> = [
  {
    NOME: "TI - Sistemas",
    CODCCUSTO: "3.04.02",
    VALOR: "700.00",
    PERCENTUAL: "70.00",
    CODTBORCAMENTO: "35.01.04",
    DESCRICAO_NAT: "Softwares Recorrente",
  },
  {
    NOME: "Administrativo",
    CODCCUSTO: "3.01.01",
    VALOR: "300.00",
    PERCENTUAL: "30.00",
    CODTBORCAMENTO: "35.01.05",
    DESCRICAO_NAT: "Servicos de TI",
  },
];
```

- [ ] **Step 3: Create `src/mock/data/medicoes.ts`**

Subset of the real `MedicaoData` sample (from `MedicaoContrato.ts`) with the identity + display fields. `id`, `IDFLUIG`, `STATUSCODE`, `STATUSNAME` are required for the grid.

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Rows for MedicoesContrato() (FROM ML001090 ... PROCES_WORKFLOW). Linked to contrato IDFLUIG 347511.
export const medicoesMock: Array<Record<string, any>> = [
  {
    id: "715017",
    documentid: "715017",
    ID: "331043",
    version: "1000",
    IDFLUIG: "347513",
    STATUSCODE: "2",
    STATUSNAME: "Finalizado",
    processNumber: "347513",
    TCNT_T_IDCONTRATO: "347392",
    TCNT_T_CODCONTRATO: "CNT-01983",
    TCNT_T_CONTRATO: "Fornecimento de Internet",
    TCNT_T_MONTH: "2023-09",
    TMOV_T_NUMEROMOV: "345324345",
    TMOV_T_VALORLIQUIDO: "1.000,00",
    TMOV_T_VALORBRUTO: "1.000,00",
    TMOV_T_DATAEMISSAO: "2023-09-19",
    DESCRICAO_CODCFO: "JAQUELINE FERREIRA FERNANDES",
    TMOV_T_CGCCFO: "991.645.825-15",
    DESCRICAO_CODCCUSTO: "TI - Sistemas",
    HIST_COMPL: "teste de inclusao com anexo.",
  },
  {
    id: "715014",
    documentid: "715014",
    ID: "331042",
    version: "1000",
    IDFLUIG: "347511",
    STATUSCODE: "0",
    STATUSNAME: "Aberto",
    processNumber: "347511",
    TCNT_T_IDCONTRATO: "347392",
    TCNT_T_CODCONTRATO: "CNT-01983",
    TCNT_T_CONTRATO: "Fornecimento de Internet",
    TCNT_T_MONTH: "2023-09",
    TMOV_T_NUMEROMOV: "65845",
    TMOV_T_VALORLIQUIDO: "100.00",
    TMOV_T_VALORBRUTO: "100.00",
    TMOV_T_DATAEMISSAO: "2023-08-21",
    DESCRICAO_CODCFO: "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
    TMOV_T_CGCCFO: "03.746.938/0015-49",
    DESCRICAO_CODCCUSTO: "TI - Sistemas",
    HIST_COMPL: "teste de inclusao via tela",
  },
];
```

- [ ] **Step 4: Create `src/mock/data/tolerancia.ts`**

`ToleranciaContrato` reads `values[0].ERRO`, then `JSON.parse(values[0].MESSAGE)` and reads `TOL_*` keys. So `MESSAGE` must be a JSON **string** of an array.

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// values[0] for ToleranciaContrato() (RM sentenca FL.DS.5.0037).
// MESSAGE is a JSON STRING (the component JSON.parses it).
export const toleranciaMock: Array<Record<string, any>> = [
  {
    ERRO: "",
    MESSAGE: JSON.stringify([
      {
        TOL_VALORFIL: "1000.00",
        TOL_PERCFIL: "10.00",
        TOL_VALORGLB: "5000.00",
        TOL_PERCGLB: "15.00",
        TOL_VALORGERAL: "12000.00",
        TOL_PERCGERAL: "20.00",
      },
    ]),
  },
];
```

- [ ] **Step 5: Create `src/mock/data/responsaveis.ts`**

Shape from `IContratoRespData`. `GetResponsavel` reads `values[0].ERRO` (must be falsy).

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Rows for GetResponsavel() (FROM ML001135 RESP ... RESP.DOCUMENTID).
export const responsaveisMock: Array<Record<string, any>> = [
  {
    TRESP_T_CODFUNCAO: "1",
    TRESP_T_CODPAPEL: "admin",
    TRESP_T_FUNCAO: "Administradores",
    TRESP_T_PAPEL: "Administrador",
    TRESP_T_SEQF: "1",
  },
];
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/mock/data
git commit -m "feat: add mock dataset rows for contratos flow"
```

---

## Task 4: Populate the rule registry

**Files:**
- Modify: `src/mock/dataset-rules.ts` (the `DATASET_RULES` array and imports)

- [ ] **Step 1: Wire data into DATASET_RULES**

In `src/mock/dataset-rules.ts`, add these imports at the top (after the leading comment block, before `export type DatasetBody`):

```ts
import { contratosMock } from "./data/contratos";
import { rateioMock } from "./data/rateio";
import { medicoesMock } from "./data/medicoes";
import { toleranciaMock } from "./data/tolerancia";
import { responsaveisMock } from "./data/responsaveis";
```

Then replace the empty registry line:

```ts
export const DATASET_RULES: MockRule[] = [];
```

with:

```ts
export const DATASET_RULES: MockRule[] = [
  // RM stored sentence (dsIntegraFacilRM).
  { id: "tolerancia", match: sentenca("FL.DS.5.0037"), values: toleranciaMock },
  // ds_dw_sql — keyed on substrings unique to each query.
  { id: "contratos", match: sql("'Cadastrando'"), values: contratosMock },
  { id: "rateio", match: sql("ML001143"), values: rateioMock },
  { id: "medicoes", match: sql("ML001090"), values: medicoesMock },
  { id: "responsaveis", match: sql("RESP.DOCUMENTID"), values: responsaveisMock },
];
```

Note: `'Cadastrando'` (with the single quotes) appears only in the contratos `STATUSNAME` CASE and not in the rateio query, which also references `ML001134` — this is why contratos is keyed on `'Cadastrando'` rather than the table name.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/mock/dataset-rules.ts
git commit -m "feat: register dataset mock rules"
```

---

## Task 5: The axios mock adapter

**Files:**
- Create: `src/mock/dataset-mock.adapter.ts`

- [ ] **Step 1: Create the adapter**

Create `src/mock/dataset-mock.adapter.ts` with:

```ts
import axios, { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { DATASET_RULES, DatasetBody } from "./dataset-rules";

// The real adapter axios would have used; we delegate to it for non-dataset calls.
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const isDatasetCall = (config: InternalAxiosRequestConfig): boolean =>
  (config.method ?? "").toLowerCase() === "post" &&
  (config.url ?? "").includes("/ecm/dataset/datasets");

const parseBody = (data: unknown): DatasetBody => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as DatasetBody;
    } catch {
      return {};
    }
  }
  return (data ?? {}) as DatasetBody;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const datasetMockAdapter: AxiosAdapter = async (config) => {
  if (!isDatasetCall(config)) {
    return defaultAdapter(config);
  }

  const body = parseBody(config.data);
  const rule = DATASET_RULES.find((r) => r.match(body));

  if (!rule) {
    // eslint-disable-next-line no-console
    console.warn("[mock] no rule matched dataset call:", body);
  }

  await delay(300);

  const response: AxiosResponse = {
    data: { content: { values: rule?.values ?? [] } },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
  return response;
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors. (If `axios.getAdapter` is flagged, confirm axios is v1.x in `package.json` — it is `^1.4.0`, which has `getAdapter`.)

- [ ] **Step 3: Commit**

```bash
git add src/mock/dataset-mock.adapter.ts
git commit -m "feat: add axios dataset mock adapter"
```

---

## Task 6: Wire the adapter into baseService

**Files:**
- Modify: `src/utils/baseService.ts`

- [ ] **Step 1: Attach the adapter behind the flag**

Replace the entire contents of `src/utils/baseService.ts` with:

```ts
import axios from "axios";
import fluigConfig, { useMocks } from "../config";
import { datasetMockAdapter } from "../mock/dataset-mock.adapter";

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = fluigConfig.header;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

if (useMocks) {
  axios.defaults.adapter = datasetMockAdapter;
  // eslint-disable-next-line no-console
  console.info("[mock] Fluig dataset mocks ON (VITE_USE_MOCKS!=false). Set VITE_USE_MOCKS=false to hit the real cloud.");
}

export default axios;
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit 0.

- [ ] **Step 3: Run the dev app with mocks (default)**

Run: `npm run dev`
Then open the printed local URL (e.g. `http://localhost:5173/`).
Expected:
- Console shows `[mock] Fluig dataset mocks ON ...`.
- The Contratos grid renders two rows (`CNT-01983` and `CNT-02050`).
- Click the `CNT-01983` row (STATUSCODE `2`): no error modal appears; the rateio list, medições, responsáveis, and tolerância are populated from mocks (inspect via the open/edit/medição UI).
- No uncaught network errors in the console.

Stop the dev server (Ctrl+C) when confirmed.

- [ ] **Step 4: Confirm the real-cloud escape hatch still works**

Run: `VITE_USE_MOCKS=false npm run dev` (PowerShell: `$env:VITE_USE_MOCKS='false'; npm run dev`)
Expected: console does NOT show the `[mock] ... ON` line; requests go to the network (they will fail without VPN/cloud access — that is expected, it proves the adapter is not attached).
Stop the server. Unset the variable if you set it in PowerShell: `Remove-Item Env:VITE_USE_MOCKS`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/baseService.ts
git commit -m "feat: enable dataset mock adapter in dev"
```

---

## Task 7: Rewrite the README

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1: Replace README.md**

Replace the entire contents of `README.md` with:

```markdown
# wd_contratos — Gestão de Contratos (Fluig Widget)

React + TypeScript + Vite app embedded as a custom layout inside **TOTVS Fluig**.
It is **not** a standalone site: in production the built bundle is published into a
Fluig layout and relies on globals the Fluig page injects (`window.WCMAPI`, `window.WCMC`).
All data comes from Fluig dataset / TOTVS RM calls.

## Run locally (with mocks) — no Fluig server needed

```bash
npm install
npm run dev
```

Open the printed URL (e.g. http://localhost:5173/). In dev, calls to the Fluig
datasets endpoint are intercepted by a local axios adapter
(`src/mock/dataset-mock.adapter.ts`) and answered from `src/mock/data/*`.
The Contratos grid and the open-contract flow (rateio, medições, responsáveis,
tolerância) populate from mock data. Console shows `[mock] ... ON`.

## Run dev against the real Fluig cloud

Set the flag (copy `.env.example` to `.env.local`):

```dotenv
VITE_USE_MOCKS=false
```

Then `npm run dev` hits the dev cloud instance configured in `src/config.ts`
(uses the OAuth header in the dev branch). Requires network access to that instance.

## Build & deploy to Fluig

```bash
npm run build      # tsc + vite build
npm run patch      # bump patch version (shown in the UI footer) + build
```

`vite.config.ts` is **gitignored** and holds a hardcoded `build.outDir` pointing
into the Fluig layout's `resources/js` path — each developer keeps their own.
Switching DEV/HOMOLOG/PROD target means editing which `outDir` line is active.
`build.minify` is `false` on purpose (debuggable bundle inside Fluig). After build,
the bundle still has to be packaged/republished in Fluig.

## How data fetching works (and a gotcha)

Two patterns, both POST to `/api/public/ecm/dataset/datasets`:

1. `ds_dw_sql` — raw SQL Server query in `fields[0]`, datasource in `fields[1]`.
2. `dsIntegraFacilRM` (via `src/utils/sqlBody.ts`) — a named TOTVS RM stored
   sentence (`codSentenca`) with pipe-delimited parameters.

**Gotcha:** responses arrive as `r.data.content.values`, which is **either a single
object or an array** — code normalizes with `Array.isArray(x) ? x : [x]`. Errors come
back as `values[0].ERRO` (and sometimes a JSON string in `.MESSAGE`), NOT as an HTTP
status. Check `ERRO` explicitly.

## Add a new mock

When a query returns nothing in dev, the console logs `[mock] no rule matched ...`.
To add coverage:

1. Add a data file under `src/mock/data/` exporting an array of rows whose keys match
   the SQL **aliases** the component reads (not raw table columns).
2. Register it in `src/mock/dataset-rules.ts` `DATASET_RULES` with a matcher:
   - `sql("UNIQUE_SUBSTRING")` — a substring that appears only in that query
     (a table name like `ML001090`, or a distinctive literal).
   - `sentenca("FL.DS.X.XXXX")` — for `dsIntegraFacilRM` calls, by sentence code.
   First matching rule wins, so keep substrings unique across queries.

## Stack

React 18, Vite 4, MUI + `@mui/x-data-grid`, Emotion, Tailwind, axios. No router, no
test runner. State is React Context per feature under `src/components/<Feature>/`.
```

- [ ] **Step 2: Sanity-check the markdown renders**

Run: `npx tsc --noEmit` (confirms nothing else broke; README is not compiled but this is a cheap gate)
Expected: exits 0. Visually skim `README.md` for fenced-block correctness.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for local mocks and Fluig deploy"
```

---

## Task 8: Final build verification

**Files:** none (verification only)

- [ ] **Step 1: Full build + lint**

Run: `npm run build && npm run lint`
Expected: build completes (writes the bundle to the `outDir` in `vite.config.ts`); lint exits 0 with no warnings (`--max-warnings 0`).

- [ ] **Step 2: Confirm mocks are not on the production path**

Reason about it: `useMocks = import.meta.env.DEV && ...`. In `npm run build`, `import.meta.env.DEV` is `false`, so Vite tree-shakes the `if (useMocks)` block and the adapter import has no runtime effect. No action needed unless the build emitted warnings about the mock files — there should be none.

---

## Self-Review

**Spec coverage:**
- Interception via axios adapter on baseService → Task 5 + Task 6. ✓
- Body matching by SQL substring / SENTENCA → Task 2 (helpers) + Task 4 (rules). ✓
- No-match warns + empty values → Task 5 adapter. ✓
- Env toggle (`VITE_USE_MOCKS`, dev default on, prod never) + config cleanup → Task 1. ✓
- `.env.example` → Task 1. ✓
- Files under `src/mock/` → Tasks 2–5. ✓
- Initial coverage: getContratos, RateioList, MedicoesContrato, ToleranciaContrato, GetResponsavel → Task 3 + Task 4. ✓
- README rewrite (6 sections from spec) → Task 7. ✓
- Verification scenarios (mocks on, no-match, mocks off, build) → Tasks 6 + 8. ✓
- No tests → respected (verification note + app/lint/build only). ✓

**Placeholder scan:** No TBD/TODO; every step has concrete code or an exact command + expected result.

**Type/name consistency:** `MockRule`, `DatasetBody`, `sql`, `sentenca`, `DATASET_RULES` defined in Task 2, imported unchanged in Tasks 4–5. `useMocks` exported in Task 1, imported in Task 6. `datasetMockAdapter` defined in Task 5, imported in Task 6. Mock export names (`contratosMock`, `rateioMock`, `medicoesMock`, `toleranciaMock`, `responsaveisMock`) defined in Task 3, imported in Task 4. All consistent.
```

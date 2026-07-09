# AGENTS.md — wd_contratos

> Instruções para agentes de código trabalhando neste projeto.
> Leia antes de qualquer modificação.

---

## 1. O que é este projeto

Widget **React + TypeScript + Vite** que roda **embarcado no TOTVS Fluig**. Não é um site standalone — em produção o bundle é publicado dentro de um layout do Fluig.

- Depende de globais injetadas pela página do Fluig: `window.WCMAPI` e `window.WCMC`
- Dados vêm de **datasets do Fluig** e **sentenças do TOTVS RM** (ERP)
- Domínio: financeiro/contratos
- Nomenclatura segue os campos do RM: `TMOV_T_*`, `TITMMOV_T_*`, `TCNT_*`, etc.

---

## 2. Stack e ferramentas

- React 18, Vite 4, MUI + `@mui/x-data-grid`, Emotion, Tailwind, axios
- PDFs: jsPDF, pdf-lib, pdfjs-dist, html2canvas
- Sem router. Sem framework de testes. Estado é Context do React por feature.

---

## 3. Como rodar

```bash
npm install
npm run dev        # modo dev com mocks (padrão)
npm run build      # tsc + vite build
npm run lint       # eslint --max-warnings 0
npm run patch      # incrementa versão + build
```

Para bater no Fluig real, crie `.env.local` com `VITE_USE_MOCKS=false`.

`vite.config.ts` está no `.gitignore` e contém `build.outDir` fixo apontando para o layout do Fluig de cada dev.

---

## 4. Estrutura de pastas

```text
src/
├── main.tsx / App.tsx / AppProviders.tsx    bootstrap + providers globais
├── config.ts                                endpoints, ambiente, flag de mocks
├── global.d.ts / vite-env.d.ts              tipagens de window.WCMAPI e import.meta.env
├── components/<Feature>/                    uma pasta por feature (ver padrão abaixo)
├── mock/                                    camada de mocks dos datasets (dev only)
├── utils/                                   baseService (axios), sqlBody, formatadores
└── Process/                                 template do payload de workflow do Fluig
```

---

## 5. Padrão de feature (obrigatório)

Toda feature em `components/<Feature>/` segue o padrão de 4 peças:

| Arquivo | Papel |
|---|---|
| `<Feature>Context.tsx` | `createContext` + `Provider` com os `useState` (estado da feature) |
| `use<Feature>Context.ts` | Hook consumidor. Faz `useContext` e **lança erro** se usado fora do Provider |
| `use<Feature>.ts` | Hook de **lógica/negócio**: chamadas axios, transformação de dados, handlers |
| `*Form.tsx` / `*Modal.tsx` / `*Component.tsx` | **Apresentação** (UI). Consome os hooks acima |

**Regra de ouro:** componente cuida de **render**; hook cuida de **estado e lógica**.

Providers globais ficam em `AppProviders.tsx`. Providers de escopo local ficam na fronteira da feature, **montados uma vez só**. Nunca monte o mesmo Provider em dois lugares na mesma árvore.

---

## 6. Acesso a dados

Tudo passa por `POST` para `/api/public/ecm/dataset/datasets` via `baseService.ts`.

### 6.1. `ds_dw_sql` — SQL cru

```ts
await axios.post(fluigConfig.datasetUrl, {
  name: "ds_dw_sql",
  fields: [
    `SELECT ... FROM ML00xxxx WHERE ... = '${valor}'`,
    `java:/jdbc/AppDS`,
  ],
});
```

- Valores são **interpolados direto na string** (sem parametrização)
- Tabelas: `ML00xxxx` (formulários Fluig), `PROCES_WORKFLOW`, `DOCUMENTO`, etc.

### 6.2. `dsIntegraFacilRM` — sentença do RM

```ts
import { sqlBody } from "../../utils/sqlBody";

await axios.post(fluigConfig.naturezaOrcamentaria, sqlBody({
  codSentenca: "FL.DS.5.0037",
  parameters: `CODCOLIGADA=${cod}|CODFILIAL=${fil}|...`,
}));
```

### 6.3. Normalização de resposta

```ts
const lista = Array.isArray(r.data.content.values)
  ? r.data.content.values
  : [r.data.content.values];

const erro = r.data.content.values[0].ERRO;
if (erro) throw new Error(erro);

// Sentenças RM costumam vir como STRING JSON em .MESSAGE
const dados = JSON.parse(r.data.content.values[0].MESSAGE);
```

**Sempre** normalize objeto-ou-array. **Sempre** cheque `ERRO` explicitamente.

---

## 7. Camada de mocks

Ativa em dev quando `VITE_USE_MOCKS !== "false"`. Intercepta chamadas ao endpoint de datasets e responde com dados de `src/mock/data/*`.

Para adicionar um mock novo:
1. Crie um arquivo em `src/mock/data/` exportando um array de linhas
2. Registre em `src/mock/dataset-rules.ts` com matcher `sql(...)` ou `sentenca(...)`

A primeira regra que casa vence — mantenha as substrings únicas entre as queries.

---

## 8. Convenções de código

- **Nomes em português**, seguindo o domínio e os campos do RM
- **`any` é tolerado** nas fronteiras com o Fluig (datasets, `window.WCMAPI`). Não brigue com a tipagem
- **TypeScript `strict`** com `noUnusedLocals`/`noUnusedParameters`
- **Lint** roda com `--max-warnings 0`. Não introduza novos problemas
- **SQL é montado por interpolação de string** — mantenha o estilo
- **Sem testes.** Verificação: app com mocks, `tsc`, `lint`, e comparação de payload

---

## 9. Workflow do Fluig

- **Abrir processo:** URL `pageworkflowview?processID=...` (ver `config.ts`)
- **Enviar formulário:** `POST` para `/ecm/api/rest/ecm/workflowView/send` com `formData: [{ name, value }, ...]`
- Template do payload em `src/Process/ProcessType.ts`
- Em `localhost`, `handleSaveClick` **retorna o payload** em vez de enviar

---

## 10. Vocabulario do domínio (RM)

| Prefixo | Significado |
|---|---|
| `TMOV_*` | Movimento (cabeçalho) |
| `TITMMOV_*` | Item do movimento |
| `TITMMOVRATCCU_*` | Rateio do item por centro de custo |
| `TMOVPAGTO_*` | Forma/parcela de pagamento |
| `TCNT_*` | Contrato |
| `FCFO_*` / `CFO` | Fornecedor |
| `TBORCAMENTO` / `NAT` | Natureza orçamentária |

---

## 11. Dívidas técnicas / pendências conhecidas

- `useSaveContrato.ts`: import não usado quebra `tsc`/`build`
- ~17 problemas de lint pré-existentes (`prefer-const`, `react-hooks/exhaustive-deps`)
- Reescrita do builder de payload de pagamento (`handleSaveClick`) planejada mas pendente
- `useSolicitacaoPagamento.ts` tem blocos comentados e `console.log` de debug

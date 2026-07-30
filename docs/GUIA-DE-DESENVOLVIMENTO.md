# Guia de Desenvolvimento — wd_contratos

Guia detalhado de arquitetura, estrutura de pastas e padrões de código deste projeto.
Leia antes de implementar qualquer coisa. O objetivo é que você consiga abrir uma feature,
entender como ela se conecta ao resto e adicionar/alterar comportamento seguindo o padrão existente.

---

## 1. O que este projeto é (e o que não é)

- É um **widget React embarcado no TOTVS Fluig**. O build gera um bundle JS que é publicado dentro
  de um layout do Fluig. Em runtime ele roda **dentro de uma página do portal Fluig**.
- **Não roda sozinho em produção.** Ele depende de objetos que a página do Fluig coloca em `window`:
  - `window.WCMAPI` — dados do usuário logado, helpers de requisição do Fluig.
  - `window.WCMC` — abertura de painéis/janelas do portal.
  Esses globais **só existem dentro do Fluig**. Em `npm run dev` eles não existem, por isso usamos
  a camada de mocks (seção 7) para conseguir desenvolver localmente.
- Os dados vêm de **datasets do Fluig** e de **sentenças do TOTVS RM** (ERP). Não há um backend
  próprio deste projeto — o "backend" é o Fluig + RM.
- O domínio é **financeiro/contratos**, e os nomes (variáveis, campos, pastas) são em **português**
  e seguem a nomenclatura de campos do RM (`TMOV_T_*`, `TITMMOV_T_*`, `TCNT_*`, etc.).

---

## 2. Fluxo de inicialização

```
index.html → src/main.tsx → <App/> (src/App.tsx)
   └── <AppProviders>            (src/AppProviders.tsx) — providers globais montados UMA vez
         └── <LayoutComponent>   (cabeçalho/layout visual do widget)
               └── <ContratosGridComponent>  (grade principal de contratos)
```

- `main.tsx` monta o React em `#root` com `<React.StrictMode>`.
- `App.tsx` só compõe `AppProviders` + layout + a grade. Sem lógica de negócio.
- `AppProviders.tsx` aplica os **providers globais** (`ContratoProvider`,
  `NaturezaOrcamentariaProvider`) numa lista, do mais externo para o mais interno. **Regra:
  cada provider global é montado aqui, uma única vez.** Não re-aninhe esses providers dentro de
  componentes filhos (já tivemos bug de provider duplicado por causa disso).

---

## 3. Estrutura de pastas

```text
src/
├── main.tsx                      bootstrap do React
├── App.tsx                       composição raiz (providers + layout + grade)
├── AppProviders.tsx              composer dos providers globais
├── config.ts                     endpoints Fluig, ambiente (dev/prod), flag de mocks, OAuth dev
├── global.d.ts                   tipagem de window.WCMAPI / window.WCMC (any)
├── vite-env.d.ts                 tipagem de import.meta.env (VITE_USE_MOCKS)
│
├── components/
│   ├── Global/                   componentes reutilizáveis: DataGrid, Modais, Layout, Error...
│   ├── Contratos/                FEATURE PRINCIPAL: grade, edição e medição de contratos
│   │   ├── ContratosComponent.tsx        grade + modais
│   │   ├── ContratosColumn.tsx           colunas da grade
│   │   ├── ContratosToolbar.tsx          toolbar da grade
│   │   ├── ContratosContext.tsx          Context + Provider do contrato selecionado
│   │   ├── ContratosTypes.ts             tipos do contrato (IContratoData, etc.)
│   │   ├── ContratoModalEdit*.tsx        modal de edição
│   │   ├── hooks/                         hooks da feature (useContratos, useContratoContext...)
│   │   └── EditForm/                      abas do formulário de contrato
│   │       ├── ContratoFormEdit.tsx       container das abas (Detalhes, Faturamento, Rateio...)
│   │       ├── ControleRateioForm.tsx     ABA DE RATEIO (apenas render)
│   │       └── useControleRateio.ts       lógica/estado do rateio (ver seção 9)
│   ├── SolicitacaoPgto/          FEATURE: solicitação de pagamento (medição → pagamento)
│   │   ├── SolicitacaoPagamentoModal.tsx   modal com abas
│   │   ├── SolicitacaoPagamentoForm.tsx    formulário principal
│   │   ├── SolicitacaoPagamentoContext.tsx Context + Provider
│   │   ├── useSolicitacaoPagamento.ts      lógica + montagem do payload de envio (grande)
│   │   ├── items/                           itens do pagamento
│   │   └── formaPagamento/                  forma de pagamento
│   ├── Rateio/                   componentes de linha de rateio (LinhaRateio, modal de centro de custo)
│   ├── CentroCusto/              seletor de centro de custo
│   ├── NaturezaOrcamentaria/     seletor de natureza orçamentária
│   ├── Fornecedores/             seletor de fornecedor
│   ├── Destinatarios/            seletor de destinatário (coligada/filial)
│   ├── Responsaveis/             responsáveis do contrato
│   ├── Notas/                    notas fiscais
│   ├── AnexarDocumentos/         upload e anexação de documentos no processo
│   └── Relatorios/               relatórios/medições
│
├── mock/                         CAMADA DE MOCKS (só ativa em dev — ver seção 7)
│   ├── dataset-mock.adapter.ts   adapter do axios que intercepta chamadas a datasets
│   ├── dataset-rules.ts          registro de regras (qual mock responde a qual consulta)
│   └── data/                     dados de mock por consulta (contratos, rateio, fornecedores...)
│
├── utils/
│   ├── baseService.ts            instância axios (interceptor OAuth + adapter de mock)
│   ├── sqlBody.ts                monta o body de chamada a sentença RM (dsIntegraFacilRM)
│   ├── formatChaveNFE.ts         formatação de chave de NF-e
│   ├── dadosBoleto.ts            extração de dados de boleto
│   └── viewDocumentFluig.ts      abre o visualizador de documentos do Fluig (window.WCMC)
│
└── Process/
    └── ProcessType.ts            template do payload de workflow (formData) + URL de envio
```

---

## 4. O padrão de uma feature (MUITO IMPORTANTE)

Toda feature em `components/<Feature>/` segue o mesmo padrão de 4 peças. Quem aprende uma, entende
todas:

| Arquivo | Papel |
|---|---|
| `<Feature>Context.tsx` | `createContext` + `Provider` que guarda os `useState` (o estado da feature). |
| `use<Feature>Context.ts` | Hook consumidor. Faz `useContext` e **lança erro** se usado fora do Provider. É por aqui que os componentes leem/escrevem o estado. |
| `use<Feature>.ts` | Hook de **lógica/negócio**: faz as chamadas axios, transforma dados, expõe handlers. |
| `*Form.tsx` / `*ModalSelect.tsx` / `*Component.tsx` | **Apresentação** (UI). Consome os hooks acima. |

Exemplo (Contratos):
- `ContratosContext.tsx` guarda o contrato selecionado, listas, flags de modal.
- `hooks/useContratoContext.ts` expõe esse estado e quebra se chamado fora do `ContratoProvider`.
- `hooks/useContratos.ts` busca a grade de contratos, trata clique de linha, busca rateio/medições/responsáveis.
- `ContratosComponent.tsx` só renderiza a grade + modais usando o que os hooks dão.

**Regra de ouro:** componente cuida de **render**; hook cuida de **estado e lógica**. Se um
componente está com `useEffect` + axios + cálculo no meio do JSX, ele está fazendo demais — extraia
para um hook (foi o que fizemos no rateio, seção 9).

### Como criar uma nova feature

1. Crie a pasta `src/components/MinhaFeature/`.
2. `MinhaFeatureContext.tsx`: defina o tipo do contexto, o `createContext(undefined)` e o `Provider`
   com os `useState`.
3. `useMinhaFeatureContext.ts`: hook que faz `useContext` e lança erro se `undefined`.
4. `useMinhaFeature.ts`: a lógica (chamadas a dataset, handlers).
5. Componentes de UI consumindo os hooks.
6. **Onde montar o Provider?**
   - Se for global (usado em toda a aplicação) → adicione em `AppProviders.tsx`.
   - Se for de escopo local (um modal, uma aba) → monte na fronteira daquela feature, **uma vez só**.
     Os seletores (`Fornecedores`, `CentroCusto`, `Notas`, etc.) são montados onde são usados.

---

## 5. Estado global e Providers

- O estado é **Context do React por feature**. Não há Redux/Zustand. Não há router.
- Providers globais ficam em `AppProviders.tsx`. Providers de feature ficam na fronteira da feature.
- **Nunca monte o mesmo Provider em dois lugares no mesmo caminho da árvore** — o interno "sombreia"
  o externo e o estado se divide em duas instâncias (isso já causou bug no fluxo de Solicitação de
  Pagamento e na Natureza Orçamentária). Se um componente precisa do estado, garanta que existe
  exatamente **um** Provider acima dele.

---

## 6. Acesso a dados (Fluig / RM) — o coração do projeto

Tudo passa por `POST` para o endpoint de datasets do Fluig
(`/api/public/ecm/dataset/datasets`). Existem **dois padrões**:

### 6.1. `ds_dw_sql` — SQL cru

Você manda a query SQL Server direto no `fields[0]` e o datasource no `fields[1]`:

```ts
await axios.post(fluigConfig.datasetUrl, {
  name: "ds_dw_sql",
  fields: [
    `SELECT ... FROM ML001134 ML ... WHERE ML.IDFLUIG = '${item.IDFLUIG}'`,
    `java:/jdbc/AppDS`,
  ],
});
```

- As tabelas são as tabelas de formulário do Fluig (`ML00xxxx`), `PROCES_WORKFLOW`, `DOCUMENTO`, etc.
- Os valores são **interpolados direto na string** (ex.: `WHERE ... = '${item.IDFLUIG}'`). Mantenha
  esse estilo ao adicionar queries, mas tenha consciência de que **não há parametrização**.

### 6.2. `dsIntegraFacilRM` — sentença do RM (via `sqlBody`)

Chama uma sentença nomeada do TOTVS RM (`codSentenca`, ex.: `FL.DS.5.0037`) com parâmetros
delimitados por `|` e `;`:

```ts
import { sqlBody } from "../../utils/sqlBody";

await axios.post(
  fluigConfig.naturezaOrcamentaria,
  sqlBody({
    codSentenca: "FL.DS.5.0037",
    parameters: `CODCOLIGADA=${cod}|CODFILIAL=${fil}|CODCCUSTO=${cc}|LIMITEFLUIG=300|BUSCADOR=@%@`,
  }),
);
```

`sqlBody` monta o `name: "dsIntegraFacilRM"` com as `constraints` esperadas pelo Fluig.

### 6.3. ⚠️ O *gotcha* da resposta (leia isto)

As respostas chegam em `r.data.content.values`, que pode ser **um objeto único OU um array**. O
código normaliza assim em todo lugar:

```ts
const lista = Array.isArray(r.data.content.values)
  ? r.data.content.values
  : [r.data.content.values];
```

E **erros não vêm por status HTTP** — vêm dentro do payload:

```ts
const erro = r.data.content.values[0].ERRO;
if (erro) throw new Error(erro);
// em sentenças RM, o resultado costuma vir como STRING JSON em .MESSAGE:
const dados = JSON.parse(r.data.content.values[0].MESSAGE);
```

Sempre cheque `ERRO` explicitamente. Sempre normalize objeto-ou-array.

### 6.4. `baseService.ts` (axios)

Todas as chamadas usam a instância exportada por `src/utils/baseService.ts`. Ela:
- adiciona o cabeçalho `Authorization` (OAuth) via interceptor (só preenchido no ramo dev);
- em dev com mocks ligados, troca o `adapter` do axios pelo adapter de mock (seção 7).

Importe sempre dessa instância para herdar esses comportamentos.

---

## 7. Camada de mocks (desenvolvimento local)

Permite rodar `npm run dev` sem servidor Fluig. Funciona assim:

1. `src/utils/baseService.ts`, quando `useMocks` é verdadeiro, troca o adapter do axios por
   `datasetMockAdapter` (`src/mock/dataset-mock.adapter.ts`).
2. O adapter intercepta os `POST` ao endpoint de datasets, lê o **corpo da requisição** e procura a
   primeira regra que casa em `src/mock/dataset-rules.ts`.
3. Devolve `{ data: { content: { values } } }` — exatamente o formato que o app já desempacota — com
   ~300ms de atraso simulado. Qualquer outra requisição passa direto.

Como as chamadas reaproveitam o mesmo `name`, as regras casam pelo **conteúdo do corpo**:
- `sql("SUBSTRING")` — casa quando o SQL (`fields[0]`) contém a substring. Use algo **único** daquela
  query (um nome de tabela como `ML001090`, ou um literal distintivo como `'Cadastrando'`).
- `sentenca("FL.DS.X.XXXX")` — casa chamadas `dsIntegraFacilRM` pelo código da sentença.
- **A primeira regra que casa vence** → mantenha as substrings únicas entre as queries.

### Adicionar um mock novo

Quando uma consulta volta vazia em dev, o console mostra `[mock] no rule matched ...`. Para cobrir:

1. Crie um arquivo em `src/mock/data/` exportando um array de linhas cujas chaves batem com os
   **aliases** que o componente lê (não as colunas cruas da tabela).
2. Registre em `src/mock/dataset-rules.ts` no array `DATASET_RULES`, com um matcher `sql(...)` ou
   `sentenca(...)`.

Exemplo real (já no projeto):

```ts
import { centrosDeCustoMock } from "./data/centrosDeCusto";
// ...
export const DATASET_RULES: MockRule[] = [
  { id: "centrosCusto", match: sentenca("FL.DS.5.0033"), values: centrosDeCustoMock },
  { id: "contratos",    match: sql("'Cadastrando'"),     values: contratosMock },
  { id: "rateio",       match: sql("ML001143"),           values: rateioMock },
  // ...
];
```

A flag fica em `.env.local`: `VITE_USE_MOCKS=true` (padrão em dev) ou `false` (bate na nuvem real).
Em build de produção os mocks são removidos por *tree-shaking* (a flag é `false`).

---

## 8. Ambientes e configuração (`config.ts`)

- `isDev = import.meta.env.DEV` distingue o dev server do build de produção.
- `useMocks = isDev && import.meta.env.VITE_USE_MOCKS !== "false"`.
- Em **prod**: URLs relativas (mesma origem do Fluig) e usuário vindo de `window.WCMAPI.userLogin`.
- Em **dev**: URLs apontam para a instância de nuvem e há um cabeçalho OAuth fixo no objeto de config.
- O `outDir` do build fica em `vite.config.ts` (gitignored) — específico de cada dev.

---

## 9. Exemplo de estrutura limpa: `useControleRateio`

A aba de Rateio é o exemplo do padrão "hook de lógica + componente de render":

- `EditForm/useControleRateio.ts` — **toda** a lógica: estado `rateios`, adicionar/remover/atualizar/
  limpar linha, recálculo de percentual/valor, `isBlock` (trava o botão `+`), busca de centro de custo
  e natureza orçamentária, seleção via modal. Expõe um objeto com estado + handlers.
- `EditForm/ControleRateioForm.tsx` — **só render**: mapeia `LinhaRateio`, botões `+`/`−` e os modais,
  consumindo `useControleRateio()`.

Esse é o alvo de estilo para o resto do projeto. Quando for mexer numa tela "monolítica" (estado +
efeitos + axios + JSX no mesmo arquivo), extraia a lógica para um `use*` e deixe o componente magro.

Detalhes do raciocínio e das próximas etapas estão em
`docs/superpowers/specs/2026-05-22-phase2-denest-refactor-design.md`.

---

## 10. Workflow do Fluig (abrir processo, enviar, anexar)

- **Abrir um processo:** navega-se para uma URL `pageworkflowview?processID=...` (ver `config.ts`,
  campos `abrirSolicitacao*`).
- **Enviar um formulário de workflow:** `POST` para `/ecm/api/rest/ecm/workflowView/send` com um
  `formData: [{ name, value }, ...]` grande, usando os nomes de campo do RM. O template completo está
  em `src/Process/ProcessType.ts` (`sendInitial` + `sendUrl`). A montagem desse payload acontece em
  `useSolicitacaoPagamento.ts` (`handleSaveClick`).
- **Anexos:** sobe via `/ecm/upload` e depois anexa no processo via endpoints de `workflowView`
  (ver `components/AnexarDocumentos/`).
- **Visualizar documento:** `utils/viewDocumentFluig.ts` usa `window.opener.parent.ECM.documentView`
  e abre um painel via `window.WCMC.panel`.

> Em `window.location.host.includes("localhost")`, `handleSaveClick` **retorna o payload** em vez de
> enviar — útil para inspecionar o que seria mandado, sem servidor.

---

## 11. Fluxos principais do app

1. **Grade de Contratos** (`Contratos/ContratosComponent`): lista contratos (dataset `ds_dw_sql`).
   Clique de linha → carrega rateio, medições, responsáveis, tolerância do contrato selecionado.
2. **Editar contrato** (`EditForm/ContratoFormEdit`): abas — Detalhes, Faturamento, Responsável,
   Controle Orçamentário e **Controle Rateio**.
3. **Medição → Solicitação de Pagamento** (`SolicitacaoPgto/`): abre um modal com abas (Contrato,
   Notas Fiscais, Solicitação). Monta os itens, o rateio e a forma de pagamento, e envia o workflow.
4. **Seletores** (`Fornecedores`, `CentroCusto`, `NaturezaOrcamentaria`, `Destinatarios`, `Notas`):
   modais de busca reutilizados pelos fluxos acima.

---

## 12. Vocabulário do domínio (RM)

| Prefixo / termo | Significado |
|---|---|
| `TMOV_*` | Movimento (cabeçalho) |
| `TITMMOV_*` | Item do movimento |
| `TITMMOVRATCCU_*` | Rateio do item por centro de custo |
| `TMOVPAGTO_*` | Forma/parcela de pagamento |
| `TCNT_*` | Contrato |
| `FCFO_*` / `CFO` | Fornecedor |
| `TBORCAMENTO` / `NAT` | Natureza orçamentária |
| **rateio** | divisão de um valor entre centros de custo |
| **medição** | evento de medição/faturamento de um contrato |
| **solicitação de pagamento** | pedido de pagamento gerado a partir de uma medição |
| **coligada / filial** | empresa / unidade no RM |

---

## 13. Convenções de código

- **Nomes em português**, seguindo o domínio e os campos do RM. Mantenha o padrão ao criar variáveis,
  arquivos e funções.
- **`any` é tolerado** nas fronteiras com o Fluig (datasets, `window.WCMAPI`). Vários arquivos começam
  com `/* eslint-disable @typescript-eslint/no-explicit-any */`. Não brigue com a tipagem aqui — siga
  o padrão local.
- **TypeScript `strict`** com `noUnusedLocals`/`noUnusedParameters`. Remova imports/variáveis que
  *suas* mudanças deixaram órfãos.
- **Lint** roda com `--max-warnings 0`. Já existem ~17 problemas pré-existentes; **não introduza
  novos** nos arquivos que você tocar.
- **SQL é montado por interpolação de string.** Mantenha o estilo; lembre que valores não são
  parametrizados.
- **Sem testes.** A verificação é: rodar o app (com mocks), `tsc`, `lint` e, para o payload de
  pagamento, comparação contra um JSON "golden" (planejado).
- **Componente = render; hook = estado/lógica.** Veja a seção 9.

---

## 14. Dívidas técnicas / o que falta

- `useSaveContrato.ts`: import não usado quebra o `tsc`/`build` — corrigir.
- ~17 problemas de lint pré-existentes (`prefer-const`, `react-hooks/exhaustive-deps`).
- **Reescrita do builder de payload de pagamento** (`handleSaveClick` em `useSolicitacaoPagamento.ts`)
  está planejada (tarefas C2–C4 em `docs/superpowers/plans/2026-05-22-phase2-denest-refactor.md`).
  Atenção: o payload usa `TMOV_T_DATASAIDA: new Date()...`, que é **não-determinístico** — qualquer
  script de comparação "golden" precisa normalizar esse campo. Idealmente, validar com um envio real
  em homologação.
- `useSolicitacaoPagamento.ts` ainda tem blocos comentados e `console.log` de debug dentro de
  `handleSaveClick` (limpeza pendente, junto com a reescrita acima).
```

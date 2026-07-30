# wd_contratos — Gestão de Contratos (Widget Fluig)

Aplicação **React + TypeScript + Vite** que roda **embarcada dentro do TOTVS Fluig** como um
layout/widget. **Não é um site standalone**: em produção o bundle gerado é publicado dentro de um
layout do Fluig e depende de globais injetadas pela página do Fluig (`window.WCMAPI`, `window.WCMC`).
Todos os dados vêm de chamadas a *datasets* do Fluig / sentenças do TOTVS RM.

> 📘 **Para entender a arquitetura e o padrão de código antes de mexer, leia o
> [Guia de Desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md).** É leitura obrigatória para quem
> está pegando o projeto.

## Rodar localmente (com mocks) — sem precisar de servidor Fluig

```bash
npm install
npm run dev
```

Abra a URL impressa no terminal (ex.: http://localhost:5173/). Em modo dev, as chamadas ao endpoint
de datasets do Fluig são interceptadas por um *adapter* do axios (`src/mock/dataset-mock.adapter.ts`)
e respondidas com os dados de `src/mock/data/*`. A grade de Contratos e o fluxo de abrir um contrato
(rateio, medições, responsáveis, etc.) são preenchidos com dados de mock. O console mostra `[mock] ... ON`.

## Rodar dev contra o Fluig real (nuvem de homologação)

Crie um arquivo `.env.local` (copie de `.env.example`) com:

```dotenv
VITE_USE_MOCKS=false
```

Aí `npm run dev` passa a bater na instância de nuvem configurada em `src/config.ts` (usa o cabeçalho
OAuth do ramo `dev`). Precisa de acesso de rede a essa instância.

## Build e deploy no Fluig

```bash
npm run build      # tsc + vite build
npm run patch      # incrementa a versão patch (exibida no rodapé da UI) + build
npm run lint       # eslint (--max-warnings 0)
npm run mock       # json-server em :8080 (mock alternativo, pouco usado)
```

⚠️ `vite.config.ts` está **no .gitignore** e contém um `build.outDir` fixo apontando para o caminho
`resources/js` do layout do Fluig — cada dev mantém o seu. Trocar o alvo DEV/HOMOLOG/PROD significa
editar qual linha de `outDir` está ativa. `build.minify` é `false` de propósito (bundle depurável
dentro do Fluig). Depois do build, ainda é preciso empacotar/republicar o widget no Fluig.

## Estrutura (resumo)

```text
src/
├── App.tsx / AppProviders.tsx     entrada + composição de providers globais
├── config.ts                      endpoints, ambiente (dev/prod) e flag de mocks
├── components/<Feature>/          uma pasta por feature (ver guia)
├── mock/                          camada de mocks dos datasets (dev)
├── utils/                         baseService (axios), sqlBody, PDFs, etc.
└── Process/                       template do payload de workflow do Fluig
```

Detalhamento completo, padrões e "como fazer X" estão no
**[Guia de Desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md)**.

## Stack

React 18, Vite 4, MUI + `@mui/x-data-grid`, Emotion, Tailwind, axios. PDFs: jsPDF, pdf-lib,
pdfjs-dist, html2canvas. Sem router. Sem framework de testes. Estado é Context do React por feature.

## Pendências conhecidas

- `src/components/Contratos/hooks/useSaveContrato.ts` tem um import não usado que faz o `tsc`
  (e portanto `npm run build`) falhar — corrigir antes de buildar.
- `npm run lint` acusa ~17 problemas pré-existentes (`prefer-const`, `react-hooks/exhaustive-deps`).
- A reescrita do builder de payload de pagamento (`handleSaveClick`) está planejada mas pendente —
  ver `docs/superpowers/plans/2026-05-22-phase2-denest-refactor.md` (tarefas C2–C4).

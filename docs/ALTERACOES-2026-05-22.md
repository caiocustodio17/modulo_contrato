# Alterações — 22/05/2026

Registro das alterações feitas no projeto **wd_contratos** (widget de Gestão de Contratos no TOTVS Fluig) nesta data. Inclui o que já está commitado e o que está pendente de commit na área de trabalho.

---

## 1. Ambiente de desenvolvimento local (mocks dos datasets do Fluig)

Permite rodar a aplicação localmente (`npm run dev`) sem servidor Fluig, simulando as chamadas aos datasets.

- **`src/config.ts`**: detecção de ambiente por `import.meta.env.DEV` (dev x build de produção) e exportação da flag `useMocks`. Removido o `environment` fixo em `'prod'`.
- **`.env.example` / `src/vite-env.d.ts`**: nova flag `VITE_USE_MOCKS` (padrão: mocks ligados em dev; `false` para apontar para a nuvem real). Tipagem de `import.meta.env`.
- **`src/utils/baseService.ts`**: quando `useMocks` está ativo, o adapter do axios é trocado pelo adapter de mock.
- **`src/mock/dataset-mock.adapter.ts`** (novo): intercepta os `POST` aos datasets, casa o corpo da requisição com uma regra e devolve o formato `{ content: { values } }` com latência simulada (~300 ms). Demais requisições passam direto.
- **`src/mock/dataset-rules.ts`** (novo + ampliado): registro de regras com matchers `sql()` (substring do SQL) e `sentenca()` (código da sentença RM). Em produção é removido por *tree-shaking*.
- **`src/mock/data/*`** (novos): dados de mock por consulta — contratos, rateio, medições, responsáveis, papéis, fornecedores, destinatários, centros de custo, naturezas orçamentárias, responsáveis RM, fornecedores RM e produtos RM.

## 2. Documentação

- **`README.md`**: reescrito — como rodar local com mocks, como apontar para o Fluig real, build/deploy, estrutura resumida e pendências conhecidas.
- **`docs/GUIA-DE-DESENVOLVIMENTO.md`** (novo): guia detalhado de arquitetura, estrutura de pastas, padrão de feature (Context + hooks + UI), acesso a dados (datasets `ds_dw_sql` e sentenças `dsIntegraFacilRM`), camada de mocks, convenções e dívidas técnicas.
- **`docs/superpowers/specs` e `docs/superpowers/plans`**: documentos de especificação e plano das refatorações.

## 3. Reorganização da estrutura (redução de aninhamento)

- **`src/AppProviders.tsx`** (novo): compõe os providers globais (`ContratoProvider`, `NaturezaOrcamentariaProvider`) em um único ponto, montados uma só vez.
- **`src/App.tsx`**: passa a usar `AppProviders` no lugar do aninhamento manual.
- **`src/components/Contratos/ContratosContext.tsx`**: removido o `NaturezaOrcamentariaProvider` duplicado que era montado internamente.
- **`src/components/SolicitacaoPgto/SolicitacaoPagamentoModal.tsx`**: removido o `SolicitacaoPagamentoProvider` duplicado que envolvia a aba do formulário (o modal inteiro já é envolvido por um único provider); removido `console.log` solto.
- **`src/components/Contratos/EditForm/useControleRateio.ts`** (novo): toda a lógica e estado do controle de rateio (estado das linhas, adicionar/remover/atualizar/limpar, recálculo de percentual/valor, trava do botão, buscas de centro de custo e natureza, seleção via modal) foram extraídos para este hook.
- **`src/components/Contratos/EditForm/ControleRateioForm.tsx`**: reduzido a componente de apresentação, consumindo `useControleRateio`.
- **`src/components/Rateio/CentroCustoRateioForm.tsx`** (`LinhaRateio`): removidas props sem uso.
- **Arquivos legados removidos**: `src/components/Rateio/test.tsx` e `src/components/Rateio/CentroCustoRateioItem.tsx` (duplicatas não utilizadas).
- **`src/components/SolicitacaoPgto/useSolicitacaoPagamento.ts`**: correção de `setState` executado em fase de renderização (movido para `useEffect`); remoção de blocos de código comentado e de `console.log` de depuração fora da montagem do payload.

## 4. Correções de comportamento (cadastro / rateio)

- **Rateio — valor não some mais sozinho**: ao apagar todos os caracteres do campo de valor, ele permanece vazio (antes era repreenchido automaticamente com o valor padrão).
- **Rateio — botão "+" destravado**: o botão de adicionar linha volta a ficar habilitado depois de adicionar e remover uma linha (antes ficava travado).
- **Rateio (consulta `RateioList`)**: corrigidos os *aliases* das colunas — `CODTBORCAMENTO` passa a vir de `TMOV_T_CODTBORCAMENTO` e `DESCRICAO_NAT` de `TMOV_T_TBORCAMENTO`.
- **Tolerância do contrato**: ao receber erro do dataset, a função interrompe o processamento (early-return) em vez de seguir e quebrar.
- **`ItensPagamentoForm` (`findLastPayment`)**: reescrito com `useCallback` e proteções — só executa com contrato definido, normaliza o retorno (objeto ou lista) e trata o campo `ERRO` do dataset.

## 5. Busca de itens — filtro por natureza orçamentária

- **`src/components/SolicitacaoPgto/items/useItensPagamento.ts`**:
  - O filtro de natureza passa a ser montado como **CSV** (ex.: `35.01.04,35.01.05`), em um único parâmetro `CODTBORCAMENTO` — em vez de `OR` repetido (que o RM não interpreta).
  - O parâmetro `CODTBORCAMENTO` é **sempre enviado**; quando não há código, envia o sentinela `@` (o RM não aceita parâmetro nomeado com valor vazio). `@` é tratado na sentença como "trazer todos".
  - **Fallback**: quando o rateio ainda não foi carregado, usa a natureza do próprio contrato.
  - A **mensagem de erro** exibida ao usuário passa a incluir os parâmetros usados na consulta, facilitando o diagnóstico.
- **`src/components/SolicitacaoPgto/@types/SolicitacaoPagamentoType.ts`**: o tipo do produto (`ITItmmovData`) passou a incluir `CODTBORCAMENTO`.
- **`handleAddItemClick`**: o item adicionado herda a **natureza orçamentária do produto selecionado** (a coluna "Nat. Orçamentária" deixa de exibir `null`).

## 6. Alteração na sentença RM `FL.DS.G.1` (aplicar no RM)

A sentença de busca de produtos passou a aceitar um novo parâmetro **opcional** de natureza orçamentária. Filtra os produtos por uma lista (CSV) de códigos; `@` ou vazio retorna todos.

```sql
DECLARE @_CODCOLIGADA    INT          = :CODCOLIGADA,
        @_TIPO           VARCHAR(10)  = :TIPO,
        @_LIMITEFLUIG    INT          = :LIMITEFLUIG,
        @_BUSCADOR       VARCHAR(MAX) = :BUSCADOR,
        @_CODTBORCAMENTO VARCHAR(MAX) = :CODTBORCAMENTO

SET @_BUSCADOR = '%' + Replace(@_BUSCADOR, '@', '%') + '%'

SELECT *
FROM   (SELECT *, [INDICE] = ROW_NUMBER() OVER (ORDER BY VB.IDPRD)
        FROM   (SELECT PRD.*,
                       [CODUND] = PRDDEF.CODUNDCOMPRA,
                       [DESCRICAOLONGA] = NULL,
                       [PRECOUNITARIO] = 0,
                       [BUSCADOR] = PRD.CODIGOPRD + '-' + PRD.NOMEFANTASIA,
                       [CODTBORCAMENTO] = PRDDEF.CODTBORCAMENTO
                FROM   TPRODUTO PRD (NOLOCK)
                       INNER JOIN TPRODUTODEF PRDDEF (NOLOCK)
                               ON PRD.IDPRD = PRDDEF.IDPRD
                                  AND PRDDEF.CODCOLIGADA = @_CODCOLIGADA
                WHERE  PRD.ULTIMONIVEL = 1
                       AND PRD.INATIVO = 0
                       AND PRD.TIPO = @_TIPO
                       -- filtro de natureza OPCIONAL: "@" (ou vazio) => todos os produtos
                       AND ( @_CODTBORCAMENTO = '@'
                             OR ISNULL(@_CODTBORCAMENTO, '') = ''
                             OR ',' + @_CODTBORCAMENTO + ','
                                LIKE '%,' + PRDDEF.CODTBORCAMENTO + ',%' )
                       AND LEFT(PRD.CODIGOPRD,6) NOT IN ('02.001','02.002','02.003','02.004','02.005','02.006','02.007','02.008','02.009',
                                                         '02.010','02.011','02.012','03.001','03.002','03.003','03.004','03.005','03.006',
                                                         '03.007','03.008','03.009','03.010','03.011','03.013'))VB
        WHERE  VB.BUSCADOR LIKE @_BUSCADOR)VI
WHERE  VI.INDICE <= @_LIMITEFLUIG
```

Observação: a mensagem "NÃO FORAM ENCONTRADO OS DADOS NA CONSULTA" é gerada pelo dataset `dsIntegraFacilRM` quando a consulta retorna zero linhas (não é erro da sentença). A aplicação agora exibe os parâmetros usados junto dessa mensagem.

---


/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock rules matched against the Fluig dataset request BODY (call sites are untouched).
// ds_dw_sql calls carry raw SQL in fields[0]; dsIntegraFacilRM calls carry a SENTENCA constraint.

import { contratosMock } from "./data/contratos";
import { rateioMock } from "./data/rateio";
import { medicoesMock } from "./data/medicoes";
import { fornecedoresMock } from "./data/fornecedores";
import { responsaveisMock } from "./data/responsaveis";
import { destinatariosMock } from "./data/destinatarios";
import { centrosDeCustoMock } from "./data/centrosDeCusto";
import { naturezasOrcamentariasMock } from "./data/naturezasOrcamentarias";
import { responsaveisRmMock } from "./data/responsaveisRm";
import { papeisMock } from "./data/papeis";
import { fornecerdoresRmMock } from "./data/fornecedoresRm";
import { produtosRmMock } from "./data/produtosRm";

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
    typeof body.fields?.[0] === "string" &&
    (body.fields[0] as string).includes(substr);

// Matches a dsIntegraFacilRM call by its SENTENCA constraint value.
export const sentenca =
  (code: string) =>
  (body: DatasetBody): boolean =>
    !!body.constraints?.some(
      (c) => c._field === "SENTENCA" && c._initialValue === code,
    );

export const DATASET_RULES: MockRule[] = [
  // RM stored sentence (dsIntegraFacilRM).
  // { id: "tolerancia", match: sentenca("FL.DS.5.0037"), values: toleranciaMock },
  {
    id: "fornecedores",
    match: sentenca("DW.CNT.0004"),
    values: fornecedoresMock,
  },
  {
    id: "destinatarios",
    match: sentenca("DW.CNT.0005"),
    values: destinatariosMock,
  },
  {
    id: "centrosCusto",
    match: sentenca("FL.DS.5.0033"),
    values: centrosDeCustoMock,
  },
  {
    id: "naturezasOrcamentarias",
    match: sentenca("FL.DS.5.0037"),
    values: naturezasOrcamentariasMock,
  },
  {
    id: "responsaveisRm",
    match: sentenca("DW.CNT.0001"),
    values: responsaveisRmMock,
  },
  {
    id: "fornecedoresRm",
    match: sentenca("FL.DS.G.4.1"),
    values: fornecerdoresRmMock,
  },
  {
    id: "produtosRm",
    match: sentenca("FL.DS.G.1"),
    values: produtosRmMock,
  },

  // ds_dw_sql — keyed on substrings unique to each query.
  { id: "contratos", match: sql("VERSAO_ATIVA"), values: contratosMock },
  { id: "rateio", match: sql("processNumber"), values: rateioMock },
  { id: "medicoes", match: sql("ML001090"), values: medicoesMock },
  {
    id: "responsaveis",
    match: sql("RESP.DOCUMENTID"),
    values: responsaveisMock,
  },
  {
    id: "papeis",
    match: sql("FDN_ROLE"),
    values: papeisMock,
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key } from "react";

export type IFornecedor = {
  TMOV_T_CODCOLCFO: string;
  TMOV_T_CODCFO: string;
  TMOV_T_CGCCFO: string;
  DESCRICAO_CODCFO: string;
};
export type IDestinatario = {
  TMOV_T_CODCOLIGADA: string;
  DESCRICAO_CODCOLIGADA: string;
  TMOV_T_CODFILIAL: string;
  DESCRICAO_CODFILIAL: string;
  TMOV_T_CGCFIL: string;
};
export type IDetalhes = {
  TF_T_CODCONTRATO: string;
  TF_T_CONTRATO: string;
  TF_T_DATAINICIO: string;
  TF_T_DATAFIM: string;
  TF_T_DATATOL: string;
  TMOV_T_HISTORICOLONGO: string;
};
export type IFaturamento = {
  TF_T_VALORCONTRATO: string;
  TF_T_VALOR_01: string;
  TF_T_VALOR_02: string;
  TF_T_VALOR_03: string;
  TF_T_VALOR_04: string;
  TF_T_VALOR_05: string;
  TF_T_VALOR_06: string;
  TF_T_VALOR_07: string;
  TF_T_VALOR_08: string;
  TF_T_VALOR_09: string;
  TF_T_VALOR_10: string;
  TF_T_VALOR_11: string;
  TF_T_VALOR_12: string;
};
export type INaturezaOrcamentaria = {
  TMOV_T_CODTBORCAMENTO: string;
  TMOV_T_TBORCAMENTO: string;
};
export type ICentroCusto = {
  ID: Key | null | undefined;
  TMOV_T_CODCCUSTO: string;
  DESCRICAO_CODCCUSTO: string;
};
export type IContrato = IFornecedor &
  IDestinatario &
  IDetalhes &
  IFaturamento &
  INaturezaOrcamentaria &
  ICentroCusto;

// export type IContratoData = {
//   TMOV_T_CGCCOL: string;
//   TFLUIG_T_FIMAPROVACAO: string;
//   TFLUIG_T_APROVOU: string;
//   TFLUIG_T_EXPLODEBUDGET: string;
//   TF_T_APROVADORNATUREZA: string;
//   TMOV_T_CODCOLCFO: string;
//   TF_T_CODCONTRATO: string;
//   TF_T_CONTRATO: string;
//   TF_T_DATAINICIO: string;
//   TF_T_DATAFIM: string;
//   TF_T_DATATOL: string;
//   TMOV_T_CODCOLIGADA: string;
//   DESCRICAO_CODCOLIGADA: string;
//   TMOV_T_CODFILIAL: string;
//   DESCRICAO_CODFILIAL: string;
//   TMOV_T_CGCFIL: string;
//   TMOV_T_CODCCUSTO: string;
//   DESCRICAO_CODCCUSTO: string;
//   TMOV_T_CODCFO: string;
//   TMOV_T_CGCCFO: string;
//   DESCRICAO_CODCFO: string;
//   TMOV_T_CODTBORCAMENTO: string;
//   TMOV_T_TBORCAMENTO: string;
//   TFLUIG_T_VALORINICIALAPROV: string;
//   TFLUIG_T_VALORFINALAPROV: string;
//   TF_T_VALORCONTRATO: string;
//   TF_T_VALOR_01: string;
//   TF_T_VALOR_02: string;
//   TF_T_VALOR_03: string;
//   TF_T_VALOR_04: string;
//   TF_T_VALOR_05: string;
//   TF_T_VALOR_06: string;
//   TF_T_VALOR_07: string;
//   TF_T_VALOR_08: string;
//   TF_T_VALOR_09: string;
//   TF_T_VALOR_10: string;
//   TF_T_VALOR_11: string;
//   TF_T_VALOR_12: string;
//   TMOV_T_HISTORICOLONGO: string;
// };

export type IContratoRespData = {
  TRESP_T_CODFUNCAO: string;
  TRESP_T_CODPAPEL: string;
  TRESP_T_FUNCAO: string;
  TRESP_T_PAPEL: string;
  TRESP_T_SEQF: string;
};

export const INITIAL_CONTRATO = {
  TF_T_STATUS: "Andamento",
  DESCRICAO_CODCOLIGADA: "SISTEMA DE ENSINO PHYSICS",
  DESCRICAO_CODFILIAL: "PHYSICS - ALCINDO CACELA 1",
  DESCRICAO_CODCCUSTO: "TI - Sistemas",
  TMOV_T_TBORCAMENTO: "Softwares Recorrente",
  DESCRICAO_CODCFO: "DataWer LTDA",
  TFLUIG_T_TBORCAMENTOLIST: "",
  TFLUIG_T_FIMAPROVACAO: "NAO",
  TFLUIG_T_APROVOU: "FIRST_TIME",
  TFLUIG_T_EXPLODEBUDGET: "",
  TFLUIG_T_ROLEAPPROVERBUDGET: "",
  TF_T_DATACANCELALCADA: "",
  TF_T_APROVADORNATUREZA: "",
  TF_T_ESTOUROTOLERANCIA: "",
  TFLUIG_T_CLICKORCAMENTO: "",
  TFLUIG_T_INTERACTIONDETAIL: "",
  TMOV_T_CODCOLCFO: "0",
  TFLUIG_T_CREATIONDATE: "04/09/2023 14:05:18",
  TF_T_TIPOCADASTRO: "",
  TF_T_PROCESS_ORIG_ALT: "",
  TF_T_DOCID_ORIG_ALT: "",
  TF_T_PROCESS_ALT: "",
  TF_T_DOCID_ALT: "",
  TF_T_CODCONTRATO_ALT: "",
  TF_T_CONTRATO_ALT: "",
  TF_T_CODCONTRATO: "identificador0134",
  TF_T_CONTRATO: "teste abc",
  TF_T_CODSTATUS: "A",
  TF_T_DATAINICIO: "2023-09-04",
  TF_T_DATAFIM: "2023-12-31",
  TF_T_DATATOL: "2024-01-01",
  TF_T_ANO_VIGENCIA: "",
  TMOV_T_CODCOLIGADA: "1",
  TMOV_T_CGCCOL: "08.666.306/0001-93",
  TMOV_T_CODFILIAL: "1",
  TMOV_T_CGCFIL: "08.666.306/0001-93",
  TMOV_T_CODCCUSTO: "3.04.02",
  TMOV_T_CODTBORCAMENTO: "35.01.04",
  TMOV_T_CODCOLTBORCAMENTO: "",
  TMOV_T_CODCFO: "0086368",
  TMOV_T_CGCCFO: "39.489.289/0001-90",
  TFLUIG_T_VALORINICIALAPROV: "0,00",
  TFLUIG_T_VALORFINALAPROV: "0,00",
  TF_T_VALORCONTRATO: "875,01",
  TF_T_VALOR_01: "",
  TF_T_VALOR_02: "",
  TF_T_VALOR_03: "",
  TF_T_VALOR_04: "",
  TF_T_VALOR_05: "",
  TF_T_VALOR_06: "",
  TF_T_VALOR_07: "",
  TF_T_VALOR_08: "",
  TF_T_VALOR_09: "",
  TF_T_VALOR_10: "291,67",
  TF_T_VALOR_11: "291,67",
  TF_T_VALOR_12: "291,67",
  TRESP_T_SEQF___1: "1",
  TRESP_T_CODFUNCAO___1: "1",
  TRESP_T_FUNCAO___1: "Administradores",
  TRESP_T_CODPAPEL___1: "admin",
  TRESP_T_PAPEL___1: "admin",
  TINT_T_DELETED: "",
  TINT_T_SEQF: "",
  TINT_T_IDUSER: "",
  TINT_T_MANAGERMODE: "",
  TINT_T_REPLACEMENT: "",
  TINT_T_USER: "",
  TINT_T_FUNCAO: "",
  TINT_T_DATETIME: "",
  TINT_T_STATUS: "",
  TINT_T_INTERVALO: "",
  TMOV_T_HISTORICOLONGO: "teste",
  TINT_T_INTERACTION: "",
  IDFLUIG: "",
  TOL_VALORFIL: "",
  TOL_PERCFIL: "",
  TOL_VALORGLB: "",
  TOL_PERCGLB: "",
  TOL_VALORGERAL: "",
  TOL_PERCGERAL: "",
};

export type IContratoData = typeof INITIAL_CONTRATO & {
  STATUSCODE?: string;
  TMOV_T_CODTBORCAMENTO: string;
  TMOV_T_TBORCAMENTO: string;
  VALOR?: string;
  PERCENTUAL?: string;
  [key: string]: any;
};

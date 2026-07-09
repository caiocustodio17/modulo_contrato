/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import fluigConfig from "../../../config";
import { IContratoData, IContratoRespData } from "../ContratosTypes";
import useSolicitacaoPagamentoContext from "../../SolicitacaoPgto/useSolicitacaoPagamentoContext";
import { useContratoContext } from "./useContratoContext";
import { useState } from "react";

export default function useSaveContrato() {
  const {
    contrato,
    responsaveis,
    setError,
    setOpenError,
    setNotaSelecionada,
    setContrato,
    setOpenEdit,
    uploadedFile,
    listRateio,
  } = useContratoContext();
  const { listItems, solicitacaoPagamento } = useSolicitacaoPagamentoContext();
  const [processVersion, setProcessVersion] = useState<string>();

  function formatarValor(valor: any): string {
    if (valor === undefined || valor === null || valor === "") return "0,00";
    if (isNaN(parseFloat(valor))) return "0,00";

    return parseFloat(valor).toFixed(2).replace(".", ",");
  }

  async function save() {
    const formFields: any = {
      ...contrato,
      TF_T_STATUS: `Andamento`,
      TF_T_CODSTATUS: `A`,
      TMOVCOMPL_T_CODTIPO: solicitacaoPagamento.TMOVCOMPL_T_CODTIPO ?? "S",
      TMOVCOMPL_T_DESCTIPO: solicitacaoPagamento.TMOVCOMPL_T_CODTIPO === "M" ? "Mercadoria" : "Serviço",
      TF_T_VALORCONTRATO: formatarValor(contrato.TF_T_VALORCONTRATO),
      TF_T_VALOR_01: formatarValor(contrato.TF_T_VALOR_01),
      TF_T_VALOR_02: formatarValor(contrato.TF_T_VALOR_02),
      TF_T_VALOR_03: formatarValor(contrato.TF_T_VALOR_03),
      TF_T_VALOR_04: formatarValor(contrato.TF_T_VALOR_04),
      TF_T_VALOR_05: formatarValor(contrato.TF_T_VALOR_05),
      TF_T_VALOR_06: formatarValor(contrato.TF_T_VALOR_06),
      TF_T_VALOR_07: formatarValor(contrato.TF_T_VALOR_07),
      TF_T_VALOR_08: formatarValor(contrato.TF_T_VALOR_08),
      TF_T_VALOR_09: formatarValor(contrato.TF_T_VALOR_09),
      TF_T_VALOR_10: formatarValor(contrato.TF_T_VALOR_10),
      TF_T_VALOR_11: formatarValor(contrato.TF_T_VALOR_11),
      TF_T_VALOR_12: formatarValor(contrato.TF_T_VALOR_12),
    };
    console.log("Payload final ->", formFields);

    async function getVersionProcess() {
      await axios
        .get(
          "https://nucleode139195.fluig.cloudtotvs.com.br:1350/process-management/api/v2/processes/dw_cadastro_de_contrato/process-versions?page=1&pageSize=1&active=true&fields=version"
          // "https://nucleode135229.fluig.cloudtotvs.com.br:2250/process-management/api/v2/processes/dw_cadastro_de_contrato/process-versions?page=1&pageSize=1&active=true&fields=version",
        )
        .then((d) => {
          console.log(d);
          setProcessVersion(d.data.items[0].version);
        })
        .catch((e) => {
          console.log("Erro full: ", e);
          console.log("Response-data: ", e.response.data);
        });
    }
    getVersionProcess();
    const anexos =
      uploadedFile.length >= 1
        ? uploadedFile.map((e) => {
          return {
            id: 1,
            fullPath: "BPM",
            droppedZipZone: false,
            name: e,
            newAttach: true,
            description: e,
            documentId: 0,
            attachedUser: window.WCMAPI.user,
            attachedActivity: "Início",
            attachments: [
              {
                attach: false,
                principal: true,
                fileName: e,
              },
            ],
            hasOwnSubMenu: true,
            enablePublish: false,
            enableEdit: false,
            enableEditContent: false,
            fromUpload: true,
            enableDownload: false,
            hasMoreOptions: false,
            iconClass: "fluigicon-file-upload",
            iconUrl: false,
            colleagueId: window.WCMAPI.usercode,
          };
        })
        : [];

    console.log(
      "[Responsável] Dados sendo enviados para o formulário:",
      responsaveis,
    );
    responsaveis.forEach((objeto, index) => {
      Object.keys(objeto).map((item) => {
        formFields[`${item}___${index + 1}`] =
          objeto[item as keyof IContratoRespData];
      });
    });

    // listRateio.forEach((objeto, index) => {
    //   formFields[`TMOV_T_CODCCUSTO_ESPELHADO___${index + 1}`] =
    //     contrato.TMOV_T_CODCCUSTO;

    //   formFields[`DESCRICAO_CODCCUSTO_ESPELHADO___${index + 1}`] =
    //     contrato.DESCRICAO_CODCCUSTO;

    //   Object.keys(objeto).map((item) => {
    //     if (item === "VALOR") {
    //       formFields[`TF_T_VALOR_RATEIO_ESPELHADO___${index + 1}`] =
    //         objeto[item];
    //     }

    //     if (item === "PERCENTUAL") {
    //       formFields[`TF_T_PERCENTUAL_RATEIO___${index + 1}`] = objeto[item];
    //     }

    //     if (item === "CODTBORCAMENTO") {
    //       formFields[`TMOV_T_CODTBORCAMENTO___${index + 1}`] = objeto[item];
    //     }

    //     if (item === "DESCRICAO_NAT") {
    //       formFields[`TMOV_T_TBORCAMENTO___${index + 1}`] = objeto[item];
    //     }

    //     if (item === "CODTBORCAMENTO") {
    //       formFields[`TMOV_T_CODTBORCAMENTO___${index + 1}`] = objeto[item];
    //     }

    //     if (item === "DESCRICAO_NAT") {
    //       formFields[`TMOV_T_TBORCAMENTO___${index + 1}`] = objeto[item];
    //     }
    //   });
    // });

    // listItems.forEach((item, index) => {
    //   const n = index + 1;
    //   formFields[`TITMMOV_T_CODCOLIGADA___${n}`] = contrato.TMOV_T_CODCOLIGADA ?? "1";
    //   formFields[`TITMMOV_T_IDMOV___${n}`] = "-1";
    //   formFields[`TITMMOV_T_IDMOVHST___${n}`] = "-1";
    //   formFields[`TITMMOV_T_NUMEROSEQUENCIAL___${n}`] = String(n);
    //   formFields[`TITMMOV_T_NSEQITMMOV___${n}`] = String(n);
    //   formFields[`TITMMOV_T_SEQF___${n}`] = item.TITMMOV_T_SEQF;
    //   formFields[`TITMMOV_T_IDPRD___${n}`] = item.TITMMOV_T_IDPRD ?? "";
    //   formFields[`TITMMOV_T_CODIGOPRD___${n}`] = item.TITMMOV_T_CODIGOPRD ?? "";
    //   formFields[`TITMMOV_T_NOMEFANTASIA___${n}`] = item.TITMMOV_T_NOMEFANTASIA ?? "";
    //   formFields[`TITMMOV_T_CODUND___${n}`] = item.TITMMOV_T_CODUND ?? "";
    //   formFields[`TITMMOV_T_CODTBORCAMENTO___${n}`] = item.TITMMOV_T_CODTBORCAMENTO ?? "";
    //   formFields[`TITMMOV_T_CODCOLTBORCAMENTO___${n}`] = "0";
    //   formFields[`TITMMOV_T_DESCTBORCAMENTO___${n}`] = item.TITMMOV_T_DESCTBORCAMENTO ?? "";
    //   formFields[`TITMMOV_T_QUANTIDADE___${n}`] = item.TITMMOV_T_QUANTIDADE ?? "";
    //   formFields[`TITMMOV_T_PRECOUNITARIO___${n}`] = item.TITMMOV_T_PRECOUNITARIO ?? "";
    //   formFields[`TITMMOV_T_VALORTOTALITEM___${n}`] = item.TITMMOV_T_VALORTOTALITEM ?? "";
    //   formFields[`TITMMOV_T_VALORBRUTOITEM___${n}`] = item.TITMMOV_T_VALORTOTALITEM ?? "";
    //   formFields[`TITMMOV_T_VALORLIQUIDO___${n}`] = item.TITMMOV_T_VALORTOTALITEM ?? "";
    //   formFields[`TITMMOV_T_VALORDESC___${n}`] = "0.00";
    //   formFields[`TITMMOV_T_VALORDESP___${n}`] = "0.00";
    //   formFields[`TITMMOV_T_PRECOTOTALEDITADO___${n}`] = "1";
    //   formFields[`TITMMOV_T_STATUSF___${n}`] = "A";
    // });

    // const keys = Object.keys(formFields);
    // const formDataResult = keys.map((key) => {
    //   return { name: key, value: formFields[key] };
    // });

    // Função auxiliar para transformar "200,00" em "200.00"
    const formatToSqlNum = (val: unknown) => {
      if (!val) return "0.00";
      return String(val)
        .replace("R$", "")     // Remove cifrão se existir
        .replace(/\./g, "")    // Remove ponto de milhar (ex: 1.250,00 -> 1250,00)
        .replace(",", ".")     // Troca vírgula por ponto decimal (ex: 1250,00 -> 1250.00)
        .trim();
    };

    listRateio.forEach((objeto, index) => {
      const i = index + 1;

      // 1. Tratamento do Centro de Custo
      let codCentroCusto = objeto.CODCCUSTO || contrato.TMOV_T_CODCCUSTO || "";
      if (String(codCentroCusto).toLowerCase() === "null" || !codCentroCusto) {
        codCentroCusto = "";
      }

      // 2. Campos espelhados
      formFields[`TMOV_T_CODCCUSTO_ESPELHADO___${i}`] = codCentroCusto;
      formFields[`DESCRICAO_CODCCUSTO_ESPELHADO___${i}`] = contrato.DESCRICAO_CODCCUSTO;

      // 3. Campos OFICIAIS (Aqui o valor PRECISA de ponto em vez de vírgula)
      formFields[`TITMMOVRATCCU_T_CODCCUSTO___${i}`] = codCentroCusto;
      formFields[`TITMMOVRATCCU_T_CODCOLIGADA___${i}`] = contrato.TMOV_T_CODCOLIGADA || "1";
      formFields[`TITMMOVRATCCU_T_STATUSF___${i}`] = "A";

      // 4. Mapeamento dinâmico com correção de formato numérico
      Object.keys(objeto).forEach((item) => {
        if (item === "VALOR") {
          const v = formatToSqlNum(objeto[item]);
          formFields[`TF_T_VALOR_RATEIO_ESPELHADO___${i}`] = v;
          formFields[`TITMMOVRATCCU_T_VALOR___${i}`] = v;
        }

        if (item === "PERCENTUAL") {
          const p = formatToSqlNum(objeto[item]);
          formFields[`TF_T_PERCENTUAL_RATEIO___${i}`] = p;
          formFields[`TITMMOVRATCCU_T_PERCENTUAL___${i}`] = p;
        }

        if (item === "CODTBORCAMENTO") {
          formFields[`TMOV_T_CODTBORCAMENTO___${i}`] = objeto[item];
        }

        if (item === "DESCRICAO_NAT") {
          formFields[`TMOV_T_TBORCAMENTO___${i}`] = objeto[item];
        }
      });
    });
    // --- TRATAMENTO DOS ITENS ---
    listItems.forEach((item, index) => {
      const n = index + 1;

      // Função auxiliar para evitar "null" em campos de texto
      const cleanValue = (val: unknown): string => {
        const stringValue = String(val);
        return stringValue.toLowerCase() === "null" || val === undefined ? "" : stringValue;
      };

      formFields[`TITMMOV_T_CODCOLIGADA___${n}`] = contrato.TMOV_T_CODCOLIGADA ?? "1";
      formFields[`TITMMOV_T_IDMOV___${n}`] = "-1";
      formFields[`TITMMOV_T_IDMOVHST___${n}`] = "-1";
      formFields[`TITMMOV_T_NUMEROSEQUENCIAL___${n}`] = String(n);
      formFields[`TITMMOV_T_NSEQITMMOV___${n}`] = String(n);
      formFields[`TITMMOV_T_SEQF___${n}`] = cleanValue(item.TITMMOV_T_SEQF);
      formFields[`TITMMOV_T_IDPRD___${n}`] = cleanValue(item.TITMMOV_T_IDPRD);
      formFields[`TITMMOV_T_CODIGOPRD___${n}`] = cleanValue(item.TITMMOV_T_CODIGOPRD);
      formFields[`TITMMOV_T_NOMEFANTASIA___${n}`] = cleanValue(item.TITMMOV_T_NOMEFANTASIA);
      formFields[`TITMMOV_T_CODUND___${n}`] = cleanValue(item.TITMMOV_T_CODUND);
      formFields[`TITMMOV_T_CODTBORCAMENTO___${n}`] = cleanValue(item.TITMMOV_T_CODTBORCAMENTO);
      formFields[`TITMMOV_T_CODCOLTBORCAMENTO___${n}`] = "0";
      formFields[`TITMMOV_T_DESCTBORCAMENTO___${n}`] = cleanValue(item.TITMMOV_T_DESCTBORCAMENTO);
      formFields[`TITMMOV_T_QUANTIDADE___${n}`] = cleanValue(item.TITMMOV_T_QUANTIDADE);
      formFields[`TITMMOV_T_PRECOUNITARIO___${n}`] = cleanValue(item.TITMMOV_T_PRECOUNITARIO);
      formFields[`TITMMOV_T_VALORTOTALITEM___${n}`] = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFields[`TITMMOV_T_VALORBRUTOITEM___${n}`] = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFields[`TITMMOV_T_VALORLIQUIDO___${n}`] = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFields[`TITMMOV_T_VALORDESC___${n}`] = "0.00";
      formFields[`TITMMOV_T_VALORDESP___${n}`] = "0.00";
      formFields[`TITMMOV_T_PRECOTOTALEDITADO___${n}`] = "1";
      formFields[`TITMMOV_T_STATUSF___${n}`] = "A";
    });

    // --- GERAÇÃO DO RESULTADO FINAL ---
    const keys = Object.keys(formFields);
    const formDataResult = keys.map((key) => {
      return { name: key, value: formFields[key] };
    });

    // const data = {
    //   targetState: 587,
    //   targetAssignee: usuario,
    //   subProcessTargetState: 0,
    //   comment: "Inserido pela tela de cadastro e contrato.",
    //   formFields,
    // };

    const data = {
      processInstanceId: 0,
      processId: "dw_cadastro_de_contrato",
      version: processVersion,
      taskUserId: window.WCMAPI.usercode,
      completeTask: true,
      currentMovto: 0,
      managerMode: false,
      selectedDestinyAfterAutomatic: -1,
      conditionAfterAutomatic: -1,
      selectedColleague: [],
      comments: "Inserido pela tela de cadastro e contrato.",
      newObservations: [],
      appointments: [],
      attachments: anexos,
      digitalSignature: false,
      formData: formDataResult,
      isDigitalSigned: false,
      versionDoc: 0,
      selectedState: 587,
      internalFields: [],
      transferTaskAfterSelection: false,
      currentState: 4,
    };
    console.log("data - save", data);

    return window.location.host.includes("localhost")
      ? data
      : await axios
        .post("/ecm/api/rest/ecm/workflowView/send", data)
        .then((d: any) => {
          const result = d.data.content;
          if (result.processInstanceId) {
            setNotaSelecionada({});
            setContrato({} as IContratoData);
            setOpenEdit(false);
            window.open(
              fluigConfig.visualizarProcesso + result.processInstanceId,
              "_blank",
            );
          }
        })
        .catch((e) => {
          setError(JSON.stringify(e.response.data));
          setOpenError(true);
        });
  }
  return { save };
}

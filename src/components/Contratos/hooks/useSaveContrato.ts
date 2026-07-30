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
    // --- 1 SOLICITAÇÃO INDEPENDENTE POR LINHA DE ITEM ---
    // Função auxiliar para evitar "null" em campos de texto
    const cleanValue = (val: unknown): string => {
      const stringValue = String(val);
      return stringValue.toLowerCase() === "null" || val === undefined ? "" : stringValue;
    };

    const isLocal = window.location.host.includes("localhost");
    const results: any[] = [];
    const erros: string[] = [];

    for (const item of listItems) {
      const formFieldsItem: any = { ...formFields };

      formFieldsItem.TITMMOV_T_CODCOLIGADA___1 =
        cleanValue(item.TITMMOV_T_CODCOLIGADA) || contrato.TMOV_T_CODCOLIGADA || "1";
      formFieldsItem.TITMMOV_T_CODFILIAL___1 =
        cleanValue(item.TITMMOV_T_CODFILIAL) || contrato.TMOV_T_CODFILIAL || "";
      formFieldsItem.TITMMOV_T_CGCFIL___1 =
        cleanValue(item.TITMMOV_T_CGCFIL) || contrato.TMOV_T_CGCFIL || "";
      formFieldsItem.TITMMOV_T_DESCRICAO_CODFILIAL___1 =
        cleanValue(item.TITMMOV_T_DESCRICAO_CODFILIAL) || contrato.DESCRICAO_CODFILIAL || "";
      formFieldsItem.TITMMOV_T_CODCCUSTO___1 =
        cleanValue(item.TITMMOV_T_CODCCUSTO) || contrato.TMOV_T_CODCCUSTO || "";
      formFieldsItem.TITMMOV_T_DESCRICAO_CODCCUSTO___1 =
        cleanValue(item.TITMMOV_T_DESCRICAO_CODCCUSTO) || contrato.DESCRICAO_CODCCUSTO || "";
      formFieldsItem.TITMMOV_T_IDMOV___1 = "-1";
      formFieldsItem.TITMMOV_T_IDMOVHST___1 = "-1";
      formFieldsItem.TITMMOV_T_NUMEROSEQUENCIAL___1 = "1";
      formFieldsItem.TITMMOV_T_NSEQITMMOV___1 = "1";
      formFieldsItem.TITMMOV_T_SEQF___1 = cleanValue(item.TITMMOV_T_SEQF);
      formFieldsItem.TITMMOV_T_IDPRD___1 = cleanValue(item.TITMMOV_T_IDPRD);
      formFieldsItem.TITMMOV_T_CODIGOPRD___1 = cleanValue(item.TITMMOV_T_CODIGOPRD);
      formFieldsItem.TITMMOV_T_NOMEFANTASIA___1 = cleanValue(item.TITMMOV_T_NOMEFANTASIA);
      formFieldsItem.TITMMOV_T_CODUND___1 = cleanValue(item.TITMMOV_T_CODUND);
      formFieldsItem.TITMMOV_T_CODTBORCAMENTO___1 = cleanValue(item.TITMMOV_T_CODTBORCAMENTO);
      formFieldsItem.TITMMOV_T_CODCOLTBORCAMENTO___1 = "0";
      formFieldsItem.TITMMOV_T_DESCTBORCAMENTO___1 = cleanValue(item.TITMMOV_T_DESCTBORCAMENTO);
      formFieldsItem.TITMMOV_T_QUANTIDADE___1 = cleanValue(item.TITMMOV_T_QUANTIDADE);
      formFieldsItem.TITMMOV_T_PRECOUNITARIO___1 = cleanValue(item.TITMMOV_T_PRECOUNITARIO);
      formFieldsItem.TITMMOV_T_VALORTOTALITEM___1 = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFieldsItem.TITMMOV_T_VALORBRUTOITEM___1 = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFieldsItem.TITMMOV_T_VALORLIQUIDO___1 = cleanValue(item.TITMMOV_T_VALORTOTALITEM);
      formFieldsItem.TITMMOV_T_VALORDESC___1 = "0.00";
      formFieldsItem.TITMMOV_T_VALORDESP___1 = "0.00";
      formFieldsItem.TITMMOV_T_PRECOTOTALEDITADO___1 = "1";
      formFieldsItem.TITMMOV_T_STATUSF___1 = "A";

      // Cabeçalho da solicitação (TMOV_T_*/TCNT_T_*) deve refletir o emissor (fornecedor) e
      // o centro de custo DESTE item, não o último selecionado no contrato compartilhado.
      // Destinatário/Coligada/Filial voltou a ser único por contrato (ColigadaFilialForm),
      // por isso não é mais sobrescrito aqui.
      formFieldsItem.TMOV_T_CODCFO =
        cleanValue(item.TITMMOV_T_CODCFO) || contrato.TMOV_T_CODCFO || "";
      formFieldsItem.DESCRICAO_CODCFO =
        cleanValue(item.TITMMOV_T_DESCRICAO_CODCFO) || contrato.DESCRICAO_CODCFO || "";
      formFieldsItem.TMOV_T_CGCCFO =
        cleanValue(item.TITMMOV_T_CGCCFO) || contrato.TMOV_T_CGCCFO || "";
      formFieldsItem.TMOV_T_CODCOLCFO =
        cleanValue(item.TITMMOV_T_CODCOLCFO) ||
        contrato.TMOV_T_CODCOLCFO ||
        contrato.TMOV_T_CODCOLIGADA ||
        "";
      formFieldsItem.TMOV_T_CODCCUSTO =
        cleanValue(item.TITMMOV_T_CODCCUSTO) || contrato.TMOV_T_CODCCUSTO || "";
      formFieldsItem.DESCRICAO_CODCCUSTO =
        cleanValue(item.TITMMOV_T_DESCRICAO_CODCCUSTO) || contrato.DESCRICAO_CODCCUSTO || "";
      formFieldsItem.TCNT_T_CODCCUSTO =
        cleanValue(item.TITMMOV_T_CODCCUSTO) || contrato.TCNT_T_CODCCUSTO || contrato.TMOV_T_CODCCUSTO || "";

      const keys = Object.keys(formFieldsItem);
      const formDataResult = keys.map((key) => {
        return { name: key, value: formFieldsItem[key] };
      });

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
      console.log(`data - save item ${item.TITMMOV_T_SEQF}`, data);

      if (isLocal) {
        results.push(data);
        continue;
      }

      try {
        const d: any = await axios.post("/ecm/api/rest/ecm/workflowView/send", data);
        const result = d.data.content;
        results.push(result);
        if (result.processInstanceId) {
          window.open(
            fluigConfig.visualizarProcesso + result.processInstanceId,
            "_blank",
          );
        }
      } catch (e: any) {
        erros.push(
          `Item ${item.TITMMOV_T_NOMEFANTASIA ?? item.TITMMOV_T_SEQF}: ${JSON.stringify(e.response?.data)}`,
        );
      }
    }

    if (!isLocal) {
      setNotaSelecionada({});
      setContrato({} as IContratoData);
      setOpenEdit(false);
    }

    if (erros.length > 0) {
      setError(erros.join("\n"));
      setOpenError(true);
    }

    return results;
  }
  return { save };
}

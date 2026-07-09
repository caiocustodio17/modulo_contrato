/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import fluigConfig from "../../config";
import formatChaveNFE from "../../utils/formatChaveNFE";
import { useUploadFile } from "../AnexarDocumentos/useUploadFile";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";

import {
  ISolicitacaoPagamento,
  ITItmmov,
  ITmovpagto,
} from "./@types/SolicitacaoPagamentoType";
import useSolicitacaoPagamentoContext from "./useSolicitacaoPagamentoContext";
import { useEffect, useState } from "react";
import { sqlBody } from "../../utils/sqlBody";
export default function useSolicitacaoPagamento() {
  const {
    contrato,
    notaSelecioanda,
    clearContext,
    setOpenMedicao,
    setError,
    setOpenError,
    setPageLoading,
    uploadedFile,
    listRateio
    //uploadDocuments
  } = useContratoContext();
  const { solicitacaoPagamento, listItems, listPagto, listRateios, setListRateios } =
    useSolicitacaoPagamentoContext();

  // 📊 Sincroniza automaticamente o rateio com os valores dos itens
  useEffect(() => {
    const totalItens = listItems.reduce(
      (acc, i) => acc + parseFloat(i.TITMMOV_T_VALORTOTALITEM || "0"),
      0
    );

    if (totalItens <= 0 || listRateios.length === 0) return;

    const somaPercentual = listRateios.reduce(
      (acc, r) => acc + parseFloat(r.PERCENTUAL),
      0
    );

    const novosRateios = listRateios.map((r, idx) => {
      const percentual = parseFloat(r.PERCENTUAL);
      const novoValor = (totalItens * percentual) / somaPercentual;
      console.log(`♻️ Rateio ${idx + 1} recalculado: ${percentual}% = R$ ${novoValor.toFixed(2)}`);
      return { ...r, VALOR: novoValor.toFixed(2) };
    });

    setListRateios(novosRateios);
  }, [listItems]);

  const { handleAttachmentFileProcess } = useUploadFile();
  // const [verifyValueMaximum, setVerifyValueMaximum] = useState({ PORCENTAGEM: 0.0, VALOR_MAXIMO: 0.0 });
  const [verifyValueMaximum] = useState({ PORCENTAGEM: 0.0, VALOR_MAXIMO: 0.0 });
  // const [processVersion,] = useState<string>();
  const [, setExplodedBudget] = useState(false)
  const [dataFornecedor, setDataFornecedor] = useState({ OPTANTEPELOSIMPLES: '', PORTE: '' });


  useEffect(() => {
    if (listRateio.length > 0) {
      setListRateios(listRateio);
    }
  }, [listRateio, setListRateios]);

  const valorEsperado = (mesFaturamento: string) => {
    if (mesFaturamento == "01") return contrato?.TF_T_VALOR_01;
    if (mesFaturamento == "02") return contrato?.TF_T_VALOR_02;
    if (mesFaturamento == "03") return contrato?.TF_T_VALOR_03;
    if (mesFaturamento == "04") return contrato?.TF_T_VALOR_04;
    if (mesFaturamento == "05") return contrato?.TF_T_VALOR_05;
    if (mesFaturamento == "06") return contrato?.TF_T_VALOR_06;
    if (mesFaturamento == "07") return contrato?.TF_T_VALOR_07;
    if (mesFaturamento == "08") return contrato?.TF_T_VALOR_08;
    if (mesFaturamento == "09") return contrato?.TF_T_VALOR_09;
    if (mesFaturamento == "10") return contrato?.TF_T_VALOR_10;
    if (mesFaturamento == "11") return contrato?.TF_T_VALOR_11;
    if (mesFaturamento == "12") return contrato?.TF_T_VALOR_12;
  };

  useEffect(() => {
    const totalizador = listItems
      .reduce((soma, item) => {
        return soma + parseFloat(item.TITMMOV_T_VALORTOTALITEM ?? "0");
      }, 0)
      .toFixed(2);

    const mesFaturamento =
      solicitacaoPagamento.TCNT_T_MONTH?.split("-")[1] ?? "01";

    const valorEsperadoMes = Number(valorEsperado(mesFaturamento) ?? 0)
    const maximumValuePercent = valorEsperadoMes * (verifyValueMaximum.PORCENTAGEM / 100) + valorEsperadoMes
    const maximumValueMoney = valorEsperadoMes + verifyValueMaximum.VALOR_MAXIMO
    if (parseFloat(totalizador) > maximumValuePercent || parseFloat(totalizador) > maximumValueMoney) {
      setExplodedBudget(true)
    }
  }, [verifyValueMaximum])

  useEffect(() => {
    async function getFornecedorData() {
      await axios({
        url: fluigConfig.produtos,
        method: fluigConfig.method,
        data: sqlBody({
          codSentenca: "FL.DS.G.4.1",
          parameters: 'CODCFO=' + contrato.TMOV_T_CODCFO
        }),
      })
        .then((r) => {
          const error = r.data.content.values[0].ERRO;
          if (error) throw Error(error);

          const dados = JSON.parse(r.data.content.values[0].MESSAGE);
          let porte = ''
          if (dados.PORTE == 0) {
            porte = "Normal"
          } else if (dados.PORTE == 1) {
            porte = "ME - Micro Empresa"
          } else if (dados.PORTE == 2) {
            porte = "EPP - Empresa Pequeno Porte"
          } else {
            porte = "MEI - Micro Empreendedor Individual"
          }

          let optaSimples = ''
          if (dados.OPTANTEPELOSIMPLES == 1) {
            optaSimples = "Optante"
          } else {
            optaSimples = "Não optante"
          }
          setDataFornecedor({ OPTANTEPELOSIMPLES: optaSimples, PORTE: porte });
          setError("");
        })
        .catch((e) => {
          setError(e instanceof AxiosError ? e.message : String(e));
          setOpenError(true);
          console.error("getForncedorData - error: ", e);
        })
    }

    getFornecedorData()
  }, [])

  // async function handleSaveClick() {
  //   console.log("📌 [handleSaveClick] Itens da lista (listItems): ", listItems);
  //   setPageLoading(true);
  //   let formFields: any = {};

  //   // 1. Processamento dos Itens do Movimento
  //   listItems.forEach((objeto, index) => {
  //     const itemIndex = index + 1;

  //     const quantidadeStr = String(objeto.TITMMOV_T_QUANTIDADE ?? "0").replace(',', '.');
  //     const precoUnicoStr = String(objeto.TITMMOV_T_PRECOUNITARIO ?? "0").replace(',', '.');

  //     const quantidade = parseFloat(quantidadeStr) || 0;
  //     const precoUnico = parseFloat(precoUnicoStr) || 0;

  //     const valorTotalItemFloat = quantidade * precoUnico;
  //     const valorTotalItemArredondado = Math.round(valorTotalItemFloat * 100) / 100;
  //     const valorTotalItemString = valorTotalItemArredondado.toFixed(2);

  //     Object.keys(objeto).forEach((key) => {
  //       const value = objeto[key as keyof ITItmmov];

  //       if (value === null || value === undefined || String(value).toLowerCase() === "null") {
  //         formFields[`${key}___${itemIndex}`] = "";
  //       } else {
  //         formFields[`${key}___${itemIndex}`] =
  //           typeof value === "string" ? value.replace(',', '.') : value;
  //       }
  //     });

  //     formFields[`TITMMOV_T_VALORBRUTOITEM___${itemIndex}`] = valorTotalItemString;
  //     formFields[`TITMMOV_T_VALORTOTALITEM___${itemIndex}`] = valorTotalItemString;
  //     formFields[`TITMMOV_T_VALORLIQUIDO___${itemIndex}`] = valorTotalItemString;
  //     formFields[`TITMMOV_T_IDMOV___${itemIndex}`] = "-1";

  //     const seq = objeto.TITMMOV_T_SEQF || String(itemIndex);
  //     formFields[`TITMMOV_T_NSEQITMMOV___${itemIndex}`] = seq;
  //     formFields[`TITMMOVRATCCU_T_NSEQITMMOV___${itemIndex}`] = seq;
  //     formFields[`TITMMOVRATCCU_T_IDMOV___${itemIndex}`] = "-1";
  //     formFields[`TITMMOVRATCCU_T_SEQF___${itemIndex}`] = itemIndex.toString();

  //     formFields[`TITMMOV_T_CODCOLTBORCAMENTO___${itemIndex}`] = "0";
  //     // formFields[`TITMMOVCOMPL_T_TOL_VALORFIL___${itemIndex}`] = contrato.TOL_VALORFIL || "";
  //     // formFields[`TITMMOVCOMPL_T_TOL_PERCFIL___${itemIndex}`] = "-1";
  //     // formFields[`TITMMOVCOMPL_T_IDMOV___${itemIndex}`] = "-1";
  //     // formFields[`TITMMOVCOMPL_T_TOL_PRECOGLB___${itemIndex}`] = contrato.TOL_PERCGLB || "";
  //     // formFields[`TITMMOVCOMPL_T_TOL_VALORGLB___${itemIndex}`] = contrato.TOL_VALORGLB || "";
  //     // formFields[`TITMMOVCOMPL_T_TOL_VALORGERAL___${itemIndex}`] = contrato.TOL_VALORGERAL || "";
  //     // formFields[`TITMMOVCOMPL_T_TOL_PERCGERAL___${itemIndex}`] = contrato.TOL_PERCGERAL || "";
  //     // Se o valor for vazio, mandamos "0" para não quebrar a conversão de INT/FLOAT no SQL
  //     formFields[`TITMMOVCOMPL_T_TOL_VALORFIL___${itemIndex}`] = contrato.TOL_VALORFIL && contrato.TOL_VALORFIL !== "" ? contrato.TOL_VALORFIL : "0";
  //     formFields[`TITMMOVCOMPL_T_TOL_PERCFIL___${itemIndex}`] = "-1";
  //     formFields[`TITMMOVCOMPL_T_IDMOV___${itemIndex}`] = "-1";
  //     formFields[`TITMMOVCOMPL_T_TOL_PRECOGLB___${itemIndex}`] = contrato.TOL_PERCGLB && contrato.TOL_PERCGLB !== "" ? contrato.TOL_PERCGLB : "0";
  //     formFields[`TITMMOVCOMPL_T_TOL_VALORGLB___${itemIndex}`] = contrato.TOL_VALORGLB && contrato.TOL_VALORGLB !== "" ? contrato.TOL_VALORGLB : "0";
  //     formFields[`TITMMOVCOMPL_T_TOL_VALORGERAL___${itemIndex}`] = contrato.TOL_VALORGERAL && contrato.TOL_VALORGERAL !== "" ? contrato.TOL_VALORGERAL : "0";
  //     formFields[`TITMMOVCOMPL_T_TOL_PERCGERAL___${itemIndex}`] = contrato.TOL_PERCGERAL && contrato.TOL_PERCGERAL !== "" ? contrato.TOL_PERCGERAL : "0";
  //   });

  //   // 2. Processamento Distribuído do Rateio
  //   let linhaRateioGlobal = 0;
  //   const totalItensDocumento = listItems.reduce(
  //     (acc, i) => acc + parseFloat(i.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0"), 0
  //   );
  //   const somaPercentualRateio = listRateios.reduce(
  //     (acc, r) => acc + parseFloat(r.PERCENTUAL), 0
  //   );

  //   listItems.forEach((objetoItem) => {
  //     const itemSequencialPai = objetoItem.TITMMOV_T_SEQF;
  //     const valorItem = parseFloat(objetoItem.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0");

  //     listRateios.forEach((r, indexRateio) => {
  //       const isLast = indexRateio === listRateios.length - 1;
  //       linhaRateioGlobal++;
  //       const i = linhaRateioGlobal;

  //       const percentual = parseFloat(r.PERCENTUAL);
  //       const valorIndividual = (valorItem * percentual) / somaPercentualRateio;
  //       let valorFormatado = valorIndividual.toFixed(2);

  //       if (linhaRateioGlobal === (listItems.length * listRateios.length)) {
  //         const somaDosRateiosCalculados = (totalItensDocumento - valorItem) + valorIndividual;
  //         const diferencaTotal = totalItensDocumento - somaDosRateiosCalculados;

  //         if (Math.abs(diferencaTotal) >= -5.00 && Math.abs(diferencaTotal) <= 0.05) {
  //           valorFormatado = (parseFloat(valorFormatado) + diferencaTotal).toFixed(2);
  //         }
  //       }

  //       formFields[`TITMMOVRATCCU_T_CODCOLIGADA___${i}`] = contrato.TMOV_T_CODCOLIGADA;
  //       formFields[`TITMMOVRATCCU_T_IDMOV___${i}`] = "-1";
  //       formFields[`TITMMOVRATCCU_T_NSEQITMMOV___${i}`] = itemSequencialPai;
  //       formFields[`TITMMOVRATCCU_T_IDMOVRATCCU___${i}`] = "-1";
  //       formFields[`TITMMOVRATCCU_T_STATUSF___${i}`] = "A";
  //       formFields[`TITMMOVRATCCU_T_SEQF___${i}`] = i;

  //       const codCentroCusto = (r.CODCCUSTO && String(r.CODCCUSTO).toLowerCase() !== "null") ? r.CODCCUSTO : "";
  //       formFields[`TITMMOVRATCCU_T_CODCCUSTO___${i}`] = codCentroCusto;

  //       const nomeCentroCusto = (r.NOME && String(r.NOME).toLowerCase() !== "null") ? r.NOME : "";
  //       formFields[`DESCRICAO_CODCCUSTO_PXF___${i}`] = nomeCentroCusto;

  //       formFields[`TITMMOVRATCCU_T_PERCENTUAL___${i}`] = r.PERCENTUAL;

  //       if (isLast) {
  //         const diferencaItem = (valorItem - (indexRateio * parseFloat(valorFormatado))).toFixed(2);
  //         formFields[`TITMMOVRATCCU_T_VALOR___${i}`] = diferencaItem;
  //       } else {
  //         formFields[`TITMMOVRATCCU_T_VALOR___${i}`] = valorFormatado;
  //       }
  //     });
  //   });

  //   // 3. Processamento de Pagamento
  //   listPagto.forEach((objeto, index) => {
  //     Object.keys(objeto).map((item) => {
  //       formFields[`${item}___${index + 1}`] = objeto[item as keyof ITmovpagto];
  //     });
  //     formFields[`TMOVPAGTO_T_CODCOLIGADA___${index + 1}`] = contrato.TMOV_T_CODCOLIGADA;
  //     formFields[`TMOVPAGTO_T_IDMOV___${index + 1}`] = "-1";
  //     formFields[`TMOVPAGTO_T_IDSEQPAGTO___${index + 1}`] = "-1";
  //     formFields[`TMOVPAGTO_T_DESCFORMAPAGTO___${index + 1}`] = "Boleto";
  //     formFields[`TMOVPAGTO_T_IDFORMAPAGTO___${index + 1}`] = "1";
  //     formFields[`TMOVPAGTO_T_TIPOPFORMAPAGTO___${index + 1}`] = "3";
  //   });

  //   const totalizador = listItems
  //     .reduce((soma, item) => soma + parseFloat(item.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0"), 0)
  //     .toFixed(2);

  //   const mesFaturamento = solicitacaoPagamento.TCNT_T_MONTH?.split("-")[1] ?? "01";

  //   const novasolicitacao: ISolicitacaoPagamento = {
  //     ...solicitacaoPagamento,
  //     CGC: contrato.TMOV_T_CGCCOL,
  //     CGCFILIAL: contrato.TMOV_T_CGCFIL,
  //     OPTASIMPLES: dataFornecedor.OPTANTEPELOSIMPLES,
  //     PORTE_DESCRICAO: dataFornecedor.PORTE,
  //     TCNT_T_CODCCUSTO: contrato.TMOV_T_CODCCUSTO,
  //     TCNT_T_CODCFO: contrato.TMOV_T_CODCFO,
  //     TCNT_T_CODCOLCFO: contrato.TMOV_T_CODCOLCFO,
  //     TCNT_T_CODCONTRATO: contrato.TF_T_CODCONTRATO,
  //     TCNT_T_CODCOLTBORCAMENTO: "0",
  //     TCNT_T_CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO,
  //     TCNT_T_VALOR: valorEsperado(mesFaturamento),
  //     TCNT_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
  //     TCNT_T_CODFILIAL: contrato.TMOV_T_CODFILIAL,
  //     TCNT_T_IDCONTRATO: contrato.IDFLUIG,
  //     TCNT_T_CONTRATO: contrato.TF_T_CONTRATO,
  //     TCNT_T_DESCTBORCAMENTO: contrato.TMOV_T_TBORCAMENTO,
  //     TCNT_T_IDCONTRATO_ORIG: contrato.IDFLUIG,
  //     TMOV_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
  //     TMOV_T_IDMOV: "-1",
  //     TMOVCOMPL_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
  //     TMOVCOMPL_T_IDMOV: "-1",
  //     TMOV_T_CODCOLCFO: contrato.TMOV_T_CODCOLCFO,
  //     DESCRICAO_CODCOLIGADA: contrato.DESCRICAO_CODCOLIGADA,
  //     DESCRICAO_CODFILIALENTREGA: contrato.DESCRICAO_CODFILIAL,
  //     TMOV_T_CODFILIALENTREGA: contrato.TMOV_T_CODFILIAL,
  //     DESCRICAO_CODLOCENTREGA: "Almoxarifado",
  //     TMOV_T_CODLOCENTREGA: "01.001",
  //     TMOV_T_CODFILIAL: contrato.TMOV_T_CODFILIAL,
  //     DESCRICAO_CODFILIAL: contrato.DESCRICAO_CODFILIAL,
  //     TMOV_T_CODCFO: contrato.TMOV_T_CODCFO,
  //     DESCRICAO_CODCFO: contrato.DESCRICAO_CODCFO,
  //     TMOV_T_CGCCFO: contrato.TMOV_T_CGCCFO,
  //     TMOV_T_DATASAIDA: new Date().toISOString().split("T")[0],
  //     TMOV_T_CODCCUSTO: contrato.TMOV_T_CODCCUSTO,
  //     DESCRICAO_CODCCUSTO: contrato.DESCRICAO_CODCCUSTO,
  //     TMOV_T_VALORBRUTO: totalizador,
  //     TMOV_T_VALORLIQUIDO: totalizador,
  //     TMOV_T_DESCIDFORMAPAGTO: "Boleto",
  //     TMOV_T_IDFORMAPAGTO: "1",
  //     TMOV_T_CHAVEACESSONFE: formatChaveNFE(solicitacaoPagamento.TMOV_T_CHAVEACESSONFE ?? ""),
  //     TF_T_TIPOCANCEL: "BOLETO",
  //     TMOVCOMPL_T_IDV360: notaSelecioanda.id?.toString() ?? "-1",
  //   };

  //   formFields = { ...formFields, ...novasolicitacao };

  //   let versionTarget = processVersion;
  //   console.log("versionTarget:", versionTarget);
  //   console.log("usercode:", window.WCMAPI.usercode);

  //   // 4. 🔥 BUSCA DA VERSÃO DO PROCESSO OBRIGATORIAMENTE ANTES DO ENVIO
  //   try {
  //     const vResponse = await axios.get(
  //       // "https://nucleode139195.fluig.cloudtotvs.com.br:1350/process-management/api/v2/processes/dw_cadastro_de_contrato/process-versions?page=1&pageSize=1&active=true&fields=version"
  //       "https://nucleode139195.fluig.cloudtotvs.com.br:1350/process-management/api/v2/processes/solicitacao_de_pagamento_v2/process-versions?page=1&pageSize=1&active=true&fields=version"
  //     );
  //     versionTarget = vResponse.data.items[0].version;
  //   } catch (err) {
  //     console.error("Erro ao obter versão do processo dinamicamente, utilizando fallback", err);
  //   }

  //   const anexos = uploadedFile.length >= 1 ? uploadedFile.map((e) => {
  //     return {
  //       id: 1, fullPath: "BPM", droppedZipZone: false, name: e, newAttach: true, description: e, documentId: 0,
  //       attachedUser: window.WCMAPI.user, attachedActivity: "Início", attachments: [{ attach: false, principal: true, fileName: e }],
  //       hasOwnSubMenu: true, enablePublish: false, enableEdit: false, enableEditContent: false, fromUpload: true,
  //       enableDownload: false, hasMoreOptions: false, iconClass: "fluigicon-file-upload", iconUrl: false, colleagueId: window.WCMAPI.usercode
  //     }
  //   }) : [];

  //   // 5. 🧼 LÓGICA DE SANITIZAÇÃO ABSOLUTA (Limpa qualquer string "null" de todo o formFields)
  //   const cleanFormFields: any = {};
  //   Object.keys(formFields).forEach((key) => {
  //     let value = formFields[key];
  //     if (value === null || value === undefined || String(value).toLowerCase() === "null") {
  //       value = "";
  //     }

  //     // Se for um campo complementar ou chave técnica e estiver vazio, força "0" pro backend do Fluig não quebrar
  //     if (value === "" && (
  //       key.includes("TOL_") ||
  //       key.includes("CODCOL") ||
  //       key.includes("IDMOV") ||
  //       key.includes("CHAVEACESSONFE")
  //     )) {
  //       value = "0";
  //     }

  //     // Correção para a chave de acesso específica
  //     if (key === "TMOV_T_CHAVEACESSONFE" && value === "0") {
  //       value = ""; // Chave de acesso precisa ser string vazia legítima se não houver NFe
  //     }

  //     cleanFormFields[key] = value;
  //   });

  //   // Gera o mapeamento final com os campos limpos de strings nocivas
  //   const keys = Object.keys(cleanFormFields);
  //   const formDataResult = keys.map((key) => {
  //     return { name: key, value: cleanFormFields[key] };
  //   });

  //   const fluigUserCode = window.WCMAPI?.usercode || window.parent?.WCMAPI?.usercode || "";

  //   const data = {
  //     processInstanceId: 0,
  //     processId: "solicitacao_de_pagamento_v2",
  //     version: versionTarget || 77, // Versão obtida de forma síncrona/resolvida
  //     taskUserId: fluigUserCode,
  //     completeTask: true,
  //     currentMovto: 0,
  //     managerMode: false,
  //     selectedDestinyAfterAutomatic: -1,
  //     conditionAfterAutomatic: -1,
  //     selectedColleague: [],
  //     comments: "Inserido pela tela de cadastro e contrato.",
  //     newObservations: [],
  //     appointments: [],
  //     attachments: anexos,
  //     digitalSignature: false,
  //     formData: formDataResult,
  //     isDigitalSigned: false,
  //     versionDoc: 0,
  //     selectedState: 4,
  //     targetState: 4,
  //     internalFields: [],
  //     transferTaskAfterSelection: false,
  //     currentState: 0,
  //   };

  //   console.log("📥 Payload Sanitizado Pronto Para Envio: ", data);

  //   if (window.location.host.includes("localhost")) {
  //     return data;
  //   }

  //   await axios
  //     .post("/ecm/api/rest/ecm/workflowView/send", data)
  //     .then((d) => {
  //       const result = d.data.content;
  //       if (result.processInstanceId) {
  //         void handleAttachmentFileProcess(result);
  //         window.open(fluigConfig.visualizarProcesso + result.processInstanceId, "_blank");
  //         handleCancel();
  //       }
  //     })
  //     .catch((e) => {
  //       console.log("Erro full: ", e);
  //       setError(
  //         e instanceof AxiosError
  //           ? e.response?.data?.message?.message
  //             ? e.response.data.message.message
  //             : e.response?.data || e.message
  //           : String(e)
  //       );
  //       setOpenError(true);
  //       setPageLoading(false);
  //     });
  // }

  async function handleSaveClick() {
    console.log("📌 [handleSaveClick] Itens da lista (listItems): ", listItems);
    setPageLoading(true);
    let formFields: any = {};

    // --- CAPTURA DINÂMICA DO USUÁRIO LOGADO NO FLUIG ---
    let fluigUserCode = "";
    try {
      const userResponse = await axios.get("/api/public/2.0/users/getCurrent");
      if (userResponse.data?.content?.code) {
        fluigUserCode = userResponse.data.content.code;
      }
    } catch (err) {
      console.error("Erro ao obter o usuário logado via API pública:", err);
      fluigUserCode = window.WCMAPI?.usercode || (window.parent as any)?.WCMAPI?.usercode || "";
    }

    if (!fluigUserCode) {
      setError("Não foi possível identificar o seu usuário ativo no Fluig para oficializar o processo.");
      setOpenError(true);
      setPageLoading(false);
      return;
    }

    // 1. Processamento dos Itens do Movimento
    listItems.forEach((objeto, index) => {
      const itemIndex = index + 1;

      const quantidadeStr = String(objeto.TITMMOV_T_QUANTIDADE ?? "0").replace(',', '.');
      const precoUnicoStr = String(objeto.TITMMOV_T_PRECOUNITARIO ?? "0").replace(',', '.');

      const quantidade = parseFloat(quantidadeStr) || 0;
      const precoUnico = parseFloat(precoUnicoStr) || 0;

      const valorTotalItemFloat = quantidade * precoUnico;
      const valorTotalItemArredondado = Math.round(valorTotalItemFloat * 100) / 100;
      const valorTotalItemString = valorTotalItemArredondado.toFixed(2);

      Object.keys(objeto).forEach((key) => {
        const value = objeto[key as keyof ITItmmov];

        if (value === null || value === undefined || String(value).toLowerCase() === "null") {
          formFields[`${key}___${itemIndex}`] = "";
        } else {
          formFields[`${key}___${itemIndex}`] =
            typeof value === "string" ? value.replace(',', '.') : value;
        }
      });

      formFields[`TITMMOV_T_VALORBRUTOITEM___${itemIndex}`] = valorTotalItemString;
      formFields[`TITMMOV_T_VALORTOTALITEM___${itemIndex}`] = valorTotalItemString;
      formFields[`TITMMOV_T_VALORLIQUIDO___${itemIndex}`] = valorTotalItemString;
      formFields[`TITMMOV_T_IDMOV___${itemIndex}`] = "-1";

      const seq = objeto.TITMMOV_T_SEQF || String(itemIndex);
      formFields[`TITMMOV_T_NSEQITMMOV___${itemIndex}`] = seq;
      formFields[`TITMMOVRATCCU_T_NSEQITMMOV___${itemIndex}`] = seq;
      formFields[`TITMMOVRATCCU_T_IDMOV___${itemIndex}`] = "-1";
      formFields[`TITMMOVRATCCU_T_SEQF___${itemIndex}`] = itemIndex.toString();

      formFields[`TITMMOV_T_CODCOLTBORCAMENTO___${itemIndex}`] = "0";
      formFields[`TITMMOVCOMPL_T_TOL_VALORFIL___${itemIndex}`] = contrato.TOL_VALORFIL && contrato.TOL_VALORFIL !== "" ? contrato.TOL_VALORFIL : "0";
      formFields[`TITMMOVCOMPL_T_TOL_PERCFIL___${itemIndex}`] = "-1";
      formFields[`TITMMOVCOMPL_T_IDMOV___${itemIndex}`] = "-1";
      formFields[`TITMMOVCOMPL_T_TOL_PRECOGLB___${itemIndex}`] = contrato.TOL_PERCGLB && contrato.TOL_PERCGLB !== "" ? contrato.TOL_PERCGLB : "0";
      formFields[`TITMMOVCOMPL_T_TOL_VALORGLB___${itemIndex}`] = contrato.TOL_VALORGLB && contrato.TOL_VALORGLB !== "" ? contrato.TOL_VALORGLB : "0";
      formFields[`TITMMOVCOMPL_T_TOL_VALORGERAL___${itemIndex}`] = contrato.TOL_VALORGERAL && contrato.TOL_VALORGERAL !== "" ? contrato.TOL_VALORGERAL : "0";
      formFields[`TITMMOVCOMPL_T_TOL_PERCGERAL___${itemIndex}`] = contrato.TOL_PERCGERAL && contrato.TOL_PERCGERAL !== "" ? contrato.TOL_PERCGERAL : "0";
    });

    // 2. Processamento Distribuído do Rateio
    let linhaRateioGlobal = 0;
    const totalItensDocumento = listItems.reduce(
      (acc, i) => acc + parseFloat(i.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0"), 0
    );
    const somaPercentualRateio = listRateios.reduce(
      (acc, r) => acc + parseFloat(r.PERCENTUAL), 0
    );

    listItems.forEach((objetoItem) => {
      const itemSequencialPai = objetoItem.TITMMOV_T_SEQF;
      const valorItem = parseFloat(objetoItem.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0");

      listRateios.forEach((r, indexRateio) => {
        const isLast = indexRateio === listRateios.length - 1;
        linhaRateioGlobal++;
        const i = linhaRateioGlobal;

        const percentual = parseFloat(r.PERCENTUAL);
        const valorIndividual = (valorItem * percentual) / somaPercentualRateio;
        let valorFormatado = valorIndividual.toFixed(2);

        if (linhaRateioGlobal === (listItems.length * listRateios.length)) {
          const somaDosRateiosCalculados = (totalItensDocumento - valorItem) + valorIndividual;
          const diferencaTotal = totalItensDocumento - somaDosRateiosCalculados;

          if (Math.abs(diferencaTotal) >= -5.00 && Math.abs(diferencaTotal) <= 0.05) {
            valorFormatado = (parseFloat(valorFormatado) + diferencaTotal).toFixed(2);
          }
        }

        formFields[`TITMMOVRATCCU_T_CODCOLIGADA___${i}`] = contrato.TMOV_T_CODCOLIGADA;
        formFields[`TITMMOVRATCCU_T_IDMOV___${i}`] = "-1";
        formFields[`TITMMOVRATCCU_T_NSEQITMMOV___${i}`] = itemSequencialPai;
        formFields[`TITMMOVRATCCU_T_IDMOVRATCCU___${i}`] = "-1";
        formFields[`TITMMOVRATCCU_T_STATUSF___${i}`] = "A";
        formFields[`TITMMOVRATCCU_T_SEQF___${i}`] = i;

        const codCentroCusto = (r.CODCCUSTO && String(r.CODCCUSTO).toLowerCase() !== "null") ? r.CODCCUSTO : "";
        formFields[`TITMMOVRATCCU_T_CODCCUSTO___${i}`] = codCentroCusto;

        const nomeCentroCusto = (r.NOME && String(r.NOME).toLowerCase() !== "null") ? r.NOME : "";
        formFields[`DESCRICAO_CODCCUSTO_PXF___${i}`] = nomeCentroCusto;

        formFields[`TITMMOVRATCCU_T_PERCENTUAL___${i}`] = r.PERCENTUAL;

        if (isLast) {
          const diferencaItem = (valorItem - (indexRateio * parseFloat(valorFormatado))).toFixed(2);
          formFields[`TITMMOVRATCCU_T_VALOR___${i}`] = diferencaItem;
        } else {
          formFields[`TITMMOVRATCCU_T_VALOR___${i}`] = valorFormatado;
        }
      });
    });

    // 3. Processamento de Pagamento
    listPagto.forEach((objeto, index) => {
      Object.keys(objeto).forEach((item) => {
        formFields[`${item}___${index + 1}`] = objeto[item as keyof ITmovpagto];
      });
      formFields[`TMOVPAGTO_T_CODCOLIGADA___${index + 1}`] = contrato.TMOV_T_CODCOLIGADA;
      formFields[`TMOVPAGTO_T_IDMOV___${index + 1}`] = "-1";
      formFields[`TMOVPAGTO_T_IDSEQPAGTO___${index + 1}`] = "-1";
      formFields[`TMOVPAGTO_T_DESCFORMAPAGTO___${index + 1}`] = "Boleto";
      formFields[`TMOVPAGTO_T_IDFORMAPAGTO___${index + 1}`] = "1";
      formFields[`TMOVPAGTO_T_TIPOPFORMAPAGTO___${index + 1}`] = "3";
    });

    const totalizador = listItems
      .reduce((soma, item) => soma + parseFloat(item.TITMMOV_T_VALORTOTALITEM?.replace(',', '.') ?? "0"), 0)
      .toFixed(2);

    const mesFaturamento = solicitacaoPagamento.TCNT_T_MONTH?.split("-")[1] ?? "01";

    const novasolicitacao: ISolicitacaoPagamento = {
      ...solicitacaoPagamento,
      CGC: contrato.TMOV_T_CGCCOL,
      CGCFILIAL: contrato.TMOV_T_CGCFIL,
      OPTASIMPLES: dataFornecedor.OPTANTEPELOSIMPLES,
      PORTE_DESCRICAO: dataFornecedor.PORTE,
      TCNT_T_CODCCUSTO: contrato.TMOV_T_CODCCUSTO,
      TCNT_T_CODCFO: contrato.TMOV_T_CODCFO,
      TCNT_T_CODCOLCFO: contrato.TMOV_T_CODCOLCFO,
      TCNT_T_CODCONTRATO: contrato.TF_T_CODCONTRATO,
      TCNT_T_CODCOLTBORCAMENTO: "0",
      TCNT_T_CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO,
      TCNT_T_VALOR: valorEsperado(mesFaturamento),
      TCNT_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
      TCNT_T_CODFILIAL: contrato.TMOV_T_CODFILIAL,
      TCNT_T_IDCONTRATO: contrato.IDFLUIG,
      TCNT_T_CONTRATO: contrato.TF_T_CONTRATO,
      TCNT_T_DESCTBORCAMENTO: contrato.TMOV_T_TBORCAMENTO,
      TCNT_T_IDCONTRATO_ORIG: contrato.IDFLUIG,
      TMOV_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
      TMOV_T_IDMOV: "-1",
      TMOVCOMPL_T_CODCOLIGADA: contrato.TMOV_T_CODCOLIGADA,
      TMOVCOMPL_T_IDMOV: "-1",
      TMOV_T_CODCOLCFO: contrato.TMOV_T_CODCOLCFO,
      DESCRICAO_CODCOLIGADA: contrato.DESCRICAO_CODCOLIGADA,
      DESCRICAO_CODFILIALENTREGA: contrato.DESCRICAO_CODFILIAL,
      TMOV_T_CODFILIALENTREGA: contrato.TMOV_T_CODFILIAL,
      DESCRICAO_CODLOCENTREGA: "Almoxarifado",
      TMOV_T_CODLOCENTREGA: "01.001",
      TMOV_T_CODFILIAL: contrato.TMOV_T_CODFILIAL,
      DESCRICAO_CODFILIAL: contrato.DESCRICAO_CODFILIAL,
      TMOV_T_CODCFO: contrato.TMOV_T_CODCFO,
      DESCRICAO_CODCFO: contrato.DESCRICAO_CODCFO,
      TMOV_T_CGCCFO: contrato.TMOV_T_CGCCFO,
      TMOV_T_DATASAIDA: new Date().toISOString().split("T")[0],
      TMOV_T_CODCCUSTO: contrato.TMOV_T_CODCCUSTO,
      DESCRICAO_CODCCUSTO: contrato.DESCRICAO_CODCCUSTO,
      TMOV_T_VALORBRUTO: totalizador,
      TMOV_T_VALORLIQUIDO: totalizador,
      TMOV_T_DESCIDFORMAPAGTO: "Boleto",
      TMOV_T_IDFORMAPAGTO: "1",
      TMOV_T_CHAVEACESSONFE: formatChaveNFE(solicitacaoPagamento.TMOV_T_CHAVEACESSONFE ?? ""),
      TF_T_TIPOCANCEL: "BOLETO",
      TMOVCOMPL_T_IDV360: notaSelecioanda.id?.toString() ?? "-1",
    };

    formFields = { ...formFields, ...novasolicitacao };

    // --- BUSCA DA VERSÃO DO PROCESSO ---
    const versionTarget = 77;

    console.log("Tentando enviar com a versão:", versionTarget);

    const anexos = uploadedFile.length >= 1 ? uploadedFile.map((e) => {
      return {
        id: 1, fullPath: "BPM", droppedZipZone: false, name: e, newAttach: true, description: e, documentId: 0,
        attachedUser: window.WCMAPI?.user || "Sistema", attachedActivity: "Início", attachments: [{ attach: false, principal: true, fileName: e }],
        hasOwnSubMenu: true, enablePublish: false, enableEdit: false, enableEditContent: false, fromUpload: true,
        enableDownload: false, hasMoreOptions: false, iconClass: "fluigicon-file-upload", iconUrl: false, colleagueId: fluigUserCode
      }
    }) : [];

    // 5. LÓGICA DE SANITIZAÇÃO ABSOLUTA
    const cleanFormFields: any = {};
    Object.keys(formFields).forEach((key) => {
      let value = formFields[key];
      if (value === null || value === undefined || String(value).toLowerCase() === "null") {
        value = "";
      }

      if (value === "" && (
        key.includes("TOL_") ||
        key.includes("CODCOL") ||
        key.includes("IDMOV") ||
        key.includes("CHAVEACESSONFE")
      )) {
        value = "0";
      }

      if (key === "TMOV_T_CHAVEACESSONFE" && value === "0") {
        value = "";
      }

      cleanFormFields[key] = value;
    });

    const keys = Object.keys(cleanFormFields);
    const formDataResult = keys.map((key) => {
      return {
        name: key,
        value: cleanFormFields[key] !== undefined && cleanFormFields[key] !== null ? String(cleanFormFields[key]) : ""
      };
    });

    // 6. ESTRUTURAÇÃO DO PAYLOAD DIRECIONADO PARA O INÍCIO (ESTADO 4)
    const data = {
      processInstanceId: 0,
      processId: "solicitacao_de_pagamento_v2",
      version: versionTarget,
      taskUserId: fluigUserCode,
      completeTask: true,
      currentMovto: 0,
      managerMode: false,
      selectedDestinyAfterAutomatic: 213,
      conditionAfterAutomatic: -1,
      selectedColleague: [fluigUserCode],
      comments: "Inserido pela tela de cadastro e contrato.",
      newObservations: [],
      appointments: [],
      attachments: anexos,
      digitalSignature: false,
      formData: formDataResult,
      isDigitalSigned: false,
      versionDoc: 0,
      selectedState: 4,
      targetState: 4,
      currentState: 0,
      internalFields: [],
      transferTaskAfterSelection: false,
    };

    console.log("📥 Payload Sanitizado Pronto Para Envio: ", data);

    if (window.location.host.includes("localhost")) {
      setPageLoading(false);
      return data;
    }

    try {
      const response = await axios.post("/ecm/api/rest/ecm/workflowView/send", data);
      const result = response.data.content;
      if (result.processInstanceId) {
        void handleAttachmentFileProcess(result);
        window.open(fluigConfig.visualizarProcesso + result.processInstanceId, "_blank");
        handleCancel();
      }
    } catch (e: any) {
      console.error("Erro full: ", e);
      setError(
        e instanceof AxiosError
          ? e.response?.data?.message?.message
            ? e.response.data.message.message
            : e.response?.data || e.message
          : String(e)
      );
      setOpenError(true);
    } finally {
      setPageLoading(false);
    }
  }

  function handleCancel() {
    clearContext();
    setPageLoading(false);
    setOpenMedicao(false);
  }
  return { handleCancel, handleSaveClick };
}

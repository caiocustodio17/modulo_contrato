/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import fluigConfig from "../../../config";
import { sqlBody } from "../../../utils/sqlBody";
import { useContratoContext } from "../../Contratos/hooks/useContratoContext";
import { useNaturezaOrcamentariaContext } from "../../NaturezaOrcamentaria/useNaturezaOrcamentariaContext";

export interface ICentroCustoSQL {
  ID?: number;
  CODCCUSTO: string;
  NOME: string;
  VALOR?: string;
  PERCENTUAL?: string;
  CODTBORCAMENTO?: string;
  DESCRICAO_NAT?: string;
}

export function useControleRateio() {
  const { contrato, listRateio, setContrato, setListRateio } =
    useContratoContext();

  const valorTotal = contrato.TF_T_VALORCONTRATO;

  const { setNaturezasOrcamentaria, setOpenNaturezaOrcamentaria } =
    useNaturezaOrcamentariaContext();

  const [rateios, setRateios] = useState<ICentroCustoSQL[]>(() => {
    if (listRateio && listRateio.length > 0) {
      return listRateio;
    }
    const initialValor = valorTotal;
    return [
      {
        CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
        NOME: contrato.DESCRICAO_CODCCUSTO || "",
        VALOR: initialValor || "",
        PERCENTUAL: "100.00",
        CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
        DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
      },
    ];
  });

  const [rateioCentroCustos, setRateioCentroCustos] = useState<
    ICentroCustoSQL[]
  >([]);
  const [openCentroCusto, setOpenCentroCusto] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null,
  );
  const [currentEditingIndexForModal, setCurrentEditingIndexForModal] =
    useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [focused] = useState(false);
  const [error, setError] = useState("");

  const [isBlock, setIsBlock] = useState(false);

  const [, setModalAtivo] = useState<"centroCusto" | "natureza" | null>(null);

  useEffect(() => {
    if (rateios.length <= 1) {
      setIsBlock(false);
      return;
    }
    const soma = Math.round(
      rateios.reduce((acc, rateio) => acc + Number(rateio.PERCENTUAL || 0), 0),
    );
    setIsBlock(soma === 100);
  }, [rateios]);

  const [, setIsCleaning] = useState(false);

  useEffect(() => {
    if (rateios.length > 0) {
      return;
    }
    setRateios((prevRateios) => {
      if (prevRateios.length === 0) {
        return [
          {
            CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
            NOME: contrato.DESCRICAO_CODCCUSTO || "",
            CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
            DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
            VALOR: contrato.TF_T_VALORCONTRATO || "",
            PERCENTUAL: "100.00",
          },
        ];
      }

      const novosRateios = [...prevRateios];
      novosRateios[0] = {
        ...novosRateios[0],
        CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
        NOME: contrato.DESCRICAO_CODCCUSTO || "",
        VALOR: String(valorTotal || ""),
        // PERCENTUAL:  novosRateios[0].PERCENTUAL === '' ? '' : '100.00',
        PERCENTUAL: "100.00",
        CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
        DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
      };
      if (novosRateios.length > 1) {
        let somaOutrosValores = 0;
        for (let i = 1; i < novosRateios.length; i++) {
          somaOutrosValores += Number(novosRateios[i].VALOR);
        }
        if (somaOutrosValores > Number(valorTotal)) {
          const fatorAjuste = Number(valorTotal) / somaOutrosValores;
          for (let i = 1; i < novosRateios.length; i++) {
            const valorAjustado = Number(novosRateios[i].VALOR) * fatorAjuste;
            novosRateios[i] = {
              ...novosRateios[i],
              VALOR: Number(valorAjustado).toString(),
              PERCENTUAL: ((valorAjustado / Number(valorTotal)) * 100).toFixed(
                2,
              ),
            };
          }
        }
      }
      return novosRateios;
    });
  }, [
    contrato.DESCRICAO_CODCCUSTO,
    contrato.TMOV_T_CODCCUSTO,
    contrato.TF_T_VALORCONTRATO,
    rateios.length,
    valorTotal,
    contrato.TMOV_T_CODTBORCAMENTO,
    contrato.TMOV_T_TBORCAMENTO,
  ]);

  useEffect(() => {
    setListRateio(rateios);
  }, [rateios, setListRateio]);

  const adicionarRateio = useCallback(() => {
    setRateios((prevRateios) => {
      const novosRateios = [
        ...prevRateios,
        {
          CODCCUSTO: "",
          NOME: "",
          VALOR: "0,00",
          PERCENTUAL: "0.00",
          CODTBORCAMENTO: "",
          DESCRICAO_NAT: "",
        },
      ];
      return novosRateios;
    });
  }, []);

  const removerRateio = useCallback(() => {
    if (rateios.length > 1) {
      setRateios((prevRateios) => {
        const novosRateios = [...prevRateios];
        novosRateios.pop();
        return novosRateios;
      });
    }
  }, [rateios]);

  const atualizarRateio = useCallback(
    (index: number, campo: keyof ICentroCustoSQL, valorInput: string) => {
      setRateios((prevRateios) => {
        const novosRateios = [...prevRateios];
        const vTotal = Number(valorTotal) || 0;

        if (campo === "VALOR") {
          const valorLimpo = valorInput.replace(/\./g, "").replace(",", ".");
          const valorNumerico = parseFloat(valorLimpo) || 0;

          const novoPercentual =
            vTotal > 0 ? (valorNumerico / vTotal) * 100 : 0;

          novosRateios[index] = {
            ...novosRateios[index],
            VALOR: valorInput,
            PERCENTUAL: novoPercentual.toFixed(2),
          };
        } else {
          novosRateios[index] = {
            ...novosRateios[index],
            [campo]: valorInput,
          };
        }

        return novosRateios;
      });
    },
    [valorTotal],
  );

  const validarPreRequisitos = () => {
    if (!contrato.TMOV_T_CODCOLIGADA || !contrato.TMOV_T_CODFILIAL) {
      setError("Favor informar a coligada/filial do contrato.");
      setRateioCentroCustos([]);
      setIsLoading(false);
      setOpenCentroCusto(true);
      return false;
    }
    return true;
  };

  const buscarCentroCusto = async (index: number) => {
    setCurrentEditingIndex(index);
    setCurrentEditingIndexForModal(index);
    if (!validarPreRequisitos()) return;

    setIsLoading(true);
    setOpenCentroCusto(true);

    try {
      const response = await axios({
        url: fluigConfig.centroCusto,
        method: fluigConfig.method,
        data: sqlBody({
          codSentenca: "FL.DS.5.0033",
          parameters:
            `CODCOLIGADA=${contrato.TMOV_T_CODCOLIGADA ?? "@"};` +
            `CODFILIAL=${contrato.TMOV_T_CODFILIAL ?? "@"};` +
            `LIMITEFLUIG=300|BUSCADOR=${rateios[index].CODCCUSTO ?? "@"}%` +
            `${rateios[index].NOME ?? "@"}`,
        }),
      });
      const error = response.data.content.values[0].ERRO;
      if (error) throw new Error(error);

      const dados = JSON.parse(response.data.content.values[0].MESSAGE);
      setRateioCentroCustos(Array.isArray(dados) ? dados : [dados]);
      setError("");
    } catch (e) {
      setError(e instanceof AxiosError ? e.message : String(e));
      console.error("Erro na busca:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const buscarNaturezaOrcamentaria = async (index: number) => {
    setCurrentEditingIndex(index);
    setCurrentEditingIndexForModal(index);
    setModalAtivo("natureza"); // Marcamos que o modal da vez é o de natureza

    if (!contrato.TMOV_T_CODCOLIGADA) {
      console.error("Erro: CODCOLIGADA não informada no contrato");
      setError("Informe a coligada/filial do contrato antes de buscar a natureza orçamentária.");
      return;
    }

    const codCustoDaLinha = rateios[index].CODCCUSTO;

    setIsLoading(true);
    console.log(codCustoDaLinha, contrato);

    try {
      const response = await axios({
        url: fluigConfig.naturezaOrcamentaria,
        method: fluigConfig.method,
        data: sqlBody({
          codSentenca: "FL.DS.5.0037",
          parameters: `CODCOLIGADA=${contrato.TMOV_T_CODCOLIGADA}|CODFILIAL=${contrato.TMOV_T_CODFILIAL ?? "-1"}|CODCCUSTO=${codCustoDaLinha}|LIMITEFLUIG=300|BUSCADOR=@%@`,
        }),
      });

      const erroSentenca = response.data.content.values[0].ERRO;
      if (erroSentenca) throw new Error(erroSentenca);

      const dados = JSON.parse(response.data.content.values[0].MESSAGE);
      setNaturezasOrcamentaria(Array.isArray(dados) ? dados : [dados]);
      setOpenNaturezaOrcamentaria(true);
    } catch (e) {
      console.error("Erro busca Nat:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCentroCustoSelected = useCallback(
    (centroSelecionado: ICentroCustoSQL) => {
      if (currentEditingIndexForModal !== null) {
        const indexToUpdate = currentEditingIndexForModal;

        setRateios((prevRateios) => {
          const novosRateios = [...prevRateios];

          if (novosRateios.length === 0) {
            return [
              {
                CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
                NOME: contrato.DESCRICAO_CODCCUSTO || "",
                VALOR: String(valorTotal || ""),
                PERCENTUAL: "100.00",
                CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
                DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
              },
            ];
          }

          const valorSendoAtualizado = centroSelecionado.CODCCUSTO;

          const isDuplicated = novosRateios.some((rateioExistente, i) => {
            return (
              i !== indexToUpdate &&
              rateioExistente.CODCCUSTO === valorSendoAtualizado.trim()
            );
          });

          if (novosRateios.length === 1) {
            novosRateios[0] = {
              ...novosRateios[0],
              CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
              NOME: contrato.DESCRICAO_CODCCUSTO || "",
              VALOR: String(valorTotal || ""),
              PERCENTUAL: "100.00",
              CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
              DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
            };
          } else {
            novosRateios[0] = {
              ...novosRateios[0],
              CODCCUSTO: contrato.TMOV_T_CODCCUSTO || "",
              NOME: contrato.DESCRICAO_CODCCUSTO || "",
              CODTBORCAMENTO: contrato.TMOV_T_CODTBORCAMENTO || "",
              DESCRICAO_NAT: contrato.TMOV_T_TBORCAMENTO || "",
            };
          }

          if (isDuplicated) {
            setError("Este Centro de Custo já está adicionado em outra linha.");
            return prevRateios;
          } else {
            setError("");
            novosRateios[indexToUpdate] = {
              ...novosRateios[indexToUpdate],
              CODCCUSTO: centroSelecionado.CODCCUSTO,
              NOME: centroSelecionado.NOME,
              VALOR: novosRateios[indexToUpdate].VALOR,
              PERCENTUAL: novosRateios[indexToUpdate].PERCENTUAL,
            };
            return novosRateios;
          }
        });
      }
      setOpenCentroCusto(false);
      setCurrentEditingIndexForModal(null);
      setRateioCentroCustos([]);
    },
    [
      currentEditingIndexForModal,
      contrato.TMOV_T_CODCCUSTO,
      contrato.DESCRICAO_CODCCUSTO,
      contrato.TMOV_T_CODTBORCAMENTO,
      contrato.TMOV_T_TBORCAMENTO,
      valorTotal,
    ],
  );

  const limparRateio = (index: number) => {
    setIsCleaning(true);
    if (index === 0) {
      setContrato({
        ...contrato,
        TMOV_T_CODCCUSTO: "",
        DESCRICAO_CODCCUSTO: "",
        TMOV_T_CODTBORCAMENTO: "",
        TMOV_T_TBORCAMENTO: "",
      });
      setRateios((prevRateios) => {
        const novosRateios = [...prevRateios];
        novosRateios[index] = {
          CODCCUSTO: "",
          NOME: "",
          VALOR: "",
          PERCENTUAL: "",
        };
        return novosRateios;
      });
      setTimeout(() => setIsCleaning(false), 0);
    } else {
      const novosRateios = [...rateios];
      novosRateios[index] = {
        CODCCUSTO: "",
        NOME: "",
        VALOR: "",
        PERCENTUAL: "",
        CODTBORCAMENTO: "",
        DESCRICAO_NAT: "",
      };

      setRateios(novosRateios);
    }
    setTimeout(() => setIsCleaning(false), 100);
  };

  const closeCentroCusto = () => {
    setOpenCentroCusto(false);
    setCurrentEditingIndexForModal(null);
    setRateioCentroCustos([]);
  };

  const selectNatureza = (naturezaSelecionada: any) => {
    if (currentEditingIndexForModal !== null) {
      const idx = currentEditingIndexForModal;

      const codigo = naturezaSelecionada.CODTBORCAMENTO;
      const descricao = naturezaSelecionada.DESCRICAO;

      if (!codigo) {
        alert(
          "O item selecionado não possui um código válido. Verifique o log do console.",
        );
        return;
      }

      const isDuplicatedNat = rateios.some((r, i) => {
        return i !== idx && r.CODTBORCAMENTO === codigo.trim();
      });

      if (isDuplicatedNat) {
        alert(
          `A Natureza Orçamentária ${codigo} já foi selecionada em outra linha.`,
        );
        return;
      }

      setRateios((prev) => {
        const novos = [...prev];
        novos[idx] = {
          ...novos[idx],
          CODTBORCAMENTO: codigo,
          DESCRICAO_NAT: descricao,
        };
        return novos;
      });

      if (idx === 0) {
        setContrato({
          ...contrato,
          TMOV_T_CODTBORCAMENTO: codigo,
          TMOV_T_TBORCAMENTO: descricao,
        });
      }
      setOpenNaturezaOrcamentaria(false);
      setCurrentEditingIndexForModal(null);
    }
  };

  return {
    rateios,
    isLoading,
    focused,
    error,
    isBlock,
    openCentroCusto,
    rateioCentroCustos,
    currentEditingIndex,
    contrato,
    adicionarRateio,
    removerRateio,
    atualizarRateio,
    limparRateio,
    buscarCentroCusto,
    buscarNaturezaOrcamentaria,
    handleCentroCustoSelected,
    setModalAtivo,
    closeCentroCusto,
    selectNatureza,
  };
}

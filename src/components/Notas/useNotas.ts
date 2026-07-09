import { GridRowParams } from "@mui/x-data-grid";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import fluigConfig from "../../config";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import useNotasContext from "./useNotasContext";
import { ITaxDocument } from "./@types/INotasTypes";
export default function useNotas() {
  const [isLoading, setIsLoading] = useState(true);
  const { setNotas } = useNotasContext();
  const { contrato, medicoes, setError, setOpenError, setNotaSelecionada } =
    useContratoContext();

  function mergeMedicoesNotas(notasList: ITaxDocument[]) {
    setNotas(
      notasList.map((nota) => {
        return {
          ...nota,
          id_medicao:
            medicoes.find(
              (medicao) =>
                medicao.TMOV_T_DATAEMISSAO == nota.issue_date &&
                medicao.TMOV_T_NUMEROMOV == nota.number?.toString() &&
                medicao.STATUSCODE !== '1'
            )?.IDFLUIG ?? "",
        };
      })
    );
  }
  function handleGetNotas() {
    const error = [];
    if (contrato.TMOV_T_CGCFIL.toString().trim().length == 0)
      error.push("Cnpj da escola inválido.");
    if (contrato.TMOV_T_CGCCFO.toString().trim().length == 0)
      error.push("Cnpj do fornecedor inválido.");
    if (error.length > 0) {
      setIsLoading(false);
      setNotas([]);
      setError(error.join("</br>"));
    } else {
      getNotas();
    }
  }
  function handleClickRow(params: GridRowParams) {
    setIsLoading(true);
    if (params.row.id_medicao) {
      setError(
        "Não é possível selecionar uma nota que esteja vinculada a uma medição."
      );
      setOpenError(true);
    }
    if (!params.row.id_medicao) {
      setNotaSelecionada(params.row);
    }
    setIsLoading(false);
  }
  async function getNotas() {
    setNotas([]);
    await axios({
      url: fluigConfig.taxDocuments,
      method: fluigConfig.method,
      data: {
        name: "ds_v360",
        constraints: [
          {
            _field: "cgcFilial",
            _initialValue: contrato.TMOV_T_CGCFIL.replace(/\D/g, ""),
            _finalValue: contrato.TMOV_T_CGCFIL.replace(/\D/g, ""),
            _type: 1,
          },
          {
            _field: "cgcCfo",
            _initialValue: contrato.TMOV_T_CGCCFO.replace(/\D/g, ""),
            _finalValue: contrato.TMOV_T_CGCCFO.replace(/\D/g, ""),
            _type: 1,
          },
        ],
      },
    })
      .then((r) => {
        const error = r.data.content.values[0].ERRO;
        if (error) throw Error(error);
        const dados = JSON.parse(r.data.content.values[0].MESSAGE);
        const tax_documents = dados.payload.tax_documents;
        mergeMedicoesNotas(tax_documents);
        setError("");
      })
      .catch((e) => {
        setError(e instanceof AxiosError ? e.message : String(e));
        throw Error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return { isLoading, handleGetNotas, handleClickRow };
}

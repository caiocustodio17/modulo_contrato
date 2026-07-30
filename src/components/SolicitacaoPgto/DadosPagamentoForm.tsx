/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutline } from "@mui/icons-material";
import { Button, Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useContratoContext } from "../Contratos/hooks/useContratoContext";
import { ITaxDocument } from "../Notas/@types/INotasTypes";
import useSolicitacaoPagamentoContext from "./useSolicitacaoPagamentoContext";
import VencimentoTextField from "./VencimentoTextField";

const modalidadeLIst = [
  {
    value: "",
    label: "",
  },
  {
    value: "01",
    label: "Regular",
  },
  {
    value: "02",
    label: "Emergencial",
  },
];

export default function DadosPagamentoForm() {
  const { notaSelecioanda, setNotaSelecionada } = useContratoContext();
  const { setSolicitacaoPagamento, solicitacaoPagamento, setListItems } =
    useSolicitacaoPagamentoContext();

  const params = new URLSearchParams(window.location.search);
  const paramNumNota = params.get("numNota") || "";
  const paramTipo = params.get("tipo") || "";
  const paramModalidade = params.get("modalidadePag") || "";
  const paramChaveAcessoNFE = params.get("chaveAcessoNFE") || "";
  const paramEmissao = params.get("emissao") || "";
  const paramDataVencimento = params.get("dataVencimento") || ""


  const [modalidade, setModalidade] = useState(paramModalidade);
  const [dataVencimento, setDataVencimento] = useState(paramDataVencimento);
  const [mesFaturamento, setMesFaturamento] = useState("");
  const [numeroNota, setNumeroNota] = useState(
    paramNumNota || (notaSelecioanda && notaSelecioanda.number
      ? notaSelecioanda.number.toString()
      : "")
  );
  const [dataEmissao, setDataEmissao] = useState<string>(
    paramEmissao || notaSelecioanda?.issue_date || ""
  );
  const [tipo, setTipo] = useState(
    paramTipo || (notaSelecioanda.model_type
      ? notaSelecioanda.model_type === "nfse"
        ? "S"
        : "P"
      : "")
  );
  const [chaveAcesso, setChaveAcesso] = useState<string>(
    paramChaveAcessoNFE || notaSelecioanda?.access_key || ""
  );

  function formatarNumeroNota(valor: string | number): string {
    const apenasNumeros = String(valor).replace(/\D/g, "").slice(0, 9);
    return apenasNumeros;

  }
  
  useEffect(() => {
    if(tipo === "S") {
      setChaveAcesso("");
    }
  }, [tipo]);
  
  useEffect(() => {
    if (dataEmissao) {
      const [ano, mes] = dataEmissao.split("-");
      setMesFaturamento(`${ano}-${mes}`);
    }
  }, [dataEmissao]);

  useEffect(() => {
    handleSetDados();
  }, [
    modalidade,
    dataVencimento,
    mesFaturamento,
    numeroNota,
    dataEmissao,
    tipo,
    chaveAcesso,
    notaSelecioanda,
  ]);

  function handleSetDados() {
    setSolicitacaoPagamento({
      ...solicitacaoPagamento,
      TMOVCOMPL_T_CODTIPO: tipo,
      TMOVCOMPL_T_DESCTIPO: tipo == "P" ? "Produto" : "Serviço",
      MODALIDADE_PAGAMENTO: modalidade ?? "01",
      MODALIDADE_PAGAMENTO_DESC:
        !modalidade || modalidade == "01" ? "Regular" : "Emergencial",
      TMOV_T_DATAEXTRA1: dataVencimento,
      TCNT_T_MONTH: mesFaturamento,
      TMOV_T_CHAVEACESSONFE: chaveAcesso ?? "",
      TMOV_T_DATAEMISSAO: dataEmissao,
      TMOV_T_NUMEROMOV: numeroNota,
    });
  }
  function handleClearNotaSelecionada() {
    setNotaSelecionada({} as ITaxDocument);
    setNumeroNota("");
    setDataEmissao("");
    setTipo("");
    setChaveAcesso("");
    setListItems([]);
  }

  function formatarChaveAcesso(chave: string): string {
    const numeros = chave.replace(/\D/g, "").slice(0, 44); // Limita a 44 dígitos numéricos

    if (numeros.length === 44) {
      return numeros.match(/.{1,4}/g)?.join(" ") ?? numeros;
    }

    return numeros; 
  }

  return (
    <>
      <Grid container mt={1} spacing={1}>
        <Grid item xs={12} sm={12} md={2}>
          <Button
            color="error"
            fullWidth
            startIcon={<DeleteOutline />}
            variant="outlined"
            onClick={handleClearNotaSelecionada}
          >
            Remover Nota
          </Button>
        </Grid>
      </Grid>
      <Grid container mt={2} spacing={1}>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            id="TMOVCOMPL_T_CODTIPO"
            label="Tipo"
            variant="outlined"
            focused
            SelectProps={{ native: true }}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value={""}></option>
            <option value={"S"}>Serviço</option>
            <option value={"P"}>Produto</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            id="MODALIDADE_PAGAMENTO"
            label="Modalidade de Pagamento"
            variant="outlined"
            focused
            SelectProps={{ native: true }}
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            {modalidadeLIst.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        </Grid>
        {/* <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            size="small"
            id="TMOV_T_DATAVENCIMENTO"
            label="Vencimento"
            variant="outlined"
            focused
            type="date"
            onChange={(e) => setDataVencimento(e.target.value)}
            value={dataVencimento}
          />
        </Grid> */}
        <Grid item xs={12} sm={12} md={3}>
          <VencimentoTextField
            modalidade={modalidade}
            dataEmissao={dataEmissao}
            value={dataVencimento}
            onChange={setDataVencimento}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            size="small"
            id="TCNT_T_MONTH"
            label="Mês/ano Faturamento"
            variant="outlined"
            focused
            type="month"
            inputProps={{
              min: new Date().toISOString().split("T")[0].substring(0, 7),
            }}
            onChange={(e) => setMesFaturamento(e.target.value)}
            value={mesFaturamento}
          />
        </Grid>
      </Grid>
      <Grid container mt={2} spacing={1}>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            size="small"
            id="TMOV_T_NUMEROMOV"
            label="Núm. Nota"
            variant="outlined"
            focused
            type="text"
            value={numeroNota}
            onChange={(e) => setNumeroNota(formatarNumeroNota(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <TextField
            fullWidth
            size="small"
            id="TMOV_T_DATAEMISAO"
            label="Emissão"
            variant="outlined"
            focused
            type="date"
            onChange={(e) => setDataEmissao(e.target.value)}
            value={dataEmissao}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <TextField
            fullWidth
            size="small"
            id="TMOV_T_CHAVEACESSONFE"
            label="Chave Acesso"
            variant="outlined"
            focused
            disabled={tipo == "S"}
            type="text"
            onChange={(e) => setChaveAcesso(formatarChaveAcesso(e.target.value))}
            value={chaveAcesso}
          />
        </Grid>
      </Grid>
    </>
  );
}

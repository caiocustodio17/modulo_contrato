import {
  AttachFileOutlined,
  CopyAllOutlined,
  Delete,
  CurrencyExchangeOutlined,
  MonetizationOnOutlined,
  Refresh,
  SettingsOutlined,
  WorkOutline,
} from "@mui/icons-material";
import {
  Button,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
} from "@mui/material";
import { CustomToolbarComponent } from "../Global/CustomGridToolbarComponent";
import ModalSelectorComponent from "../Global/ModalSelectorComponent";
import {
  anexosMedicoes,
  medicoes,
  orcamento,
} from "../Relatorios/ColumnsRelatorios";
import { useRelAnexos } from "../Relatorios/useRelAnexos";
import { useContratoContext } from "./hooks/useContratoContext";
import useContratoToolbar, {
  useContratoToolbarAttach,
} from "./hooks/useContratoToolbar";
import useContratos from "./hooks/useContratos";
export default function ContratosToolbar() {
  const { id, anchorEl, handleClick, handleClose, open } = useContratoToolbar();
  const {
    idAttach,
    anchorAttach,
    handleClickAttach,
    handleCloseAttach,
    openAttach,
  } = useContratoToolbarAttach();
  const {
    setOpenMedicao,
    setOpenEdit,
    setEditForm,
    clearContext,
    contrato,
    setOpenError,
    setError,
  } = useContratoContext();
  const {
    handleMedicoesContrato,
    handleAnexosMedicao,
    handleOrcamentoContrato,
    setColumns,
    columns,
    title,
    setTitle,
    data,
    error,
    openRelAnexos,
    setOpenRelAnexos,
    isLoading,
  } = useRelAnexos();
  const { handleRefreshClick } = useContratos();
  function handleClickRelAnexoOrcamento() {
    setTitle("Orçamento do Contrato");
    handleOrcamentoContrato({
      codColigada: contrato.TMOV_T_CODCOLIGADA,
      codFilial: contrato.TMOV_T_CODFILIAL,
      codOrcamento: contrato.TMOV_T_CODTBORCAMENTO,
      idContrato: contrato.IDFLUIG,
      codCcusto: contrato.TMOV_T_CODCCUSTO,
    });
    setColumns(orcamento);
    setOpenRelAnexos(true);
  }
  function handleClickRelMedicoes() {
    setTitle("Relatório de Medições");
    setError("");
    handleMedicoesContrato(contrato.IDFLUIG);
    setColumns(medicoes);
    setOpenRelAnexos(true);
  }
  function handleClickRelAnexoMedicoes() {
    setTitle("Relatório de Anexos das Medições");
    setError("");
    handleAnexosMedicao(contrato.IDFLUIG);
    setColumns(anexosMedicoes);
    setOpenRelAnexos(true);
  }
  function handleClickMedicao() {
    setError("");
    if (contrato.STATUSCODE == "2") {
      setEditForm(false);
      setOpenMedicao(true);
    } else {
      setError("Somente contratos em andamento podem ser medidos.");
      setOpenError(true);
    }
  }
  function handleClickCopy() {
    setError("");
    setEditForm(true);
    setOpenEdit(true);
  }
  function handleCadastrarContrato() {
    clearContext();
    handleClickCopy();
  }
  return (
    <>
      <CustomToolbarComponent>
        <Button
          color="primary"
          size="small"
          variant="text"
          startIcon={<Refresh />}
          onClick={handleRefreshClick}
        >
          Atualizar
        </Button>
        <Button
          color="primary"
          size="small"
          variant="text"
          startIcon={<WorkOutline />}
          onClick={handleCadastrarContrato}
        >
          Cadastrar Contrato
        </Button>
        <Button
          color="primary"
          size="small"
          variant="text"
          startIcon={<CurrencyExchangeOutlined />}
          onClick={handleClickMedicao}
        >
          Medir Contrato
        </Button>
        <Button
          color="primary"
          size="small"
          variant="text"
          startIcon={<SettingsOutlined />}
          aria-describedby={id}
          onClick={handleClick}
        >
          Processos
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <ListItem disablePadding>
            <ListItemButton>
              <CopyAllOutlined sx={{ mr: 1 }} />
              <ListItemText onClick={handleClickCopy}>
                Copiar Contrato
              </ListItemText>
            </ListItemButton>
            <ListItemButton>
              <Delete sx={{ mr: 1, color: "red" }} />
              <ListItemText onClick={handleClickCopy}>
                Cancelar Contrato
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </Popover>
        <Button
          color="primary"
          size="small"
          variant="text"
          startIcon={<AttachFileOutlined />}
          aria-describedby={idAttach}
          onClick={handleClickAttach}
        >
          Anexos
        </Button>
        <Popover
          id={idAttach}
          open={openAttach}
          anchorEl={anchorAttach}
          onClose={handleCloseAttach}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <ListItem disablePadding>
            <ListItemButton>
              <CopyAllOutlined sx={{ mr: 1 }} />
              <ListItemText onClick={handleClickRelMedicoes}>
                Medições
              </ListItemText>
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <AttachFileOutlined sx={{ mr: 1 }} />
              <ListItemText onClick={handleClickRelAnexoMedicoes}>
                Anexos Medições
              </ListItemText>
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <MonetizationOnOutlined sx={{ mr: 1 }} />
              <ListItemText onClick={handleClickRelAnexoOrcamento}>
                Orçamento Contrato
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </Popover>
      </CustomToolbarComponent>
      <ModalSelectorComponent
        columns={columns != null ? columns : []}
        rows={data != null ? data : []}
        title={title}
        onClose={() => setOpenRelAnexos(false)}
        open={openRelAnexos}
        loading={isLoading}
        messageError={error}
      />
    </>
  );
}

import { Box, Button, Grid, Table, TableBody } from "@mui/material";
import { LinhaRateio } from "../../Rateio/CentroCustoRateioForm";
import { ModalCentroCusto } from "../../Rateio/CentroCustoRateioModalSelect";
import { NaturezaOrcamentariaModalSelect } from "../../NaturezaOrcamentaria/NaturezaOrcamentariaModalSelect";
import { useControleRateio } from "./useControleRateio";

export default function ControleRateioForm() {
  const r = useControleRateio();

  return (
    <>
      <Box
        sx={{
          maxHeight: "150px",
          overflowY: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          padding: "8px",
          marginBottom: "16px",
        }}
      >
        <Table size="small">
          <TableBody>
        {r.rateios.map((rateio, index) => (
          <LinhaRateio
            key={index}
            index={index}
            codCusto={r.contrato.TMOV_T_CODCCUSTO || ""}
            nome={r.contrato.DESCRICAO_CODCCUSTO || ""}
            valor={rateio.VALOR}
            percentual={rateio.PERCENTUAL}
            codNat={rateio.CODTBORCAMENTO}
            nomeNat={rateio.DESCRICAO_NAT}
            isLoading={r.isLoading}
            focused={r.focused}
            currentEditingIndex={r.currentEditingIndex}
            onBuscar={(idx) => {
              r.setModalAtivo("centroCusto");
              r.buscarCentroCusto(idx);
            }}
            onLimpar={r.limparRateio}
            onChange={(idx, campo, valor) => {
              r.atualizarRateio(idx, campo, valor);
            }}
            getNaturezaOrcamentaria={r.buscarNaturezaOrcamentaria}
          />
        ))}
          </TableBody>
        </Table>
      </Box>
      <Grid item xs={12} sm={12} md={1}>
        <Button onClick={r.adicionarRateio} disabled={r.isBlock}>
          +
        </Button>
        <Button onClick={r.removerRateio} disabled={r.rateios.length <= 1}>
          -
        </Button>
      </Grid>

      <ModalCentroCusto
        abert={r.openCentroCusto}
        centros={r.rateioCentroCustos}
        onFechar={r.closeCentroCusto}
        onSelecionar={r.handleCentroCustoSelected}
        error={r.error}
      />
      <NaturezaOrcamentariaModalSelect onSelecionar={r.selectNatureza} />
    </>
  );
}

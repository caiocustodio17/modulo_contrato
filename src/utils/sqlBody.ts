type IUseExecSQL = {
  codSentenca: string;
  coligada?: string;
  parameters?: string;
};
export function sqlBody(props: IUseExecSQL) {
  const constraintsValues = {
    CODSENTENCA: props.codSentenca,
    COLIGADA: props?.coligada || "0",
    APLICACAO: "G",
    PARAMETER: props.parameters ?? "",
    OBJETO: "Resulado",
    CAMPOS: "RESULTADO",
    OPC: "12",
  };
  const body = {
    name: "dsIntegraFacilRM",
    fields: [],
    constraints: [
      {
        _field: "SENTENCA",
        _initialValue: constraintsValues.CODSENTENCA,
        _finalValue: constraintsValues.CODSENTENCA,
        _type: 1,
      },
      {
        _field: "COLIGADA",
        _initialValue: constraintsValues.COLIGADA,
        _finalValue: constraintsValues.COLIGADA,
        _type: 1,
      },
      {
        _field: "APLICACAO",
        _initialValue: constraintsValues.APLICACAO,
        _finalValue: constraintsValues.APLICACAO,
        _type: 1,
      },
      {
        _field: "PARAMETER",
        _initialValue: constraintsValues.PARAMETER,
        _finalValue: constraintsValues.PARAMETER,
        _type: 1,
      },
      {
        _field: "OBJETO",
        _initialValue: constraintsValues.OBJETO,
        _finalValue: constraintsValues.OBJETO,
        _type: 1,
      },
      {
        _field: "CAMPOS",
        _initialValue: constraintsValues.CAMPOS,
        _finalValue: constraintsValues.CAMPOS,
        _type: 1,
      },
      {
        _field: "OPC",
        _initialValue: constraintsValues.OPC,
        _finalValue: constraintsValues.OPC,
        _type: 1,
      },
    ],
    order: [],
  };
  return body;
}

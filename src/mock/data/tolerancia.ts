/* eslint-disable @typescript-eslint/no-explicit-any */
// values[0] for ToleranciaContrato() (RM sentenca FL.DS.5.0037).
// MESSAGE is a JSON STRING (the component JSON.parses it).
export const toleranciaMock: Array<Record<string, any>> = [
  {
    ERRO: "",
    MESSAGE: JSON.stringify([
      {
        TOL_VALORFIL: "1000.00",
        TOL_PERCFIL: "10.00",
        TOL_VALORGLB: "5000.00",
        TOL_PERCGLB: "15.00",
        TOL_VALORGERAL: "12000.00",
        TOL_PERCGERAL: "20.00",
      },
    ]),
  },
];

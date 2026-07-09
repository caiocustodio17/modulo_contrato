export function boletoCapturaValor(param: string){
  const registro = param.slice(-14).substring(4)
  const valor = `${parseFloat(registro.substring(0,8))}.${registro.slice(-2)}`
  return parseFloat(valor)
}
export function boletoCalcularDataPorFator(param:string) {
  const fatorVencimento: number = parseFloat(param.slice(-14).substring(0,4))
  const dataReferencia = new Date('1997-10-07');
  const milissegundos = fatorVencimento * 24 * 60 * 60 * 1000;
  const dataCalculada = new Date(dataReferencia.getTime() + milissegundos);
  return dataCalculada.toISOString().split('T')[0];
}

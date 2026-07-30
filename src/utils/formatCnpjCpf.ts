// Novo CNPJ (Receita Federal, vigente a partir de 07/2026): 14 posições, as 12
// primeiras alfanuméricas (raiz + ordem do estabelecimento) e as 2 últimas
// sempre numéricas (dígitos verificadores). CPF continua 11 posições numéricas.
export default function sanitizeCnpjCpf(valor: string): string {
  if (!valor) return "";

  const upper = valor.toUpperCase();
  const somenteNumeros = /^\d*$/.test(upper);

  // Enquanto o usuário só digitar números, respeita o tamanho do CPF (11).
  if (somenteNumeros && upper.length <= 11) {
    return upper.slice(0, 11);
  }

  const limitado = upper.replace(/[^A-Z0-9]/g, "").slice(0, 14);
  const corpo = limitado.slice(0, 12).replace(/[^A-Z0-9]/g, "");
  const digitosVerificadores = limitado.slice(12, 14).replace(/\D/g, "");

  return corpo + digitosVerificadores;
}

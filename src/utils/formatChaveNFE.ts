export default function formatChaveNFE(texto: string) {
  const chaveNfe =
    /^(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/;
  return texto === null || texto === undefined
    ? ""
    : texto.replace(chaveNfe, "$1 $2 $3 $4 $5 $6 $7 $8 $9 $10 $11");
}

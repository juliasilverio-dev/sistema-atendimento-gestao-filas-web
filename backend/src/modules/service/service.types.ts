// Os códigos são usados pela API; os rótulos são os textos exibidos nas telas.
// `as const` preserva os valores literais para derivar o tipo sem repetir o catálogo.
export const SERVICE_CATALOG = [
  { code: 'consulta', label: 'Consulta' },
  { code: 'exame', label: 'Exame' },
  { code: 'agendamento', label: 'Agendamento' },
] as const;

export type ServiceCode = (typeof SERVICE_CATALOG)[number]['code'];

// Dados recebidos pela rede começam como `unknown` e precisam ser conferidos
// em execução. O retorno `value is ServiceCode` também informa o resultado ao TS.
export function isServiceCode(value: unknown): value is ServiceCode {
  for (const service of SERVICE_CATALOG) {
    if (service.code === value) {
      return true;
    }
  }

  return false;
}

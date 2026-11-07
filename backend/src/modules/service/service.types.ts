// Estes são os únicos serviços aceitos pelo sistema.
export type ServiceCode = 'consulta' | 'exame' | 'agendamento';

interface ServiceOption {
  code: ServiceCode;
  label: string;
}

// code é enviado pela API; label é o nome mostrado nas telas.
export const SERVICE_CATALOG: ServiceOption[] = [
  { code: 'consulta', label: 'Consulta' },
  { code: 'exame', label: 'Exame' },
  { code: 'agendamento', label: 'Agendamento' },
];

// O valor vem da rede e ainda pode ser qualquer coisa (unknown).
// "value is ServiceCode" informa ao TypeScript que a verificação confirmou o tipo.
export function isServiceCode(value: unknown): value is ServiceCode {
  for (const service of SERVICE_CATALOG) {
    if (service.code === value) {
      return true;
    }
  }

  return false;
}

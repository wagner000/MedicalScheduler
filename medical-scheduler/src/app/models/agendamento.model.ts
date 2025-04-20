export interface Agendamento {
  id: number;
  colaboradorId: number;
  clienteId: number;
  data: string; // Formato: YYYY-MM-DD
  hora: string; // Formato: HH:MM
  status: StatusAgendamento;
  observacoes?: string;
}

export enum StatusAgendamento {
  ABERTO = 'ABERTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  NAO_COMPARECEU = 'NAO_COMPARECEU'
}
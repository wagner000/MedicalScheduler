import { Cliente } from "./cliente.model";

export interface Agendamento {
  id: number;
  colaboradorId: number;
  cliente?: Cliente;
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
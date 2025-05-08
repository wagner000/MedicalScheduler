export interface PreAgendamento {
  id: number;
  nome: string;
  cpf: string;
  data: string; // Formato: YYYY-MM-DD
  colaboradorId: number;
  observacoes?: string;
}
export interface Colaborador {
  id: number;
  nome: string;
  especialidade: string;
  email?: string;
  telefone?: string;
  foto?: string; // URL da foto do colaborador
  horarioInicio?: string; // Formato HH:MM
  horarioFim?: string; // Formato HH:MM
  diasDisponiveis?: string[]; // Ex: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
}
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento?: string; // Formato: YYYY-MM-DD
  sexo?: 'M' | 'F' | 'O'; // M: Masculino, F: Feminino, O: Outro
  email?: string;
  telefone?: string;
  endereco?: string;
}
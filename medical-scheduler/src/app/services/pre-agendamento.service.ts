import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PreAgendamento } from '../models/pre-agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class PreAgendamentoService {
  private preAgendamentos: PreAgendamento[] = [
    {
      id: 1,
      nome: 'Maria Silva',
      cpf: '123.456.789-00',
      data: '2025-04-20',
      colaboradorId: 1,
      observacoes: 'Primeira consulta'
    },
    {
      id: 2,
      nome: 'João Pereira',
      cpf: '987.654.321-00',
      data: '2025-04-20',
      colaboradorId: 2,
      observacoes: 'Retorno'
    },
    {
      id: 3,
      nome: 'Carlos Santos',
      cpf: '111.222.333-44',
      data: '2025-04-20',
      colaboradorId: 1
    },
    {
      id: 4,
      nome: 'Ana Oliveira',
      cpf: '555.666.777-88',
      data: '2025-04-21',
      colaboradorId: 1
    },
    {
      id: 5,
      nome: 'Pedro Souza',
      cpf: '999.888.777-66',
      data: '2025-04-21',
      colaboradorId: 2
    }
  ];

  constructor() { }

  // Obter todos os pré-agendamentos
  getPreAgendamentos(): Observable<PreAgendamento[]> {
    return of(this.preAgendamentos);
  }
  
  // Obter pré-agendamento por ID
  getPreAgendamentoById(id: number): Observable<PreAgendamento | undefined> {
    const preAgendamento = this.preAgendamentos.find(pa => pa.id === id);
    return of(preAgendamento);
  }
  
  // Obter pré-agendamentos por data
  getPreAgendamentosByData(data: string): Observable<PreAgendamento[]> {
    return of(this.preAgendamentos.filter(pa => pa.data === data));
  }
  
  // Obter pré-agendamentos por colaborador e data
  getPreAgendamentosByColaboradorEData(colaboradorId: number, data: string): Observable<PreAgendamento[]> {
    return of(this.preAgendamentos.filter(pa => 
      pa.colaboradorId === colaboradorId && pa.data === data));
  }
  
  // Adicionar um pré-agendamento
  addPreAgendamento(preAgendamento: PreAgendamento): Observable<PreAgendamento> {
    const newId = this.preAgendamentos.length > 0 
      ? Math.max(...this.preAgendamentos.map(pa => pa.id)) + 1 
      : 1;
    
    const novoPreAgendamento = {
      ...preAgendamento,
      id: newId
    };
    
    this.preAgendamentos.push(novoPreAgendamento);
    return of(novoPreAgendamento);
  }
  
  // Atualizar um pré-agendamento
  updatePreAgendamento(preAgendamento: PreAgendamento): Observable<PreAgendamento> {
    const index = this.preAgendamentos.findIndex(pa => pa.id === preAgendamento.id);
    
    if (index !== -1) {
      this.preAgendamentos[index] = preAgendamento;
      return of(preAgendamento);
    }
    
    return of(preAgendamento); // Em um caso real, você retornaria um erro aqui
  }
  
  // Remover um pré-agendamento
  removePreAgendamento(id: number): Observable<boolean> {
    const initialLength = this.preAgendamentos.length;
    this.preAgendamentos = this.preAgendamentos.filter(pa => pa.id !== id);
    return of(this.preAgendamentos.length !== initialLength);
  }
}
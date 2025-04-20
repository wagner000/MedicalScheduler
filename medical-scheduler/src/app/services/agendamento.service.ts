import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Agendamento, StatusAgendamento } from '../models/agendamento.model';
import { PreAgendamento } from '../models/pre-agendamento.model';
import { ClienteService } from './cliente.service';
import { PreAgendamentoService } from './pre-agendamento.service';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private agendamentos: Agendamento[] = [
    {
      id: 1,
      colaboradorId: 1,
      clienteId: 1,
      data: '2025-04-20',
      hora: '05:00',
      status: StatusAgendamento.ABERTO,
      observacoes: 'Consulta de rotina (manhã cedo)'
    },
    {
      id: 2,
      colaboradorId: 1,
      clienteId: 2,
      data: '2025-04-20',
      hora: '10:30',
      status: StatusAgendamento.CONCLUIDO,
      observacoes: 'Retorno'
    },
    {
      id: 3,
      colaboradorId: 2,
      clienteId: 3,
      data: '2025-04-20',
      hora: '11:00',
      status: StatusAgendamento.ABERTO,
      observacoes: 'Primeira consulta'
    },
    {
      id: 4,
      colaboradorId: 2,
      clienteId: 1,
      data: '2025-04-21',
      hora: '14:00',
      status: StatusAgendamento.ABERTO,
      observacoes: 'Exame de rotina'
    }
  ];

  constructor(
    private clienteService: ClienteService,
    private preAgendamentoService: PreAgendamentoService
  ) { }

  getAgendamentos(): Observable<Agendamento[]> {
    return of(this.agendamentos);
  }

  getAgendamentoById(id: number): Observable<Agendamento | undefined> {
    const agendamento = this.agendamentos.find(a => a.id === id);
    return of(agendamento);
  }

  getAgendamentosByColaboradorId(colaboradorId: number): Observable<Agendamento[]> {
    const filteredAgendamentos = this.agendamentos.filter(a => a.colaboradorId === colaboradorId);
    return of(filteredAgendamentos);
  }

  getAgendamentosByClienteId(clienteId: number): Observable<Agendamento[]> {
    const filteredAgendamentos = this.agendamentos.filter(a => a.clienteId === clienteId);
    return of(filteredAgendamentos);
  }

  getAgendamentosByData(data: string): Observable<Agendamento[]> {
    const filteredAgendamentos = this.agendamentos.filter(a => a.data === data);
    return of(filteredAgendamentos);
  }

  getAgendamentosByDataEColaborador(data: string, colaboradorId: number): Observable<Agendamento[]> {
    const filteredAgendamentos = this.agendamentos.filter(
      a => a.data === data && a.colaboradorId === colaboradorId
    );
    return of(filteredAgendamentos);
  }

  addAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    // Gerando ID (em uma aplicação real, isso seria feito pelo backend)
    const newId = Math.max(...this.agendamentos.map(a => a.id)) + 1;
    const newAgendamento = { ...agendamento, id: newId };
    this.agendamentos.push(newAgendamento);
    return of(newAgendamento);
  }

  updateAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    const index = this.agendamentos.findIndex(a => a.id === agendamento.id);
    if (index !== -1) {
      this.agendamentos[index] = { ...agendamento };
      return of(this.agendamentos[index]);
    }
    return of(agendamento); // retorna o agendamento sem alterações se não for encontrado
  }

  updateStatusAgendamento(id: number, status: StatusAgendamento): Observable<Agendamento | undefined> {
    const index = this.agendamentos.findIndex(a => a.id === id);
    if (index !== -1) {
      this.agendamentos[index] = { ...this.agendamentos[index], status };
      return of(this.agendamentos[index]);
    }
    return of(undefined);
  }

  deleteAgendamento(id: number): Observable<boolean> {
    const index = this.agendamentos.findIndex(a => a.id === id);
    if (index !== -1) {
      this.agendamentos.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  verificarDisponibilidade(colaboradorId: number, data: string, hora: string): Observable<boolean> {
    const agendamentoExistente = this.agendamentos.find(
      a => a.colaboradorId === colaboradorId && a.data === data && a.hora === hora
    );
    return of(!agendamentoExistente);
  }

  // Método para confirmar um pré-agendamento, transformando-o em um agendamento regular
  confirmarPreAgendamento(preAgendamento: PreAgendamento, hora: string): Observable<Agendamento> {
    // 1. Buscamos o cliente pelo CPF ou criamos um novo
    return this.clienteService.getClienteByCpf(preAgendamento.cpf || '').pipe(
      switchMap(clienteExistente => {
        if (clienteExistente) {
          return of(clienteExistente);
        } else {
          // Criar um novo cliente se não existir
          const novoCliente = {
            id: 0, // será definido no service
            nome: preAgendamento.nome,
            cpf: preAgendamento.cpf || ''
          };
          return this.clienteService.addCliente(novoCliente);
        }
      }),
      switchMap(cliente => {
        // 2. Criar o agendamento
        const novoAgendamento: Agendamento = {
          id: 0, // será definido no service
          colaboradorId: preAgendamento.colaboradorId,
          clienteId: cliente.id,
          data: preAgendamento.data,
          hora: hora,
          status: StatusAgendamento.ABERTO,
          observacoes: preAgendamento.observacoes
        };
        
        // 3. Adicionar o agendamento
        return this.addAgendamento(novoAgendamento);
      }),
      tap(() => {
        // 4. Remover o pré-agendamento
        this.preAgendamentoService.removePreAgendamento(preAgendamento.id).subscribe();
      })
    );
  }
}
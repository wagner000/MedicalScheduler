import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { PreAgendamento } from '../models/pre-agendamento.model';
import { Agendamento, StatusAgendamento } from '../models/agendamento.model';
import { AgendamentoService } from './agendamento.service';
import { PreAgendamentoService } from './pre-agendamento.service';
import { Cliente } from '../models/cliente.model';
import { ClienteService } from './cliente.service';

@Injectable({
  providedIn: 'root'
})
export class PreAgendamentoConverterService {
  constructor(
    private agendamentoService: AgendamentoService,
    private preAgendamentoService: PreAgendamentoService,
    private clienteService: ClienteService
  ) { }

  /**
   * Converte um pré-agendamento em um agendamento efetivo
   * @param preAgendamento O pré-agendamento a ser convertido
   * @param horario O horário escolhido para o agendamento
   */
  converterParaAgendamento(preAgendamento: PreAgendamento, horario: string): Observable<Agendamento> {
    return this.clienteService.getClienteByCpf(preAgendamento.cpf).pipe(
      switchMap((clienteExistente: Cliente | undefined) => {
        // Se o cliente existir, usa o cliente existente
        if (clienteExistente) {
          return of(clienteExistente);
        } else {
          // Se o cliente não existir, cria um novo cliente
          const novoCliente: Cliente = {
            id: 0, // será gerado pelo serviço
            nome: preAgendamento.nome,
            cpf: preAgendamento.cpf
          };
          return this.clienteService.addCliente(novoCliente);
        }
      }),
      switchMap(cliente => {
        if (!cliente || !cliente.id) {
          throw new Error('Cliente inválido ao criar agendamento');
        }

        const novoAgendamento: Omit<Agendamento, 'id'> = {
          cliente: cliente,
          colaboradorId: preAgendamento.colaboradorId,
          data: preAgendamento.data,
          hora: horario,
          status: StatusAgendamento.ABERTO,
          observacoes: preAgendamento.observacoes
        };

        return this.agendamentoService.addAgendamento(novoAgendamento as Agendamento);
      }),
      switchMap(agendamentoCriado => {
        // Após criar o agendamento, remover o pré-agendamento
        //TODO nao remover pre-agendamento, apenas atualizar status
        return this.preAgendamentoService.removePreAgendamento(preAgendamento.id).pipe(
          map(() => agendamentoCriado)
        );
      })
    );
  }
}

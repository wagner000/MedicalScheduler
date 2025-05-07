import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { PreAgendamento } from '../models/pre-agendamento.model';
import { Agendamento, StatusAgendamento } from '../models/agendamento.model';
import { AgendamentoService } from './agendamento.service';
import { PreAgendamentoService } from './pre-agendamento.service';

@Injectable({
  providedIn: 'root'
})
export class PreAgendamentoConverterService {
  constructor(
    private agendamentoService: AgendamentoService,
    private preAgendamentoService: PreAgendamentoService
  ) { }

  /**
   * Converte um pré-agendamento em um agendamento efetivo
   * @param preAgendamento O pré-agendamento a ser convertido
   * @param horario O horário escolhido para o agendamento
   */
  converterParaAgendamento(preAgendamento: PreAgendamento, horario: string): Observable<Agendamento> {
    // Criar o novo agendamento
    const novoAgendamento: Omit<Agendamento, 'id'> = {
      clienteId: 0, // Será preenchido após criar o cliente
      colaboradorId: preAgendamento.colaboradorId,
      data: preAgendamento.data,
      hora: horario,
      status: StatusAgendamento.ABERTO,
      observacoes: preAgendamento.observacoes
    };

    // Criar o agendamento e remover o pré-agendamento
    return this.agendamentoService.addAgendamento(novoAgendamento as Agendamento).pipe(
      switchMap(agendamentoCriado => {
        // Após criar o agendamento, remover o pré-agendamento
        return this.preAgendamentoService.removePreAgendamento(preAgendamento.id).pipe(
          map(() => agendamentoCriado)
        );
      })
    );
  }
}

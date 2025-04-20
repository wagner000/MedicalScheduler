import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreAgendamento } from '../../models/pre-agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { AgendamentoService } from '../../services/agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';

@Component({
  selector: 'app-confirmar-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmar-agendamento.component.html',
  styleUrls: ['./confirmar-agendamento.component.css']
})
export class ConfirmarAgendamentoComponent implements OnInit {
  @Input() preAgendamento!: PreAgendamento;
  @Output() fechar = new EventEmitter<void>();
  @Output() confirmado = new EventEmitter<void>();

  horaSelecionada: string = '';
  horarios: string[] = [];
  colaborador?: Colaborador;
  mensagemErro: string = '';
  mensagemSucesso: string = '';
  processando: boolean = false;

  constructor(
    private agendamentoService: AgendamentoService,
    private colaboradorService: ColaboradorService
  ) { }

  ngOnInit(): void {
    this.carregarColaborador();
    this.gerarHorariosDisponiveis();
  }

  carregarColaborador(): void {
    this.colaboradorService.getColaboradorById(this.preAgendamento.colaboradorId)
      .subscribe(colaborador => {
        this.colaborador = colaborador;
      });
  }

  gerarHorariosDisponiveis(): void {
    // Horários padrão de 8h às 18h, a cada 30 minutos
    const horariosBase = [];
    for (let hora = 8; hora < 18; hora++) {
      const horaFormatada = hora.toString().padStart(2, '0');
      horariosBase.push(`${horaFormatada}:00`);
      horariosBase.push(`${horaFormatada}:30`);
    }

    // Verificar disponibilidade de cada horário
    this.horarios = [];
    horariosBase.forEach(horario => {
      this.agendamentoService.verificarDisponibilidade(
        this.preAgendamento.colaboradorId,
        this.preAgendamento.data,
        horario
      ).subscribe(disponivel => {
        if (disponivel) {
          this.horarios.push(horario);
        }
        
        // Após verificar, ordenar os horários
        this.horarios.sort();
        
        // Definir o primeiro horário disponível como selecionado
        if (this.horarios.length > 0 && !this.horaSelecionada) {
          this.horaSelecionada = this.horarios[0];
        }
      });
    });
  }

  formatarData(dataString: string): string {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  confirmar(): void {
    if (!this.horaSelecionada) {
      this.mensagemErro = 'Selecione um horário para o agendamento';
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.processando = true;

    this.agendamentoService.confirmarPreAgendamento(this.preAgendamento, this.horaSelecionada)
      .subscribe({
        next: (agendamento) => {
          this.mensagemSucesso = 'Agendamento confirmado com sucesso!';
          this.processando = false;
          
          // Dar um tempo para o usuário ver a mensagem de sucesso
          setTimeout(() => {
            this.confirmado.emit();
          }, 1500);
        },
        error: (erro) => {
          this.mensagemErro = 'Erro ao confirmar agendamento. Tente novamente.';
          this.processando = false;
          console.error('Erro:', erro);
        }
      });
  }

  fecharModal(): void {
    this.fechar.emit();
  }

  pararPropagacao(event: MouseEvent): void {
    event.stopPropagation();
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PreAgendamento } from '../../models/pre-agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { PreAgendamentoService } from '../../services/pre-agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { PreAgendamentoConverterService } from '../../services/pre-agendamento-converter.service';

@Component({
  selector: 'app-pre-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pre-agendamentos.component.html',
  styleUrls: ['./pre-agendamentos.component.css']
})
export class PreAgendamentosComponent implements OnInit {
  preAgendamentos: PreAgendamento[] = [];
  colaboradores: Colaborador[] = [];
  dataSelecionada: Date = new Date();
  dataFormatada: string = '';
  colaboradorFiltroId?: number;
  mostrarModal = false;
  preAgendamentoSelecionado?: PreAgendamento;
  horarioSelecionado: string = '';
  horariosDisponiveis: string[] = [];
  mensagemErro: string = '';

  constructor(
    private preAgendamentoService: PreAgendamentoService,
    private colaboradorService: ColaboradorService,
    private preAgendamentoConverterService: PreAgendamentoConverterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formatarData();
    this.carregarDados();
  }

  formatarData(): void {
    // Formata a data para o formato YYYY-MM-DD para uso nas consultas
    const year = this.dataSelecionada.getFullYear();
    const month = String(this.dataSelecionada.getMonth() + 1).padStart(2, '0');
    const day = String(this.dataSelecionada.getDate()).padStart(2, '0');
    this.dataFormatada = `${year}-${month}-${day}`;
  }

  carregarDados(): void {
    // Carregar pré-agendamentos
    this.preAgendamentoService.getPreAgendamentosByData(this.dataFormatada)
      .subscribe(preAgendamentos => {
        this.preAgendamentos = preAgendamentos;
      });

    // Carregar colaboradores para o filtro
    this.colaboradorService.getColaboradores()
      .subscribe(colaboradores => {
        this.colaboradores = colaboradores;
      });
  }

  diaAnterior(): void {
    const novaData = new Date(this.dataSelecionada);
    novaData.setDate(novaData.getDate() - 1);
    this.dataSelecionada = novaData;
    this.formatarData();
    this.carregarDados();
  }

  diaSeguinte(): void {
    const novaData = new Date(this.dataSelecionada);
    novaData.setDate(novaData.getDate() + 1);
    this.dataSelecionada = novaData;
    this.formatarData();
    this.carregarDados();
  }

  filtrarPorColaborador(): void {
    if (this.colaboradorFiltroId) {
      this.preAgendamentoService.getPreAgendamentosByColaboradorEData(
        this.colaboradorFiltroId, 
        this.dataFormatada
      ).subscribe(preAgendamentos => {
        this.preAgendamentos = preAgendamentos;
      });
    } else {
      this.preAgendamentoService.getPreAgendamentosByData(this.dataFormatada)
        .subscribe(preAgendamentos => {
          this.preAgendamentos = preAgendamentos;
        });
    }
  }

  limparFiltro(): void {
    this.colaboradorFiltroId = undefined;
    this.filtrarPorColaborador();
  }

  formatarDataExibicao(data: string): string {
    // Formata a data do formato YYYY-MM-DD para DD/MM/YYYY
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  }

  getColaboradorNome(colaboradorId: number): string {
    const colaborador = this.colaboradores.find(c => c.id === colaboradorId);
    return colaborador ? colaborador.nome : 'Não encontrado';
  }

  novoPreAgendamento(): void {
    this.router.navigate(['/pre-agendamentos/novo']);
  }

  fazerCheckIn(preAgendamento: PreAgendamento): void {
    this.preAgendamentoSelecionado = preAgendamento;
    this.horarioSelecionado = '';
    this.mensagemErro = '';
    this.gerarHorariosDisponiveis();
    this.mostrarModal = true;
  }

  gerarHorariosDisponiveis(): void {
    // Gerar horários de 30 em 30 minutos das 8h às 18h
    const horarios: string[] = [];
    for (let hora = 8; hora < 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaFormatada = hora.toString().padStart(2, '0');
        const minutoFormatado = minuto.toString().padStart(2, '0');
        horarios.push(`${horaFormatada}:${minutoFormatado}`);
      }
    }
    this.horariosDisponiveis = horarios;
  }

  confirmarAgendamento(): void {
    if (!this.preAgendamentoSelecionado || !this.horarioSelecionado) {
      this.mensagemErro = 'Por favor, selecione um horário para o agendamento.';
      return;
    }

    this.preAgendamentoConverterService
      .converterParaAgendamento(this.preAgendamentoSelecionado, this.horarioSelecionado)
      .subscribe({
        next: () => {
          this.fecharModal();
          this.carregarDados(); // Recarregar a lista de pré-agendamentos
        },
        error: (erro) => {
          console.error('Erro ao confirmar agendamento:', erro);
          this.mensagemErro = 'Ocorreu um erro ao confirmar o agendamento. Por favor, tente novamente.';
        }
      });
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.preAgendamentoSelecionado = undefined;
  }

  aposConfirmacao(): void {
    this.mostrarModal = false;
    this.preAgendamentoSelecionado = undefined;
    this.carregarDados();
  }
}
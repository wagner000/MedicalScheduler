import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgendamentoService } from '../../services/agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { ClienteService } from '../../services/cliente.service';
import { Agendamento, StatusAgendamento } from '../../models/agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { Cliente } from '../../models/cliente.model';

interface AgendamentoView {
  id: number;
  horario: string;
  cliente: Cliente;
  colaborador: Colaborador;
  status: StatusAgendamento;
  observacoes?: string;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  agendamentosView: AgendamentoView[] = [];
  colaboradores: Colaborador[] = [];
  clientes: Cliente[] = [];
  dataSelecionada: Date = new Date();
  dataFormatada: string = '';
  colaboradoresComAgendamentos: Colaborador[] = [];
  filtroColaboradorId?: number;
  filtroStatus?: StatusAgendamento;
  filtroColaboradorTemp?: number;
  filtroStatusTemp?: StatusAgendamento;
  mostrarFiltroModal = false;

  constructor(
    private agendamentoService: AgendamentoService,
    private colaboradorService: ColaboradorService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.formatarData();
    this.carregarDados();
  }

  formatarData(): void {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    this.dataFormatada = this.dataSelecionada.toLocaleDateString('pt-BR', options);
  }

  carregarDados(): void {
    // Converter a data para o formato YYYY-MM-DD para filtrar os agendamentos
    const dataFormatadaYYYYMMDD = this.dataSelecionada.toISOString().split('T')[0];

    // Carregar colaboradores
    this.colaboradorService.getColaboradores().subscribe(colaboradores => {
      this.colaboradores = colaboradores;
      
      // Carregar clientes
      this.clienteService.getClientes().subscribe(clientes => {
        this.clientes = clientes;
        
        // Carregar agendamentos para a data selecionada
        this.agendamentoService.getAgendamentosByData(dataFormatadaYYYYMMDD).subscribe(agendamentos => {
          this.agendamentos = agendamentos;
          
          // Aplicar filtros se existirem
          if (this.filtroColaboradorId) {
            this.agendamentos = this.agendamentos.filter(a => a.colaboradorId === this.filtroColaboradorId);
          }
          
          if (this.filtroStatus) {
            this.agendamentos = this.agendamentos.filter(a => a.status === this.filtroStatus);
          }
          
          // Mapear agendamentos para a visualização
          this.mapearAgendamentosParaView();
          
          // Identificar colaboradores que têm agendamentos para o dia
          this.identificarColaboradoresComAgendamentos();
        });
      });
    });
  }

  mapearAgendamentosParaView(): void {
    this.agendamentosView = this.agendamentos.map(agendamento => {
      const colaborador = this.colaboradores.find(c => c.id === agendamento.colaboradorId);
      const cliente = this.clientes.find(c => c.id === agendamento.clienteId);
      
      if (!colaborador || !cliente) {
        console.error('Colaborador ou cliente não encontrado para agendamento:', agendamento);
        return null;
      }
      
      return {
        id: agendamento.id,
        horario: agendamento.hora,
        cliente,
        colaborador,
        status: agendamento.status,
        observacoes: agendamento.observacoes
      };
    }).filter(a => a !== null) as AgendamentoView[];
  }

  identificarColaboradoresComAgendamentos(): void {
    // Encontrar IDs únicos de colaboradores nos agendamentos
    const colaboradorIds = [...new Set(this.agendamentos.map(a => a.colaboradorId))];
    
    // Filtrar a lista completa de colaboradores para apenas aqueles com agendamentos
    this.colaboradoresComAgendamentos = this.colaboradores.filter(c => 
      colaboradorIds.includes(c.id)
    );
  }

  getAgendamentosParaColaborador(colaboradorId: number): AgendamentoView[] {
    return this.agendamentosView.filter(a => a.colaborador.id === colaboradorId);
  }

  getStatusClass(status: StatusAgendamento): string {
    switch (status) {
      case StatusAgendamento.ABERTO:
        return 'status-aberto';
      case StatusAgendamento.CONCLUIDO:
        return 'status-concluido';
      case StatusAgendamento.CANCELADO:
        return 'status-cancelado';
      case StatusAgendamento.NAO_COMPARECEU:
        return 'status-nao-compareceu';
      default:
        return '';
    }
  }

  diaAnterior(): void {
    this.dataSelecionada.setDate(this.dataSelecionada.getDate() - 1);
    this.formatarData();
    this.carregarDados();
  }

  diaSeguinte(): void {
    this.dataSelecionada.setDate(this.dataSelecionada.getDate() + 1);
    this.formatarData();
    this.carregarDados();
  }

  abrirCalendario(): void {
    // Esta função seria implementada com um componente de calendário
    // para permitir que o usuário selecione uma data
    console.log('Abrir calendário');
  }

  abrirFiltroModal(): void {
    this.filtroColaboradorTemp = this.filtroColaboradorId;
    this.filtroStatusTemp = this.filtroStatus;
    this.mostrarFiltroModal = true;
  }

  fecharFiltroModal(): void {
    this.mostrarFiltroModal = false;
  }

  aplicarFiltro(colaboradorId?: number, status?: StatusAgendamento): void {
    this.filtroColaboradorId = colaboradorId;
    this.filtroStatus = status;
    this.fecharFiltroModal();
    this.carregarDados();
  }

  limparFiltros(): void {
    this.filtroColaboradorId = undefined;
    this.filtroStatus = undefined;
    this.carregarDados();
  }
}
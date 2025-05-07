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
  horariosDisponiveis: string[] = [];

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
        console.log('CLIENTES', this.clientes);
        
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
    
    // Depois de mapear os agendamentos, identificar os horários disponíveis
    this.identificarHorariosDisponiveis();
  }

  identificarHorariosDisponiveis(): void {
    // Se não houver agendamentos, definir um horário padrão
    if (this.agendamentosView.length === 0) {
      this.horariosDisponiveis = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
        '17:00', '17:30', '18:00'
      ];
      return;
    }
    
    // Extrair os horários únicos dos agendamentos
    const horariosSet = new Set<string>();
    this.agendamentosView.forEach(agendamento => {
      horariosSet.add(agendamento.horario);
    });
    
    // Converter o Set para array
    let horarios = Array.from(horariosSet);
    
    // Ordenar os horários
    horarios.sort((a, b) => {
      return a.localeCompare(b);
    });
    
    // Verificar se há horários suficientes para exibir
    // Se houver poucos, adicionar horários extras para ter no mínimo 10 faixas
    if (horarios.length < 10) {
      // Adicionar 30 minutos antes do primeiro horário e 30 minutos depois do último
      const primeiroHorario = this.converterHoraParaMinutos(horarios[0]);
      const ultimoHorario = this.converterHoraParaMinutos(horarios[horarios.length - 1]);
      
      // Adicionar slots de 30 minutos antes
      for (let i = 1; i <= 3; i++) {
        const novoHorario = primeiroHorario - (i * 30);
        if (novoHorario >= 0) { // Garantir que não vá para um horário negativo
          horarios.push(this.converterMinutosParaHora(novoHorario));
        }
      }
      
      // Adicionar slots de 30 minutos depois
      for (let i = 1; i <= 3; i++) {
        const novoHorario = ultimoHorario + (i * 30);
        if (novoHorario < 24 * 60) { // Garantir que não ultrapasse as 24 horas
          horarios.push(this.converterMinutosParaHora(novoHorario));
        }
      }
      
      // Reordenar após adicionar novos horários
      horarios.sort((a, b) => {
        return a.localeCompare(b);
      });
    }
    
    this.horariosDisponiveis = horarios;
  }
  
  // Método auxiliar para converter um horário no formato "HH:MM" para minutos
  converterHoraParaMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }
  
  // Método auxiliar para converter minutos para um horário no formato "HH:MM"
  converterMinutosParaHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
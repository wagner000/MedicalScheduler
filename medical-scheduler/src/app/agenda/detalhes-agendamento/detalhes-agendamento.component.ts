import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgendamentoService } from '../../services/agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { ClienteService } from '../../services/cliente.service';
import { Agendamento, StatusAgendamento } from '../../models/agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-detalhes-agendamento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-between align-center">
        <h2 class="card-title">Detalhes do Agendamento</h2>
        <button class="btn btn-secondary" (click)="voltar()">Voltar</button>
      </div>
      
      <div class="card-body">
        <div *ngIf="carregando" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando informações...</p>
        </div>
        
        <div *ngIf="erro" class="alert alert-danger">
          <p>{{ mensagem }}</p>
          <button class="btn btn-secondary mt-2" (click)="voltar()">Voltar para Agenda</button>
        </div>
        
        <div *ngIf="!carregando && !erro && agendamento" class="agendamento-detalhes">
          <div class="status-badge" [ngClass]="getStatusClass(agendamento.status)">
            {{ getStatusText(agendamento.status) }}
          </div>
          
          <div class="detalhes-section">
            <h3>Informações do Agendamento</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Data:</span>
                <span class="info-value">{{ formatarData(agendamento.data) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora:</span>
                <span class="info-value">{{ agendamento.hora }}</span>
              </div>
            </div>
          </div>
          
          <div class="detalhes-section">
            <h3>Profissional</h3>
            <div *ngIf="colaborador" class="colaborador-info d-flex gap-2 align-center">
              <div class="avatar">
                <div class="foto-placeholder">
                  {{ colaborador.nome.charAt(0) }}
                </div>
              </div>
              <div>
                <h4>{{ colaborador.nome }}</h4>
                <p>{{ colaborador.especialidade }}</p>
                <p *ngIf="colaborador.telefone">Tel: {{ colaborador.telefone }}</p>
              </div>
            </div>
          </div>
          
          <div class="detalhes-section">
            <h3>Cliente</h3>
            <div *ngIf="cliente" class="cliente-info">
              <h4>{{ cliente.nome }}</h4>
              <p>CPF: {{ cliente.cpf }}</p>
              <p *ngIf="cliente.telefone">Tel: {{ cliente.telefone }}</p>
              <p *ngIf="cliente.email">Email: {{ cliente.email }}</p>
            </div>
          </div>
          
          <div class="detalhes-section" *ngIf="agendamento.observacoes">
            <h3>Observações</h3>
            <p class="observacoes">{{ agendamento.observacoes }}</p>
          </div>
          
          <div class="acoes-container mt-3">
            <div class="status-acoes" *ngIf="agendamento.status === statusAgendamento.ABERTO">
              <button class="btn btn-primary" (click)="atualizarStatus(statusAgendamento.CONCLUIDO)">
                Marcar como Concluído
              </button>
              <button class="btn btn-secondary" (click)="atualizarStatus(statusAgendamento.CANCELADO)">
                Cancelar Agendamento
              </button>
              <button class="btn btn-secondary" (click)="atualizarStatus(statusAgendamento.NAO_COMPARECEU)">
                Não Compareceu
              </button>
            </div>
            
            <div class="d-flex justify-between mt-3">
              <button class="btn btn-danger" (click)="excluirAgendamento()">
                Excluir
              </button>
              <button class="btn btn-primary" (click)="editarAgendamento()">
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #6a4c93;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }
    
    .status-aberto {
      background-color: #e8f5e9;
      color: #4caf50;
    }
    
    .status-concluido {
      background-color: #e3f2fd;
      color: #2196f3;
    }
    
    .status-cancelado {
      background-color: #fafafa;
      color: #9e9e9e;
    }
    
    .status-nao-compareceu {
      background-color: #fff8e1;
      color: #ff9800;
    }
    
    .detalhes-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .detalhes-section:last-child {
      border-bottom: none;
    }
    
    .detalhes-section h3 {
      font-size: 1.1rem;
      color: #6a4c93;
      margin-bottom: 1rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-weight: 500;
      font-size: 0.875rem;
      color: #666;
    }
    
    .info-value {
      font-size: 1rem;
    }
    
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 1rem;
    }
    
    .foto-placeholder {
      width: 100%;
      height: 100%;
      background-color: #6a4c93;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    .colaborador-info h4, .cliente-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    .colaborador-info p, .cliente-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
    }
    
    .observacoes {
      white-space: pre-line;
      background-color: #f9f9f9;
      padding: 1rem;
      border-radius: 4px;
    }
    
    .status-acoes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .alert-danger {
      background-color: #ffebee;
      color: #c62828;
    }
    
    @media (max-width: 768px) {
      .status-acoes {
        flex-direction: column;
      }
      
      .status-acoes button {
        width: 100%;
      }
      
      .d-flex.justify-between {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .d-flex.justify-between button {
        width: 100%;
      }
    }
  `]
})
export class DetalhesAgendamentoComponent implements OnInit {
  agendamento?: Agendamento;
  colaborador?: Colaborador;
  cliente?: Cliente;
  statusAgendamento = StatusAgendamento;
  carregando = true;
  erro = false;
  mensagem = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendamentoService: AgendamentoService,
    private colaboradorService: ColaboradorService,
    private clienteService: ClienteService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.carregarAgendamento(id);
      } else {
        this.erro = true;
        this.mensagem = 'ID do agendamento é inválido.';
        this.carregando = false;
      }
    });
  }
  
  carregarAgendamento(id: number): void {
    this.carregando = true;
    this.agendamentoService.getAgendamentoById(id).subscribe(
      agendamento => {
        if (agendamento) {
          this.agendamento = agendamento;
          this.carregarColaborador(agendamento.colaboradorId);
          this.carregarCliente(agendamento.cliente!.id);
        } else {
          this.erro = true;
          this.mensagem = 'Agendamento não encontrado.';
          this.carregando = false;
        }
      },
      error => {
        this.erro = true;
        this.mensagem = 'Erro ao carregar agendamento. Tente novamente.';
        this.carregando = false;
      }
    );
  }
  
  carregarColaborador(id: number): void {
    this.colaboradorService.getColaboradorById(id).subscribe(
      colaborador => {
        this.colaborador = colaborador;
        this.verificarCarregamento();
      },
      error => {
        this.erro = true;
        this.mensagem = 'Erro ao carregar informações do colaborador.';
        this.carregando = false;
      }
    );
  }
  
  carregarCliente(id: number): void {
    this.clienteService.getClienteById(id).subscribe(
      cliente => {
        this.cliente = cliente;
        this.verificarCarregamento();
      },
      error => {
        this.erro = true;
        this.mensagem = 'Erro ao carregar informações do cliente.';
        this.carregando = false;
      }
    );
  }
  
  verificarCarregamento(): void {
    if (this.colaborador && this.cliente) {
      this.carregando = false;
    }
  }
  
  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
  
  getStatusText(status: StatusAgendamento): string {
    switch (status) {
      case StatusAgendamento.ABERTO:
        return 'Agendamento Aberto';
      case StatusAgendamento.CONCLUIDO:
        return 'Concluído';
      case StatusAgendamento.CANCELADO:
        return 'Cancelado';
      case StatusAgendamento.NAO_COMPARECEU:
        return 'Não Compareceu';
      default:
        return '';
    }
  }
  
  atualizarStatus(status: StatusAgendamento): void {
    if (!this.agendamento) return;
    
    this.carregando = true;
    this.agendamentoService.updateStatusAgendamento(this.agendamento.id, status).subscribe(
      agendamentoAtualizado => {
        if (agendamentoAtualizado) {
          this.agendamento = agendamentoAtualizado;
        }
        this.carregando = false;
      },
      error => {
        this.erro = true;
        this.mensagem = 'Erro ao atualizar status. Tente novamente.';
        this.carregando = false;
      }
    );
  }
  
  excluirAgendamento(): void {
    if (!this.agendamento) return;
    
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      this.carregando = true;
      this.agendamentoService.deleteAgendamento(this.agendamento.id).subscribe(
        sucesso => {
          if (sucesso) {
            this.router.navigate(['/agenda']);
          } else {
            this.erro = true;
            this.mensagem = 'Erro ao excluir agendamento.';
            this.carregando = false;
          }
        },
        error => {
          this.erro = true;
          this.mensagem = 'Erro ao excluir agendamento. Tente novamente.';
          this.carregando = false;
        }
      );
    }
  }
  
  editarAgendamento(): void {
    if (!this.agendamento) return;
    this.router.navigate(['/agenda', this.agendamento.id, 'editar']);
  }
  
  voltar(): void {
    this.router.navigate(['/agenda']);
  }
}
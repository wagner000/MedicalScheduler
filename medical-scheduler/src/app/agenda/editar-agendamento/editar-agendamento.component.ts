import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendamentoService } from '../../services/agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { ClienteService } from '../../services/cliente.service';
import { Agendamento, StatusAgendamento } from '../../models/agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-editar-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-between align-center">
        <h2 class="card-title">Editar Agendamento</h2>
        <button class="btn btn-secondary" (click)="cancelar()">Voltar</button>
      </div>
      
      <div class="card-body">
        <div *ngIf="carregando" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando informações...</p>
        </div>
        
        <div *ngIf="mensagemErro" class="alert alert-danger mb-3">
          {{ mensagemErro }}
        </div>
        
        <div *ngIf="mensagemSucesso" class="alert alert-success mb-3">
          {{ mensagemSucesso }}
        </div>
        
        <form *ngIf="!carregando && agendamento && cliente">
          <div class="form-section">
            <h3 class="section-title">Informações do Cliente</h3>
            <div class="cliente-info">
              <p><strong>Nome:</strong> {{ cliente.nome }}</p>
              <p><strong>CPF:</strong> {{ cliente.cpf }}</p>
              <p *ngIf="cliente.telefone"><strong>Telefone:</strong> {{ cliente.telefone }}</p>
            </div>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">Dados do Agendamento</h3>
            
            <div class="form-group">
              <label for="colaborador">Colaborador</label>
              <select 
                id="colaborador" 
                class="form-control" 
                [(ngModel)]="agendamento.colaboradorId" 
                name="colaborador"
                (change)="verificarDisponibilidade()"
                required
              >
                <option *ngFor="let colaborador of colaboradores" [ngValue]="colaborador.id">
                  {{ colaborador.nome }} - {{ colaborador.especialidade }}
                </option>
              </select>
            </div>
            
            <div class="form-row d-flex gap-2">
              <div class="form-group w-100">
                <label for="data">Data</label>
                <input 
                  type="date" 
                  id="data" 
                  class="form-control" 
                  [(ngModel)]="agendamento.data" 
                  name="data"
                  (change)="verificarDisponibilidade()"
                  required
                >
              </div>
              
              <div class="form-group w-100">
                <label for="hora">Hora</label>
                <input 
                  type="time" 
                  id="hora" 
                  class="form-control" 
                  [(ngModel)]="agendamento.hora" 
                  name="hora"
                  (change)="verificarDisponibilidade()"
                  required
                >
              </div>
            </div>
            
            <div *ngIf="!horarioDisponivel" class="alert alert-warning mt-2">
              <p>Este horário não está disponível para este colaborador.</p>
              <p><small>Você pode salvar mesmo assim se este agendamento já existia neste horário.</small></p>
            </div>
            
            <div class="form-group">
              <label for="status">Status</label>
              <select 
                id="status" 
                class="form-control" 
                [(ngModel)]="agendamento.status" 
                name="status"
                required
              >
                <option [ngValue]="statusAgendamento.ABERTO">Aberto</option>
                <option [ngValue]="statusAgendamento.CONCLUIDO">Concluído</option>
                <option [ngValue]="statusAgendamento.CANCELADO">Cancelado</option>
                <option [ngValue]="statusAgendamento.NAO_COMPARECEU">Não Compareceu</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="observacoes">Observações</label>
              <textarea 
                id="observacoes" 
                class="form-control" 
                [(ngModel)]="agendamento.observacoes" 
                name="observacoes"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="d-flex justify-between mt-3">
            <button type="button" class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="!agendamento.colaboradorId || !agendamento.data || !agendamento.hora" 
              (click)="salvar()"
            >
              Salvar
            </button>
          </div>
        </form>
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
    
    .form-section {
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.1rem;
      color: #6a4c93;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .cliente-info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .cliente-info p {
      margin: 0 0 0.5rem 0;
    }
    
    .cliente-info p:last-child {
      margin-bottom: 0;
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .alert-danger {
      background-color: #fce8e8;
      color: #e63946;
      border: 1px solid #f9c9cd;
    }
    
    .alert-success {
      background-color: #e8f5e9;
      color: #4caf50;
      border: 1px solid #c9e9ca;
    }
    
    .alert-warning {
      background-color: #fff8e1;
      color: #ff9800;
      border: 1px solid #ffecb3;
    }
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
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
export class EditarAgendamentoComponent implements OnInit {
  agendamento?: Agendamento;
  colaboradores: Colaborador[] = [];
  cliente?: Cliente;
  carregando = true;
  mensagemErro = '';
  mensagemSucesso = '';
  horarioDisponivel = true;
  agendamentoOriginalHora = '';
  agendamentoOriginalData = '';
  agendamentoOriginalColaboradorId = 0;
  statusAgendamento = StatusAgendamento;
  
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
        this.carregarDados(id);
      } else {
        this.mensagemErro = 'ID do agendamento é inválido.';
        this.carregando = false;
      }
    });
  }
  
  carregarDados(id: number): void {
    this.carregando = true;
    
    // Carregar colaboradores
    this.colaboradorService.getColaboradores().subscribe(
      colaboradores => {
        this.colaboradores = colaboradores;
        
        // Carregar o agendamento
        this.agendamentoService.getAgendamentoById(id).subscribe(
          agendamento => {
            if (agendamento) {
              this.agendamento = { ...agendamento };
              
              // Salvar valores originais para verificar se houve mudança
              this.agendamentoOriginalHora = agendamento.hora;
              this.agendamentoOriginalData = agendamento.data;
              this.agendamentoOriginalColaboradorId = agendamento.colaboradorId;
              
              // Carregar o cliente
              this.clienteService.getClienteById(agendamento.clienteId).subscribe(
                cliente => {
                  this.cliente = cliente;
                  this.carregando = false;
                },
                error => {
                  this.mensagemErro = 'Erro ao carregar informações do cliente.';
                  this.carregando = false;
                }
              );
            } else {
              this.mensagemErro = 'Agendamento não encontrado.';
              this.carregando = false;
            }
          },
          error => {
            this.mensagemErro = 'Erro ao carregar agendamento.';
            this.carregando = false;
          }
        );
      },
      error => {
        this.mensagemErro = 'Erro ao carregar colaboradores.';
        this.carregando = false;
      }
    );
  }
  
  verificarDisponibilidade(): void {
    if (!this.agendamento) return;
    
    // Se não houver mudança na data, hora ou colaborador, não é necessário verificar
    if (
      this.agendamento.hora === this.agendamentoOriginalHora &&
      this.agendamento.data === this.agendamentoOriginalData &&
      this.agendamento.colaboradorId === this.agendamentoOriginalColaboradorId
    ) {
      this.horarioDisponivel = true;
      return;
    }
    
    this.agendamentoService.verificarDisponibilidade(
      this.agendamento.colaboradorId,
      this.agendamento.data,
      this.agendamento.hora
    ).subscribe(disponivel => {
      this.horarioDisponivel = disponivel;
    });
  }
  
  salvar(): void {
    if (!this.agendamento) return;
    
    this.carregando = true;
    this.atualizarAgendamento();
  }
  
  private atualizarAgendamento(): void {
    if (!this.agendamento) return;
    
    this.agendamentoService.updateAgendamento(this.agendamento).subscribe(
      agendamentoAtualizado => {
        this.mensagemSucesso = 'Agendamento atualizado com sucesso!';
        setTimeout(() => {
          this.router.navigate(['/agenda', this.agendamento?.id]);
        }, 1500);
      },
      error => {
        this.mensagemErro = 'Erro ao atualizar agendamento. Tente novamente.';
        this.carregando = false;
      }
    );
  }
  
  cancelar(): void {
    if (this.agendamento) {
      this.router.navigate(['/agenda', this.agendamento.id]);
    } else {
      this.router.navigate(['/agenda']);
    }
  }
}
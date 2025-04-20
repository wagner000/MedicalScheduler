import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColaboradorService } from '../../services/colaborador.service';
import { ClienteService } from '../../services/cliente.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { Colaborador } from '../../models/colaborador.model';
import { Cliente } from '../../models/cliente.model';
import { Agendamento, StatusAgendamento } from '../../models/agendamento.model';

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-between align-center">
        <h2 class="card-title">Novo Agendamento</h2>
        <button class="btn btn-secondary" (click)="cancelar()">Voltar</button>
      </div>
      
      <div class="card-body">
        <div *ngIf="mensagemErro" class="alert alert-danger mb-3">
          {{ mensagemErro }}
        </div>
        
        <div *ngIf="mensagemSucesso" class="alert alert-success mb-3">
          {{ mensagemSucesso }}
        </div>
        
        <form>
          <h3 class="mb-2">Dados do Cliente</h3>
          
          <!-- Buscar cliente existente por CPF -->
          <div class="form-group">
            <label for="cpf">CPF</label>
            <div class="d-flex gap-2">
              <input 
                type="text" 
                id="cpf" 
                class="form-control" 
                [(ngModel)]="cliente.cpf" 
                name="cpf"
                placeholder="Ex: 123.456.789-00"
                [disabled]="clienteExistente"
              >
              <button 
                type="button" 
                class="btn btn-primary" 
                [disabled]="!cliente.cpf || clienteExistente" 
                (click)="buscarClientePorCpf()"
              >
                Buscar
              </button>
            </div>
          </div>
          
          <!-- Dados do cliente -->
          <div class="form-group">
            <label for="nomeCliente">Nome</label>
            <input 
              type="text" 
              id="nomeCliente" 
              class="form-control" 
              [(ngModel)]="cliente.nome" 
              name="nomeCliente"
              [disabled]="clienteExistente"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="telefone">Telefone</label>
            <input 
              type="tel" 
              id="telefone" 
              class="form-control" 
              [(ngModel)]="cliente.telefone" 
              name="telefone"
              [disabled]="clienteExistente"
            >
          </div>
          
          <h3 class="mb-2 mt-3">Dados do Agendamento</h3>
          
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
              <option [ngValue]="undefined" disabled>Selecione um colaborador</option>
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
            Atenção: Este horário não está disponível para o colaborador selecionado.
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
          
          <div class="d-flex justify-between mt-3">
            <button type="button" class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="!isFormValid() || !horarioDisponivel" 
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
  `]
})
export class NovoAgendamentoComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  cliente: Cliente = {
    id: 0,
    nome: '',
    cpf: '',
  };
  
  agendamento: Agendamento = {
    id: 0,
    clienteId: 0,
    colaboradorId: 0,
    data: new Date().toISOString().split('T')[0],
    hora: '08:00',
    status: StatusAgendamento.ABERTO
  };
  
  clienteExistente: boolean = false;
  mensagemErro: string = '';
  mensagemSucesso: string = '';
  horarioDisponivel: boolean = true;
  
  constructor(
    private router: Router,
    private colaboradorService: ColaboradorService,
    private clienteService: ClienteService,
    private agendamentoService: AgendamentoService
  ) {}
  
  ngOnInit(): void {
    this.carregarColaboradores();
  }
  
  carregarColaboradores(): void {
    this.colaboradorService.getColaboradores().subscribe(colaboradores => {
      this.colaboradores = colaboradores;
    });
  }
  
  buscarClientePorCpf(): void {
    if (!this.cliente.cpf) {
      this.mensagemErro = 'Informe o CPF do cliente para buscar.';
      return;
    }
    
    this.clienteService.getClienteByCpf(this.cliente.cpf).subscribe(cliente => {
      if (cliente) {
        this.cliente = cliente;
        this.clienteExistente = true;
        this.mensagemErro = '';
      } else {
        this.mensagemErro = 'Cliente não encontrado com este CPF. Preencha os dados para cadastrar um novo cliente.';
        this.clienteExistente = false;
      }
    });
  }
  
  verificarDisponibilidade(): void {
    if (!this.agendamento.colaboradorId || !this.agendamento.data || !this.agendamento.hora) {
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
  
  isFormValid(): boolean {
    return (
      !!this.cliente.nome &&
      !!this.cliente.cpf &&
      !!this.agendamento.colaboradorId &&
      !!this.agendamento.data &&
      !!this.agendamento.hora
    );
  }
  
  salvar(): void {
    if (!this.isFormValid()) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios.';
      return;
    }
    
    if (!this.horarioDisponivel) {
      this.mensagemErro = 'O horário selecionado não está disponível.';
      return;
    }
    
    this.mensagemErro = '';
    
    if (this.clienteExistente) {
      this.criarAgendamento(this.cliente.id);
    } else {
      this.clienteService.addCliente(this.cliente).subscribe(
        novoCliente => {
          this.criarAgendamento(novoCliente.id);
        },
        error => {
          this.mensagemErro = 'Erro ao cadastrar o cliente. Tente novamente.';
        }
      );
    }
  }
  
  private criarAgendamento(clienteId: number): void {
    const novoAgendamento: Agendamento = {
      ...this.agendamento,
      clienteId,
      id: 0,
      status: StatusAgendamento.ABERTO
    };
    
    this.agendamentoService.addAgendamento(novoAgendamento).subscribe(
      agendamento => {
        this.mensagemSucesso = 'Agendamento criado com sucesso!';
        setTimeout(() => {
          this.router.navigate(['/agenda']);
        }, 1500);
      },
      error => {
        this.mensagemErro = 'Erro ao criar o agendamento. Tente novamente.';
      }
    );
  }
  
  cancelar(): void {
    this.router.navigate(['/agenda']);
  }
}
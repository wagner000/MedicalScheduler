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
  templateUrl: './novo-agendamento.component.html',
  styleUrls: ['./novo-agendamento.component.css']
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
      this.criarAgendamento(this.cliente);
    } else {
      this.clienteService.addCliente(this.cliente).subscribe(
        novoCliente => {
          this.criarAgendamento(novoCliente);
        },
        error => {
          this.mensagemErro = 'Erro ao cadastrar o cliente. Tente novamente.';
        }
      );
    }
  }
  
  private criarAgendamento(cliente: Cliente): void {
    const novoAgendamento: Agendamento = {
      ...this.agendamento,
      cliente,
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
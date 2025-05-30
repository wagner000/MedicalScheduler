import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PreAgendamento } from '../../models/pre-agendamento.model';
import { Colaborador } from '../../models/colaborador.model';
import { Cliente } from '../../models/cliente.model';
import { PreAgendamentoService } from '../../services/pre-agendamento.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { ClienteService } from '../../services/cliente.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-novo-pre-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './novo-pre-agendamento.component.html',
  styleUrls: ['./novo-pre-agendamento.component.css']
})
export class NovoPreAgendamentoComponent implements OnInit {
  preAgendamento: PreAgendamento = {
    id: 0,
    nome: '',
    cpf: '',
    data: '',
    colaboradorId: 0,
    observacoes: ''
  };
  
  colaboradores: Colaborador[] = [];
  mensagemErro: string = '';
  mensagemSucesso: string = '';
  
  constructor(
    private preAgendamentoService: PreAgendamentoService,
    private colaboradorService: ColaboradorService,
    private clienteService: ClienteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarColaboradores();
    this.inicializarData();
  }

  carregarColaboradores(): void {
    this.colaboradorService.getColaboradores().subscribe(colaboradores => {
      this.colaboradores = colaboradores;
    });
  }

  inicializarData(): void {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.preAgendamento.data = `${ano}-${mes}-${dia}`;
  }

  formatarCpf(event: any): void {
    let cpf = event.target.value.replace(/\D/g, ''); // Remove não-dígitos
    
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11);
    }
    
    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    
    this.preAgendamento.cpf = cpf;
    this.buscarClientePorCpf();
  }

  validarFormulario(): boolean {
    if (!this.preAgendamento.cpf || this.preAgendamento.cpf.replace(/\D/g, '').length !== 11) {
      this.mensagemErro = 'CPF é obrigatório e deve ser válido';
      return false;
    }

    if (!this.preAgendamento.nome || this.preAgendamento.nome.trim().length < 3) {
      this.mensagemErro = 'Nome deve ter pelo menos 3 caracteres';
      return false;
    }

    if (!this.preAgendamento.data) {
      this.mensagemErro = 'Data é obrigatória';
      return false;
    }

    if (!this.preAgendamento.colaboradorId) {
      this.mensagemErro = 'Selecione um colaborador';
      return false;
    }

    return true;
  }

  buscarClientePorCpf(): void {
    if (!this.preAgendamento.cpf) return;

    const cpfLimpo = this.preAgendamento.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return;

    if (!this.preAgendamento.cpf) return;
    
    this.clienteService.getClienteByCpf(this.preAgendamento.cpf).subscribe(cliente => {
      if (cliente) {
        this.preAgendamento.nome = cliente.nome;
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = 'Salvando...';

    // Primeiro verifica se já existe um cliente com este CPF
    if (!this.preAgendamento.cpf) {
      this.mensagemErro = 'CPF é obrigatório';
      this.mensagemSucesso = '';
      return;
    }

    this.clienteService.getClienteByCpf(this.preAgendamento.cpf).subscribe(cliente => {
      if (cliente) {
        this.preAgendamento.nome = cliente.nome;
      }
    });
    this.preAgendamentoService.addPreAgendamento(this.preAgendamento).subscribe(() => {
      this.mensagemSucesso = 'Agendamento salvo com sucesso!';
      this.router.navigate(['/pre-agendamentos']);
    });
  }

  cancelar(): void {
    this.router.navigate(['/pre-agendamentos']);
  }
}
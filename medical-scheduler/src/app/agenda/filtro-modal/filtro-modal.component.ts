import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Colaborador } from '../../models/colaborador.model';
import { StatusAgendamento } from '../../models/agendamento.model';

@Component({
  selector: 'app-filtro-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-modal.component.html',
  styleUrls: ['./filtro-modal.component.css']
})
export class FiltroModalComponent {
  @Input() colaboradores: Colaborador[] = [];
  @Input() filtroColaboradorId?: number;
  @Input() filtroStatus?: StatusAgendamento;
  
  @Output() fechar = new EventEmitter<void>();
  @Output() aplicarFiltro = new EventEmitter<{colaboradorId?: number, status?: StatusAgendamento}>();
  @Output() limparFiltros = new EventEmitter<void>();
  
  selectedColaboradorId?: number;
  selectedStatus?: StatusAgendamento;
  
  // Enum para o template
  statusAgendamento = StatusAgendamento;
  
  ngOnInit() {
    this.selectedColaboradorId = this.filtroColaboradorId;
    this.selectedStatus = this.filtroStatus;
  }
  
  fecharModal() {
    this.fechar.emit();
  }
  
  aplicar() {
    this.aplicarFiltro.emit({
      colaboradorId: this.selectedColaboradorId,
      status: this.selectedStatus
    });
  }
  
  limpar() {
    this.selectedColaboradorId = undefined;
    this.selectedStatus = undefined;
    this.limparFiltros.emit();
  }
  
  pararPropagacao(event: MouseEvent) {
    event.stopPropagation();
  }
}
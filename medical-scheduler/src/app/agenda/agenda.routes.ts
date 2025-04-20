import { Routes } from '@angular/router';
import { AgendaComponent } from './agenda/agenda.component';
import { NovoAgendamentoComponent } from './novo-agendamento/novo-agendamento.component';
import { DetalhesAgendamentoComponent } from './detalhes-agendamento/detalhes-agendamento.component';
import { EditarAgendamentoComponent } from './editar-agendamento/editar-agendamento.component';

export const AGENDA_ROUTES: Routes = [
  {
    path: '',
    component: AgendaComponent
  },
  {
    path: 'novo',
    component: NovoAgendamentoComponent
  },
  {
    path: ':id',
    component: DetalhesAgendamentoComponent
  },
  {
    path: ':id/editar',
    component: EditarAgendamentoComponent
  }
];
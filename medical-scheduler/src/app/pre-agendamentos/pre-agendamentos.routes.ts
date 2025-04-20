import { Routes } from '@angular/router';

export const PRE_AGENDAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pre-agendamentos/pre-agendamentos.component').then(c => c.PreAgendamentosComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./novo-pre-agendamento/novo-pre-agendamento.component').then(c => c.NovoPreAgendamentoComponent)
  }
];
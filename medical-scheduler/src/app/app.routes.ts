import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/agenda', pathMatch: 'full' },
  { path: 'agenda', loadChildren: () => import('./agenda/agenda.routes').then(m => m.AGENDA_ROUTES) },
  { path: 'pre-agendamentos', loadChildren: () => import('./pre-agendamentos/pre-agendamentos.routes').then(m => m.PRE_AGENDAMENTOS_ROUTES) },
  { path: 'clientes', loadComponent: () => import('./components/clientes/clientes.component').then(c => c.ClientesComponent) },
  { path: 'colaboradores', loadComponent: () => import('./components/colaboradores/colaboradores.component').then(c => c.ColaboradoresComponent) },
  { path: 'cobrancas', loadComponent: () => import('./components/cobrancas/cobrancas.component').then(c => c.CobrancasComponent) },
  { path: '**', redirectTo: '/agenda' }
];

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Colaborador } from '../models/colaborador.model';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  private colaboradores: Colaborador[] = [
    {
      id: 1,
      nome: 'Dr. Wagner Silva',
      especialidade: 'Clínico Geral',
      email: 'wagner.silva@exemplo.com',
      telefone: '(11) 98765-4321',
      foto: 'https://randomuser.me/api/portraits/men/1.jpg',
      horarioInicio: '08:00',
      horarioFim: '18:00',
      diasDisponiveis: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
    },
    {
      id: 2,
      nome: 'Dra. Paula Nunes',
      especialidade: 'Dermatologista',
      email: 'paula.nunes@exemplo.com',
      telefone: '(11) 98755-4321',
      foto: 'https://randomuser.me/api/portraits/women/1.jpg',
      horarioInicio: '09:00',
      horarioFim: '17:00',
      diasDisponiveis: ['Segunda', 'Quarta', 'Sexta']
    },
    {
      id: 3,
      nome: 'Dr. Marcelo Costa',
      especialidade: 'Cardiologista',
      email: 'marcelo.costa@exemplo.com',
      telefone: '(11) 98744-4321',
      foto: 'https://randomuser.me/api/portraits/men/2.jpg',
      horarioInicio: '10:00',
      horarioFim: '19:00',
      diasDisponiveis: ['Terça', 'Quinta']
    }
  ];

  constructor() { }

  getColaboradores(): Observable<Colaborador[]> {
    return of(this.colaboradores);
  }

  getColaboradorById(id: number): Observable<Colaborador | undefined> {
    const colaborador = this.colaboradores.find(c => c.id === id);
    return of(colaborador);
  }

  addColaborador(colaborador: Colaborador): Observable<Colaborador> {
    // Gerando ID (em uma aplicação real, isso seria feito pelo backend)
    const newId = Math.max(...this.colaboradores.map(c => c.id)) + 1;
    const newColaborador = { ...colaborador, id: newId };
    this.colaboradores.push(newColaborador);
    return of(newColaborador);
  }

  updateColaborador(colaborador: Colaborador): Observable<Colaborador> {
    const index = this.colaboradores.findIndex(c => c.id === colaborador.id);
    if (index !== -1) {
      this.colaboradores[index] = { ...colaborador };
      return of(this.colaboradores[index]);
    }
    return of(colaborador); // retorna o colaborador sem alterações se não for encontrado
  }

  deleteColaborador(id: number): Observable<boolean> {
    const index = this.colaboradores.findIndex(c => c.id === id);
    if (index !== -1) {
      this.colaboradores.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
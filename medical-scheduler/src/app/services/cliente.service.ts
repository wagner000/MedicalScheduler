import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private clientes: Cliente[] = [
    {
      id: 1,
      nome: 'João Silva',
      cpf: '123.456.789-00',
      dataNascimento: '1985-05-15',
      sexo: 'M',
      email: 'joao.silva@exemplo.com',
      telefone: '(11) 99887-6655',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP'
    },
    {
      id: 2,
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      dataNascimento: '1990-10-20',
      sexo: 'F',
      email: 'maria.oliveira@exemplo.com',
      telefone: '(11) 99887-6644',
      endereco: 'Rua Augusta, 500 - São Paulo/SP'
    },
    {
      id: 3,
      nome: 'Pedro Santos',
      cpf: '456.789.123-00',
      dataNascimento: '1978-03-25',
      sexo: 'M',
      email: 'pedro.santos@exemplo.com',
      telefone: '(11) 99887-6633',
      endereco: 'Rua Oscar Freire, 200 - São Paulo/SP'
    }
  ];

  constructor() { }

  getClientes(): Observable<Cliente[]> {
    return of(this.clientes);
  }

  getClienteById(id: number): Observable<Cliente | undefined> {
    const cliente = this.clientes.find(c => c.id === id);
    return of(cliente);
  }

  getClienteByCpf(cpf: string): Observable<Cliente | undefined> {
    const cliente = this.clientes.find(c => c.cpf === cpf);
    return of(cliente);
  }

  addCliente(cliente: Cliente): Observable<Cliente> {
    // Gerando ID (em uma aplicação real, isso seria feito pelo backend)
    const newId = Math.max(...this.clientes.map(c => c.id)) + 1;
    const newCliente = { ...cliente, id: newId };
    this.clientes.push(newCliente);
    return of(newCliente);
  }
  
  updateCliente(cliente: Cliente): Observable<Cliente> {
    const index = this.clientes.findIndex(c => c.id === cliente.id);
    if (index !== -1) {
      this.clientes[index] = { ...cliente };
      return of(this.clientes[index]);
    }
    return of(cliente); // retorna o cliente sem alterações se não for encontrado
  }

  deleteCliente(id: number): Observable<boolean> {
    const index = this.clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clientes.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
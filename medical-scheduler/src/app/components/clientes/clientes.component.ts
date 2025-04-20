import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Gerenciamento de Clientes</h2>
      </div>
      <div class="card-body">
        <p>Esta funcionalidade estará disponível em breve.</p>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-top: 2rem;
    }
  `]
})
export class ClientesComponent {
}
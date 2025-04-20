import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: Patient[] = [
    {
      id: 1,
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      phone: '(11) 98888-7777',
      dateOfBirth: '1985-05-15',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      healthInsurance: 'Unimed',
      healthInsuranceNumber: '9876543210'
    },
    {
      id: 2,
      name: 'João Santos',
      email: 'joao.santos@example.com',
      phone: '(11) 97777-8888',
      dateOfBirth: '1990-10-20',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      healthInsurance: 'Amil',
      healthInsuranceNumber: '1234567890'
    },
    {
      id: 3,
      name: 'Fernanda Lima',
      email: 'fernanda.lima@example.com',
      phone: '(11) 96666-5555',
      dateOfBirth: '1978-03-25',
      address: 'Rua Augusta, 500 - São Paulo/SP',
      healthInsurance: 'SulAmérica',
      healthInsuranceNumber: '5678901234'
    }
  ];

  constructor() { }

  getPatients(): Observable<Patient[]> {
    return of(this.patients);
  }

  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.patients.find(p => p.id === id);
    return of(patient);
  }

  addPatient(patient: Patient): Observable<Patient> {
    // Generate a new ID based on the current highest ID
    const newId = Math.max(...this.patients.map(p => p.id)) + 1;
    const newPatient = { ...patient, id: newId };
    this.patients.push(newPatient);
    return of(newPatient);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      this.patients[index] = { ...patient };
      return of(this.patients[index]);
    }
    throw new Error('Paciente não encontrado');
  }

  deletePatient(id: number): Observable<boolean> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
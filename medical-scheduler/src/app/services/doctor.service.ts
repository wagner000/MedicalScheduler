import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Carlos Silva',
      specialty: 'Cardiologia',
      crm: '12345-SP',
      email: 'carlos.silva@example.com',
      phone: '(11) 98765-4321',
      availableDays: ['Segunda', 'Quarta', 'Sexta'],
      availableHours: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
      id: 2,
      name: 'Dra. Ana Santos',
      specialty: 'Dermatologia',
      crm: '23456-SP',
      email: 'ana.santos@example.com',
      phone: '(11) 98765-1234',
      availableDays: ['Segunda', 'Terça', 'Quinta'],
      availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
      id: 3,
      name: 'Dr. Roberto Oliveira',
      specialty: 'Ortopedia',
      crm: '34567-SP',
      email: 'roberto.oliveira@example.com',
      phone: '(11) 91234-5678',
      availableDays: ['Terça', 'Quinta', 'Sexta'],
      availableHours: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00']
    }
  ];

  constructor() { }

  getDoctors(): Observable<Doctor[]> {
    return of(this.doctors);
  }

  getDoctorById(id: number): Observable<Doctor | undefined> {
    const doctor = this.doctors.find(doc => doc.id === id);
    return of(doctor);
  }

  addDoctor(doctor: Doctor): Observable<Doctor> {
    // Generate a new ID based on the current highest ID
    const newId = Math.max(...this.doctors.map(d => d.id)) + 1;
    const newDoctor = { ...doctor, id: newId };
    this.doctors.push(newDoctor);
    return of(newDoctor);
  }

  updateDoctor(doctor: Doctor): Observable<Doctor> {
    const index = this.doctors.findIndex(d => d.id === doctor.id);
    if (index !== -1) {
      this.doctors[index] = { ...doctor };
      return of(this.doctors[index]);
    }
    throw new Error('Médico não encontrado');
  }

  deleteDoctor(id: number): Observable<boolean> {
    const index = this.doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      this.doctors.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [
    {
      id: 1,
      doctorId: 1,
      patientId: 2,
      date: '2025-04-22',
      time: '09:00',
      status: AppointmentStatus.CONFIRMED,
      notes: 'Consulta de rotina'
    },
    {
      id: 2,
      doctorId: 2,
      patientId: 1,
      date: '2025-04-23',
      time: '14:00',
      status: AppointmentStatus.SCHEDULED,
      notes: 'Primeira consulta'
    },
    {
      id: 3,
      doctorId: 3,
      patientId: 3,
      date: '2025-04-24',
      time: '10:00',
      status: AppointmentStatus.SCHEDULED,
      notes: 'Retorno pós-cirurgia'
    }
  ];

  constructor() { }

  getAppointments(): Observable<Appointment[]> {
    return of(this.appointments);
  }

  getAppointmentById(id: number): Observable<Appointment | undefined> {
    const appointment = this.appointments.find(a => a.id === id);
    return of(appointment);
  }

  getAppointmentsByDoctorId(doctorId: number): Observable<Appointment[]> {
    const doctorAppointments = this.appointments.filter(a => a.doctorId === doctorId);
    return of(doctorAppointments);
  }

  getAppointmentsByPatientId(patientId: number): Observable<Appointment[]> {
    const patientAppointments = this.appointments.filter(a => a.patientId === patientId);
    return of(patientAppointments);
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    const dateAppointments = this.appointments.filter(a => a.date === date);
    return of(dateAppointments);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    // Check for conflicts
    const conflictingAppointment = this.appointments.find(
      a => a.doctorId === appointment.doctorId && 
           a.date === appointment.date && 
           a.time === appointment.time &&
           a.status !== AppointmentStatus.CANCELLED
    );
    
    if (conflictingAppointment) {
      throw new Error('Já existe uma consulta marcada para este médico neste horário');
    }
    
    // Generate a new ID based on the current highest ID
    const newId = Math.max(...this.appointments.map(a => a.id)) + 1;
    const newAppointment = { ...appointment, id: newId, status: AppointmentStatus.SCHEDULED };
    this.appointments.push(newAppointment);
    return of(newAppointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index] = { ...appointment };
      return of(this.appointments[index]);
    }
    throw new Error('Consulta não encontrada');
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments[index].status = status;
      return of(this.appointments[index]);
    }
    throw new Error('Consulta não encontrada');
  }

  deleteAppointment(id: number): Observable<boolean> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Método para verificar disponibilidade
  checkAvailability(doctorId: number, date: string, time: string): Observable<boolean> {
    const isAvailable = !this.appointments.some(
      a => a.doctorId === doctorId && 
           a.date === date && 
           a.time === time &&
           a.status !== AppointmentStatus.CANCELLED
    );
    return of(isAvailable);
  }
}
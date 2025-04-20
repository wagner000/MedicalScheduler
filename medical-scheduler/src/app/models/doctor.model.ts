export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  crm: string;
  email: string;
  phone: string;
  availableDays?: string[];
  availableHours?: string[];
}
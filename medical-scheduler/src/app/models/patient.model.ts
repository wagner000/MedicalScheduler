export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  healthInsurance?: string;
  healthInsuranceNumber?: string;
}
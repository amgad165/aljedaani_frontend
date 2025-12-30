const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface CreateAppointmentData {
  doctor_id: number;
  branch_id: number;
  department_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm:ss
  reason?: string;
  notes?: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  medical_record_number: string | null;
  national_id: string | null;
  doctor_id: number;
  doctor_code: string | null;
  branch_id: number;
  department_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  booking_source: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: number;
    name: string;
    doctor_code: string | null;
  };
  branch?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: {
    appointment: Appointment;
  };
}

export interface InitialBookingData {
  branches: Array<{
    id: number;
    name: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
  doctors: Array<{
    id: number;
    name: string;
    department_id: number;
    branch_id: number;
    department_name: string;
    branch_name: string;
  }>;
}

export interface InitialDataResponse {
  success: boolean;
  message: string;
  data: InitialBookingData;
}

/**
 * Get initial data for appointment booking (branches, departments, doctors)
 */
export const getInitialData = async (): Promise<InitialDataResponse> => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/appointments/initial-data`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch initial data');
  }

  return result;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  data: CreateAppointmentData
): Promise<CreateAppointmentResponse> => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create appointment');
  }

  return result;
};

export const appointmentsService = {
  getInitialData,
  createAppointment,
};

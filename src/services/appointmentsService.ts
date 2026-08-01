import apiClient from './apiClient';

export interface CreateAppointmentData {
  doctor_id: number;
  branch_id: number;
  department_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm:ss
  reason?: string;
  notes?: string;
  payment_method?: 'hospital' | 'hyperpay';
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
  payment_method?: 'hospital' | 'hyperpay';
  payment_status?: 'unpaid' | 'pending' | 'paid' | 'failed';
  payment_amount?: number;
  payment_currency?: string;
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
    appointment_price: number;
  }>;
}

export interface InitialDataResponse {
  success: boolean;
  message: string;
  data: InitialBookingData;
}

export interface HyperpayCheckoutResponse {
  success: boolean;
  message: string;
  data: {
    checkout_id: string | null;
    integrity: string | null;
    brands: string;
  };
}

export interface HyperpayStatusResponse {
  success: boolean;
  message: string;
  data: {
    payment_status: string;
    result_code: string | null;
    result_description: string | null;
    payment_brand: string | null;
  };
}

/**
 * Get initial data for appointment booking (branches, departments, doctors)
 */
export const getInitialData = async (): Promise<InitialDataResponse> => {
  return apiClient.get<InitialDataResponse>('/appointments/initial-data');
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  data: CreateAppointmentData
): Promise<CreateAppointmentResponse> => {
  return apiClient.post<CreateAppointmentResponse>('/appointments', data);
};

/**
 * Prepare Hyperpay checkout for an appointment
 */
export const prepareHyperpayCheckout = async (
  appointmentId: number
): Promise<HyperpayCheckoutResponse> => {
  return apiClient.post<HyperpayCheckoutResponse>(`/appointments/${appointmentId}/hyperpay/checkout`);
};

/**
 * Get Hyperpay payment status
 */
export const getHyperpayStatus = async (
  appointmentId: number,
  resourcePath: string
): Promise<HyperpayStatusResponse> => {
  return apiClient.post<HyperpayStatusResponse>(`/appointments/${appointmentId}/hyperpay/status`, {
    resourcePath,
  });
};

/**
 * Appointments service object for use with named import { appointmentsService }
 */
export const appointmentsService = {
  getInitialData,
  createAppointment,
  prepareHyperpayCheckout,
  getHyperpayStatus,
};


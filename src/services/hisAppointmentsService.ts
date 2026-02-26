const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface HisAppointment {
  // ID field
  id: number;

  // Original PascalCase fields from backend
  AppCode: string;
  FileNumber: string | null;
  AppDate: string;
  AppTime: string | null;
  AppOrgTime: string | null;
  waiting: number | null;
  DoctorCode: string | null;
  Depart: string | null;
  Station: string | null;
  AppStatus: string | null;
  CashCredit: string | null;
  attn: string | null;
  shift: string | null;
  relat: string | null;
  TELNO: string | null;
  MOBILENO: string | null;
  EMAIL: string | null;
  Remarks: string | null;
  Remarks2: string | null;
  RefuseMobile: string | null;
  AddedLogin: string | null;
  addedtime: string | null;
  EditLogin: string | null;
  EditTime: string | null;
  MsID: string | null;
  BlockVal: string | null;
  last_synced_at: string | null;
  sync_metadata: Record<string, any> | null;

  // New sync tracking fields
  needs_cancel_sync: boolean;
  needs_resync: boolean;
  original_appointment_date: string | null;
  original_appointment_time: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: number | null;

  // Computed snake_case fields for frontend
  app_code: string;
  file_number: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  original_time: string | null;
  doctor_code: string | null;
  department: string | null;
  station: string | null;
  status: string | null;
  payment_type: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  remarks: string | null;
  remarks2: string | null;
  attention: string | null;
  relation: string | null;
  refuse_mobile: string | null;
  added_by: string | null;
  added_time: string | null;
  edited_by: string | null;
  edit_time: string | null;
  message_id: string | null;
  block_value: string | null;
}

export interface HisAppointmentsSyncStats {
  total_appointments: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  appointments_today: number;
  appointments_upcoming: number;
  last_sync: string | null;
  queue_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

/**
 * Get paginated list of HIS appointments with optional search
 */
export const getHisAppointments = async (
  page: number = 1,
  perPage: number = 15,
  search: string = '',
  searchColumn: string = 'file_number'
): Promise<PaginatedResponse<HisAppointment>> => {
  const token = localStorage.getItem('auth_token');
  
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });
  
  if (search) {
    params.append('search', search);
    params.append('search_column', searchColumn);
  }

  const response = await fetch(`${API_BASE_URL}/admin/his-appointments?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS appointments');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get HIS appointments sync statistics
 */
export const getHisAppointmentsSyncStats = async (): Promise<HisAppointmentsSyncStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/admin/his-appointments-sync-stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS appointments sync stats');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Reset sync flags for a HIS appointment (admin only)
 * This allows testing by resetting cancelled/rescheduled status
 */
export const resetHisAppointmentSync = async (appointmentId: number): Promise<void> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/admin/his-appointments/${appointmentId}/reset-sync`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset appointment sync');
  }

  const result = await response.json();
  return result.data;
};

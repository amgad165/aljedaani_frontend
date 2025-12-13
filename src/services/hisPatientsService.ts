const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Type definitions
export type HisPatient = {
  id: number;
  Code: string;
  FileNumber?: string;
  Name?: string;
  MiddleName?: string;
  FamilyName?: string;
  EngName?: string;
  Gender?: boolean;
  Birthday?: string;
  AgeYear?: number;
  AgeMonth?: number;
  AgeDay?: number;
  IdNumber?: string;
  Telephone?: string;
  E_Mail?: string;
  Maritalstatus?: string;
  Relegion?: string;
  NationCode?: string;
  BloodType?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
};

export type HisSyncStats = {
  total_patients: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  last_sync?: string;
  queue_count: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

// Get HIS patients list (admin only)
export const getHisPatients = async (
  page: number = 1,
  perPage: number = 50,
  search?: string
): Promise<PaginatedResponse<HisPatient>> => {
  const token = localStorage.getItem('auth_token');
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (search) {
    queryParams.append('search', search);
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/his-patients?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch HIS patients');
  }

  const result = await response.json();
  return result.data;
};

// Get HIS sync statistics (admin only)
export const getHisSyncStats = async (): Promise<HisSyncStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/admin/his-sync-stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS sync stats');
  }

  const result = await response.json();
  return result.data;
};

// Get single HIS patient details (admin only)
export const getHisPatient = async (id: number): Promise<HisPatient> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/admin/his-patients/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS patient details');
  }

  const result = await response.json();
  return result.data;
};

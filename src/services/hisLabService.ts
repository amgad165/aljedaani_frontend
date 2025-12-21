const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface HisLabReport {
  id: number;
  SLNO: string;
  LABREFNO: string | null;
  FILENUMBER: string | null;
  R_DATE: string | null;
  R_TIME: string | null;
  INVOICENUMBER: string | null;
  PATIENTCODE: string | null;
  Category: string | null;
  CategoryGroup: string | null;
  Unit: string | null;
  result: string | null;
  resultrtf: string | null;
  NORMALRESULT: string | null;
  DEPTCODE: string | null;
  DOCTORCODE: string | null;
  PANIC: string | null;
  STATUS: string | null;
  LabMan: string | null;
  LabTechnician: string | null;
  COMPCASH: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    FileNumber: string;
    Name: string;
    MiddleName: string | null;
    FamilyName: string | null;
    Telephone: string | null;
  };
}

export interface HisLabStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  unique_patients: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  panic_reports: number;
  recent_syncs: number;
  sync_queue_status: {
    total_processed_today: number;
    total_processed_all_time: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Get paginated list of HIS lab reports with optional search and filters
 */
export const getHisLabReports = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    file_number?: string;
    category?: string;
    department?: string;
    panic_only?: boolean;
    from_date?: string;
    to_date?: string;
  }
): Promise<PaginatedResponse<HisLabReport>> => {
  const token = localStorage.getItem('auth_token');

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.file_number) params.append('file_number', filters.file_number);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.panic_only) params.append('panic_only', '1');
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);

  const response = await fetch(`${API_BASE_URL}/admin/his-lab?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab reports');
  }

  return response.json();
};

/**
 * Get HIS lab sync statistics
 */
export const getHisLabStats = async (): Promise<HisLabStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab stats');
  }

  const result = await response.json();
  return result.data;
};

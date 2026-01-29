const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface HisRadiologyReport {
  id: number;
  SLNO: string;
  FILENUMBER: string | null;
  NAME: string | null;
  R_DATE: string | null;
  R_TIME: string | null;
  STATUS: string | null;
  COMPPATIENT: string | null;
  INPATIENT: string | null;
  PatientUnCode: string | null;
  CASHCREDIT: string | null;
  REFDOCTOR: string | null;
  DOCTORCODE: string | null;
  INVOICENO: string | null;
  CASECODE: string | null;
  RESULT: string | null;
  ResultRTF: string | null;
  ResultHtomlToRTF: string | null;
  XRAYNO: string | null;
  PANIC: string | null;
  PANICUSER: string | null;
  DEPTCODE: string | null;
  DEPTCODEALTER: string | null;
  APROVED: string | null;
  APPROVEDBY: string | null;
  APPROVALNOTE: string | null;
  InspectionCode: string | null;
  EntryDate: string | null;
  last_synced_at: string | null;
  sync_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  patient: any | null;
}

export interface HisRadiologyStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
  panic_reports: number;
  recent_sync: {
    last_hour: number;
    last_24_hours: number;
  };
  queue_stats: {
    total_processed_today: number;
    total_processed_all_time: number;
  };
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
 * Get paginated list of HIS radiology reports with optional search and filters
 */
export const getHisRadiologyReports = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    search_column?: string;
    file_number?: string;
    status?: string;
    department?: string;
    doctor_code?: string;
    panic_only?: boolean;
    from_date?: string;
    to_date?: string;
    inspection_code?: string;
  }
): Promise<PaginatedResponse<HisRadiologyReport>> => {
  const token = localStorage.getItem('auth_token');
  
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/admin/his-radiology?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS radiology reports');
  }

  const result = await response.json();
  return {
    data: result.data,
    pagination: result.pagination,
  };
};

/**
 * Get HIS radiology sync statistics
 */
export const getHisRadiologyStats = async (): Promise<HisRadiologyStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-radiology/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS radiology stats');
  }

  const result = await response.json();
  return result.data;
};

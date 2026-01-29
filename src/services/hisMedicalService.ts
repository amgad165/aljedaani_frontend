const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface HisMedicalReport {
  id: number;
  CODE: string;
  FILENUMBER: string | null;
  PatientID: string | null;
  MRDATE: string | null;
  ATTDATE: string | null;
  ATTTIME: string | null;
  MRTO: string | null;
  MRDESC: string | null;
  MRDESCNCHAR: string | null;
  PATNAME: string | null;
  DRNAME: string | null;
  DRCODE: string | null;
  COMPCASH: string | null;
  ReportType: string | null;
  InspectionCode: string | null;
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

export interface HisMedicalStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  unique_patients: number;
  by_report_type: Record<string, number>;
  by_doctor: Record<string, number>;
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
 * Get paginated list of HIS medical reports with optional search and filters
 */
export const getHisMedicalReports = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    search_column?: string;
    file_number?: string;
    report_type?: string;
    doctor_code?: string;
    inspection_code?: string;
    from_date?: string;
    to_date?: string;
  }
): Promise<PaginatedResponse<HisMedicalReport>> => {
  const token = localStorage.getItem('auth_token');

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.search_column) params.append('search_column', filters.search_column);
  if (filters?.file_number) params.append('file_number', filters.file_number);
  if (filters?.report_type) params.append('report_type', filters.report_type);
  if (filters?.doctor_code) params.append('doctor_code', filters.doctor_code);
  if (filters?.inspection_code) params.append('inspection_code', filters.inspection_code);
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);

  const response = await fetch(`${API_BASE_URL}/admin/his-medical?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS medical reports');
  }

  return response.json();
};

/**
 * Get HIS medical sync statistics
 */
export const getHisMedicalStats = async (): Promise<HisMedicalStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-medical/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS medical stats');
  }

  const result = await response.json();
  return result.data;
};

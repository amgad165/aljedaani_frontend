const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface HisLabResultCommon {
  id: number;
  SlNo: string;
  CaseCode: string | null;
  his_id: string | null;
  FLD1: string | null;
  FLD2: string | null;
  FLD3: string | null;
  FLD4: string | null;
  FLD5: string | null;
  FLD6: string | null;
  FLD7: string | null;
  FLD8: string | null;
  FLD9: string | null;
  FLD10: string | null;
  FLD11: string | null;
  FLD12: string | null;
  FLD13: string | null;
  FLD14: string | null;
  FLD15: string | null;
  FLD16: string | null;
  FLD17: string | null;
  FLD18: string | null;
  FLD19: string | null;
  FLD20: string | null;
  FLD21: string | null;
  FLD22: string | null;
  FLD23: string | null;
  FLD24: string | null;
  FLD25: string | null;
  FLD26: string | null;
  FLD27: string | null;
  FLD28: string | null;
  FLD29: string | null;
  FLD30: string | null;
  last_synced_at: string | null;
  sync_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lab_report?: {
    SLNO: string;
    FILENUMBER: string;
    R_DATE: string;
    Category: string;
  };
}

export interface HisLabResultCommonStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  unique_slnos: number;
  unique_case_codes: number;
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
 * Get paginated list of HIS lab result commons with optional search and filters
 */
export const getHisLabResultCommons = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    search_column?: string;
    slno?: string;
    case_code?: string;
    from_date?: string;
    to_date?: string;
  }
): Promise<PaginatedResponse<HisLabResultCommon>> => {
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

  const response = await fetch(`${API_BASE_URL}/admin/his-lab-result-commons?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab result commons');
  }

  return await response.json();
};

/**
 * Get HIS lab result commons statistics
 */
export const getHisLabResultCommonStats = async (): Promise<HisLabResultCommonStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-result-commons/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab result common statistics');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get single HIS lab result common by ID
 */
export const getHisLabResultCommon = async (id: number): Promise<HisLabResultCommon> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-result-commons/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab result common');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get result common by SlNo
 */
export const getHisLabResultCommonBySlNo = async (slno: string): Promise<HisLabResultCommon> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-result-commons/slno/${slno}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab result common by SlNo');
  }

  const result = await response.json();
  return result.data;
};

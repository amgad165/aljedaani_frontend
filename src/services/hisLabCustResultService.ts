const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface HisLabCustResult {
  id: number;
  SlNo: string;
  CaseCode: string | null;
  SCode: string | null;
  his_id: string | null;
  Description: string | null;
  Unit: string | null;
  NormalValue: string | null;
  Result: string | null;
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

export interface HisLabCustResultStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  unique_slnos: number;
  unique_descriptions: number;
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
 * Get paginated list of HIS lab custom results with optional search and filters
 */
export const getHisLabCustResults = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    search_column?: string;
    slno?: string;
    case_code?: string;
    description?: string;
    from_date?: string;
    to_date?: string;
  }
): Promise<PaginatedResponse<HisLabCustResult>> => {
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

  const response = await fetch(`${API_BASE_URL}/admin/his-lab-cust-results?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab custom results');
  }

  return await response.json();
};

/**
 * Get HIS lab custom results statistics
 */
export const getHisLabCustResultStats = async (): Promise<HisLabCustResultStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-cust-results/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab custom result statistics');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get single HIS lab custom result by ID
 */
export const getHisLabCustResult = async (id: number): Promise<HisLabCustResult> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-cust-results/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab custom result');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get custom results by SlNo
 */
export const getHisLabCustResultsBySlNo = async (slno: string): Promise<HisLabCustResult[]> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-lab-cust-results/slno/${slno}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab custom results by SlNo');
  }

  const result = await response.json();
  return result.data;
};

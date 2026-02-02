const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface HisLabPendingReport {
  id: number;
  labslno: string;
  service: string;
  service_name: string;
  date: string | null;
  time: string | null;
  invoice_no: string;
  sample_no: string | null;
  status: string;
  doctor_code: string | null;
  company_patient: string | null;
  comp_cash: string | null;
}

export interface HisLabPendingReportsResponse {
  success: boolean;
  message: string;
  data: HisLabPendingReport[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Get authenticated user's HIS lab pending reports
export const getUserHisLabPendingReports = async (
  page = 1,
  perPage = 4,
  filters?: {
    search?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
  }
): Promise<HisLabPendingReportsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(
    `${API_BASE_URL}/patient/his-lab-pending?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch HIS lab pending reports');
  }
  
  return await response.json();
};

// View HIS lab pending report PDF
export const viewHisLabPendingReportPdf = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/patient/his-lab-pending/${id}/view`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error('Failed to view lab pending report PDF');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

// Download HIS lab pending report PDF
export const downloadHisLabPendingReportPdf = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/patient/his-lab-pending/${id}/download`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error('Failed to download lab pending report PDF');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lab-pending-report-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Format report date for display
export const formatReportDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Format time for display
export const formatReportTime = (timeString: string | null): string => {
  if (!timeString) return 'N/A';
  
  try {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
};

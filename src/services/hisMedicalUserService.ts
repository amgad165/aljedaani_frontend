const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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
  created_at: string;
  updated_at: string;
}

export interface HisMedicalReportsResponse {
  success: boolean;
  data: HisMedicalReport[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface HisMedicalFilters {
  report_type?: string;
  doctor_code?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

/**
 * Get authenticated user's HIS medical reports
 */
export const getUserHisMedicalReports = async (
  page: number = 1,
  perPage: number = 10,
  filters: HisMedicalFilters = {}
): Promise<HisMedicalReportsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  // Add filters if provided
  if (filters.report_type) params.append('report_type', filters.report_type);
  if (filters.doctor_code) params.append('doctor_code', filters.doctor_code);
  if (filters.from_date) params.append('from_date', filters.from_date);
  if (filters.to_date) params.append('to_date', filters.to_date);
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`${API_BASE_URL}/patient/his-medical-reports?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  return data;
};

/**
 * Download a HIS medical report PDF
 */
export const downloadHisMedicalReportPdf = async (code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/patient/his-medical-reports/${code}/pdf?download=1`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to download PDF');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `medical-report-${code}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * View a HIS medical report PDF in new tab
 */
export const viewHisMedicalReportPdf = async (code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/patient/his-medical-reports/${code}/pdf`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to view PDF');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  window.open(url, '_blank');
};

/**
 * Format report date for display
 */
export const formatReportDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format patient name
 */
export const formatPatientName = (name: string | null): string => {
  if (!name) return 'N/A';
  return name.toUpperCase();
};

/**
 * Format report type for display
 */
export const formatReportType = (type: string | null): string => {
  if (!type) return 'Medical Report';
  
  // Map numeric types to readable labels if needed
  const typeMap: Record<string, string> = {
    '1': 'Sick Leave',
    '2': 'Medical Certificate',
    '3': 'Consultation Report',
    '4': 'Referral Letter',
    '5': 'Medical Report',
  };
  
  return typeMap[type] || type;
};

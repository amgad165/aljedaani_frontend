import apiClient from './apiClient';

export interface HisMedicalReport {
  slno: string;
  service_name: string;
  date: string;
  time: string;
  technician: string | null;
  report_type: string;
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
  perPage: number = 4,
  filters: HisMedicalFilters = {}
): Promise<HisMedicalReportsResponse> => {
  const params: Record<string, string | number | boolean | undefined | null> = {
    page,
    per_page: perPage,
  };

  if (filters.report_type) params.report_type = filters.report_type;
  if (filters.doctor_code) params.doctor_code = filters.doctor_code;
  if (filters.from_date) params.from_date = filters.from_date;
  if (filters.to_date) params.to_date = filters.to_date;
  if (filters.search) params.search = filters.search;

  return apiClient.get<HisMedicalReportsResponse>('/patient/his-medical-reports', params);
};

/**
 * Download a HIS medical report PDF
 */
export const downloadHisMedicalReportPdf = async (code: string): Promise<void> => {
  const blob = await apiClient.getBlob(`/patient/his-medical-reports/${code}/pdf`, { download: '1' });
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
  const blob = await apiClient.getBlob(`/patient/his-medical-reports/${code}/pdf`);
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
  
  const typeMap: Record<string, string> = {
    '1': 'Sick Leave',
    '2': 'Medical Certificate',
    '3': 'Consultation Report',
    '4': 'Referral Letter',
    '5': 'Medical Report',
  };
  
  return typeMap[type] || type;
};

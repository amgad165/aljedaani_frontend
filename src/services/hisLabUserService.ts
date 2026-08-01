import apiClient from './apiClient';

export interface HisLabReport {
  slno: string;
  service_name: string;
  date: string;
  time: string;
  technician: string | null;
  report_type: string;
}

export interface HisPatient {
  id: number;
  FileNumber: string;
  Name: string;
  MiddleName: string | null;
  FamilyName: string | null;
  Gender: boolean | null;
  DateofBirth: string | null;
  Telephone: string | null;
  IdNumber: string | null;
}

export interface HisLabReportsResponse {
  status: string;
  data: HisLabReport[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface HisLabReportDetailResponse {
  status: string;
  data: HisLabReport;
}

// Get authenticated user's HIS lab reports
export const getUserHisLabReports = async (
  page = 1,
  perPage = 4,
  filters?: {
    search?: string;
    from_date?: string;
    to_date?: string;
    category?: string;
    department?: string;
  }
): Promise<HisLabReportsResponse> => {
  const params: Record<string, string | number | boolean | undefined | null> = {
    page,
    per_page: perPage,
  };

  if (filters?.search) params.search = filters.search;
  if (filters?.from_date) params.from_date = filters.from_date;
  if (filters?.to_date) params.to_date = filters.to_date;
  if (filters?.category) params.category = filters.category;
  if (filters?.department) params.department = filters.department;

  return apiClient.get<HisLabReportsResponse>('/patient/his-lab-reports', params);
};

// Get single HIS lab report
export const getHisLabReportDetail = async (
  slno: string
): Promise<HisLabReportDetailResponse> => {
  return apiClient.get<HisLabReportDetailResponse>(`/patient/his-lab-reports/${slno}`);
};

// Download PDF
export const downloadHisLabReportPdf = async (slno: string): Promise<void> => {
  try {
    const blob = await apiClient.getBlob(`/patient/his-lab-reports/${slno}/pdf`, { download: 'true' });

    // Create blob link to download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab-report-${slno}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// View PDF in new tab
export const viewHisLabReportPdf = async (slno: string): Promise<void> => {
  try {
    const blob = await apiClient.getBlob(`/patient/his-lab-reports/${slno}/pdf`);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error;
  }
};

// Helper function to format report date
export const formatReportDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

// Helper function to format patient name
export const formatPatientName = (patient?: HisPatient): string => {
  if (!patient) return 'N/A';
  const parts = [patient.Name, patient.MiddleName, patient.FamilyName]
    .filter(Boolean);
  return parts.join(' ').toUpperCase() || 'N/A';
};

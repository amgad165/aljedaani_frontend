import apiClient from './apiClient';

export interface HisPatient {
  id: number;
  Name?: string;
  MiddleName?: string;
  FamilyName?: string;
  AgeYear?: number | null;
  AgeMonth?: number | null;
  Birthday?: string;
}

export interface HisRadiologyReport {
  slno: string;
  name: string | null;
  service_name: string;
  date: string;
  time: string;
  technician: string | null;
  report_type: string;
}

export interface HisRadiologyReportsResponse {
  success: boolean;
  data: HisRadiologyReport[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface HisRadiologyReportDetailResponse {
  status: string;
  data: HisRadiologyReport;
}

// Get authenticated user's HIS radiology reports
export const getUserHisRadiologyReports = async (
  page = 1,
  perPage = 4,
  filters?: {
    search?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
    department?: string;
  }
): Promise<HisRadiologyReportsResponse> => {
  const params: Record<string, string | number | boolean | undefined | null> = {
    page,
    per_page: perPage,
  };

  if (filters?.search) params.search = filters.search;
  if (filters?.from_date) params.from_date = filters.from_date;
  if (filters?.to_date) params.to_date = filters.to_date;
  if (filters?.status) params.status = filters.status;
  if (filters?.department) params.department = filters.department;

  return apiClient.get<HisRadiologyReportsResponse>('/patient/his-radiology-reports', params);
};

// Get single HIS radiology report
export const getHisRadiologyReportDetail = async (
  slno: string
): Promise<HisRadiologyReportDetailResponse> => {
  return apiClient.get<HisRadiologyReportDetailResponse>(`/patient/his-radiology-reports/${slno}`);
};

// Download PDF
export const downloadHisRadiologyReportPdf = async (slno: string): Promise<void> => {
  try {
    const blob = await apiClient.getBlob(`/patient/his-radiology-reports/${slno}/pdf`, { download: 'true' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radiology-report-${slno}.pdf`);
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
export const viewHisRadiologyReportPdf = async (slno: string): Promise<void> => {
  try {
    const blob = await apiClient.getBlob(`/patient/his-radiology-reports/${slno}/pdf`);
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
  const parts = [patient.Name, patient.MiddleName, patient.FamilyName].filter(Boolean);
  return parts.join(' ') || 'N/A';
};

// Helper function to get gender label
export const getGenderLabel = (gender: boolean | null): string => {
  if (gender === null) return 'N/A';
  return gender ? 'Male' : 'Female';
};

// Helper function to calculate age
export const calculateAge = (patient?: HisPatient): string => {
  if (!patient) return 'N/A';
  
  if (patient.AgeYear !== null) {
    let age = `${patient.AgeYear} years`;
    if (patient.AgeMonth) {
      age += `, ${patient.AgeMonth} months`;
    }
    return age;
  }
  
  if (patient.Birthday) {
    const birthday = new Date(patient.Birthday);
    const today = new Date();
    const ageYears = today.getFullYear() - birthday.getFullYear();
    return `${ageYears} years`;
  }
  
  return 'N/A';
};

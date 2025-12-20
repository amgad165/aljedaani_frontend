const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface HisRadiologyReport {
  id: number;
  SLNO: string;
  FILENUMBER: string;
  R_DATE: string;
  R_TIME: string;
  COMPPATIENT: string | null;
  CASHCREDIT: string | null;
  REFDOCTOR: string | null;
  DOCTORCODE: string | null;
  INVOICENO: string | null;
  CASECODE: string | null;
  RESULT: string | null;
  STATUS: string | null;
  INPATIENT: string | null;
  XRAYNO: string | null;
  PANIC: string | null;
  PANICUSER: string | null;
  DEPTCODE: string | null;
  DEPTCODEALTER: string | null;
  APROVED: string | null;
  APPROVEDBY: string | null;
  APPROVALNOTE: string | null;
  PatientUnCode: string | null;
  ResultRTF: string | null;
  ResultHtomlToRTF: string | null;
  InspectionCode: string | null;
  EntryDate: string | null;
  last_synced_at: string | null;
  sync_metadata: any;
  created_at: string;
  updated_at: string;
  patient?: HisPatient;
}

export interface HisPatient {
  id: number;
  FileNumber: string;
  Name: string;
  MiddleName: string | null;
  FamilyName: string | null;
  Gender: boolean | null;
  Birthday: string | null;
  Telephone: string | null;
  IdNumber: string | null;
  NationCode: string | null;
  AgeYear: number | null;
  AgeMonth: number | null;
}

export interface HisRadiologyReportsResponse {
  status: string;
  data: HisRadiologyReport[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface HisRadiologyReportDetailResponse {
  status: string;
  data: HisRadiologyReport;
}

// Get authenticated user's HIS radiology reports
export const getUserHisRadiologyReports = async (
  page = 1,
  perPage = 15,
  filters?: {
    search?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
    department?: string;
  }
): Promise<HisRadiologyReportsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.department) params.append('department', filters.department);

  const response = await fetch(
    `${API_BASE_URL}/patient/his-radiology-reports?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch HIS radiology reports');
  }
  
  return await response.json();
};

// Get single HIS radiology report
export const getHisRadiologyReportDetail = async (
  slno: string
): Promise<HisRadiologyReportDetailResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/patient/his-radiology-reports/${slno}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch HIS radiology report detail');
  }
  
  return await response.json();
};

// Get PDF URL for HIS radiology report
export const getHisRadiologyReportPdfUrl = (slno: string, download = false): string => {
  const token = localStorage.getItem('auth_token');
  const downloadParam = download ? '?download=true' : '';
  return `${API_BASE_URL}/patient/his-radiology-reports/${slno}/pdf${downloadParam}&token=${token}`;
};

// View PDF in new tab
export const viewHisRadiologyReportPdf = (slno: string): void => {
  const url = getHisRadiologyReportPdfUrl(slno, false);
  window.open(url, '_blank');
};

// Download PDF
export const downloadHisRadiologyReportPdf = async (slno: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/patient/his-radiology-reports/${slno}/pdf?download=true`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    
    const blob = await response.blob();

    // Create blob link to download
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Types
export interface VitalReading {
  value?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  unit: string;
  recorded_at: string;
}

export interface VitalsData {
  blood_pressure: VitalReading;
  heart_rate: VitalReading;
  temperature: VitalReading;
  respiratory_rate: VitalReading;
  blood_glucose: VitalReading;
  weight: VitalReading;
  height?: VitalReading;
  bmi?: VitalReading;
  oxygen_saturation?: VitalReading;
}

export interface LabReport {
  id: number;
  user_id: number;
  report_number: string;
  test_name: string;
  test_description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  status_label: string;
  test_date: string;
  result_date?: string;
  results?: string;
  notes?: string;
  doctor_name?: string;
  technician_name?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    medical_record_number?: string;
  };
}

export interface RadiologyReport {
  id: number;
  user_id: number;
  report_number: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET' | 'Other';
  modality_label: string;
  study_description: string;
  clinical_indication?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  status_label: string;
  study_date: string;
  report_date?: string;
  findings?: string;
  impression?: string;
  recommendations?: string;
  radiologist_name?: string;
  technician_name?: string;
  image_urls?: string[];
  report_file_url?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    medical_record_number?: string;
  };
}

export interface MedicalReport {
  id: number;
  user_id: number;
  appointment_id?: number;
  report_number: string;
  report_type: 'consultation' | 'follow_up' | 'discharge' | 'procedure' | 'emergency' | 'other';
  report_type_label: string;
  title: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  physical_examination?: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications?: string;
  follow_up_instructions?: string;
  notes?: string;
  doctor_name: string;
  department?: string;
  visit_date: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    medical_record_number?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  medical_record_number?: string;
  national_id?: string;
  profile_photo?: string;
  address?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface LabReportStatistics {
  total: number;
  by_status: Record<string, number>;
  recent_count: number;
}

interface RadiologyReportStatistics {
  total: number;
  by_status: Record<string, number>;
  by_modality: Record<string, number>;
  recent_count: number;
}

interface MedicalReportStatistics {
  total: number;
  by_type: Record<string, number>;
  recent_count: number;
}

// Lab Reports Service
export const labReportsService = {
  // Get all lab reports (admin view with filters)
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    user_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<LabReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/admin/lab-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Create lab report
  create: async (data: FormData): Promise<{ success: boolean; data: LabReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/lab-reports`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to create lab report: ${response.status}`);
    }
    
    return result;
  },

  // Update lab report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: LabReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/lab-reports/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    return response.json();
  },

  // Delete lab report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/lab-reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get patient's own lab reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<LabReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/patient/lab-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get single lab report
  getById: async (id: number): Promise<{ success: boolean; data: LabReport }> => {
    const response = await fetch(`${API_BASE_URL}/patient/lab-reports/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get lab reports statistics
  getStatistics: async (): Promise<LabReportStatistics> => {
    const response = await fetch(`${API_BASE_URL}/patient/lab-reports-stats`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.data;
  },
};

// Radiology Reports Service
export const radiologyReportsService = {
  // Get all radiology reports (admin view with filters)
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    user_id?: number;
    status?: string;
    modality?: string;
  }): Promise<PaginatedResponse<RadiologyReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.modality) queryParams.append('modality', params.modality);

    const response = await fetch(`${API_BASE_URL}/admin/radiology-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Create radiology report
  create: async (data: FormData): Promise<{ success: boolean; data: RadiologyReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/radiology-reports`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to create radiology report: ${response.status}`);
    }
    
    return result;
  },

  // Update radiology report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: RadiologyReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/radiology-reports/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    return response.json();
  },

  // Delete radiology report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/radiology-reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get patient's own radiology reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    modality?: string;
  }): Promise<PaginatedResponse<RadiologyReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.modality) queryParams.append('modality', params.modality);

    const response = await fetch(`${API_BASE_URL}/patient/radiology-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get single radiology report
  getById: async (id: number): Promise<{ success: boolean; data: RadiologyReport }> => {
    const response = await fetch(`${API_BASE_URL}/patient/radiology-reports/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get radiology reports statistics
  getStatistics: async (): Promise<RadiologyReportStatistics> => {
    const response = await fetch(`${API_BASE_URL}/patient/radiology-reports-stats`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.data;
  },
};

// Medical Reports Service
export const medicalReportsService = {
  // Get all medical reports (admin view with filters)
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    user_id?: number;
    report_type?: string;
  }): Promise<PaginatedResponse<MedicalReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.report_type) queryParams.append('report_type', params.report_type);

    const response = await fetch(`${API_BASE_URL}/admin/medical-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Create medical report
  create: async (data: FormData): Promise<{ success: boolean; data: MedicalReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/medical-reports`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to create medical report: ${response.status}`);
    }
    
    return result;
  },

  // Update medical report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: MedicalReport }> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/medical-reports/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    return response.json();
  },

  // Delete medical report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/medical-reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get patient's own medical reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    report_type?: string;
  }): Promise<PaginatedResponse<MedicalReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.report_type) queryParams.append('report_type', params.report_type);

    const response = await fetch(`${API_BASE_URL}/patient/medical-reports?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get single medical report
  getById: async (id: number): Promise<{ success: boolean; data: MedicalReport }> => {
    const response = await fetch(`${API_BASE_URL}/patient/medical-reports/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get medical reports statistics
  getStatistics: async (): Promise<MedicalReportStatistics> => {
    const response = await fetch(`${API_BASE_URL}/patient/medical-reports-stats`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.data;
  },
};

// Patient Service (vitals and patient data)
export const patientService = {
  // Get latest vital signs from most recent consultation
  getLatestVitals: async (): Promise<{
    success: boolean;
    message: string;
    data: {
      vitals: VitalsData;
      consultation: {
        inspection_code: string;
        consultation_date: string;
        doctor_code: string;
        dept_code: string;
      };
    };
  }> => {
    const response = await fetch(`${API_BASE_URL}/patient/vitals/latest`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get latest consultation with chief complaint
  getLatestConsultation: async (): Promise<{
    success: boolean;
    message: string;
    data: {
      inspection_code: string;
      consultation_date: string;
      doctor_code: string;
      dept_code: string;
      chief_complaint: string;
    };
  }> => {
    const response = await fetch(`${API_BASE_URL}/patient/consultation/latest`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get consultation history
  getConsultationHistory: async (): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      inspection_code: string;
      consultation_date: string;
      chief_complaint: string;
      diagnosis: string;
      doctor_code: string | number;
      temperature: number | string;
      bp_max: number | string;
      bp_min: number | string;
      pulse: number | string;
      revisit: number;
      revisit_after: number | null;
      revisit_after_unit: string | null;
    }>;
  }> => {
    const response = await fetch(`${API_BASE_URL}/patient/consultation/history`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Users Service (for admin patient management)
export const usersService = {
  // Get all patients
  getPatients: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
    gender?: string;
  }): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.gender) queryParams.append('gender', params.gender);

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get single user by ID
  getById: async (id: number): Promise<{ success: boolean; data: User }> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

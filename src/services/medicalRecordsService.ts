import apiClient from './apiClient';

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
    return apiClient.get<PaginatedResponse<LabReport>>('/admin/lab-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Create lab report
  create: async (data: FormData): Promise<{ success: boolean; data: LabReport }> => {
    return apiClient.post<{ success: boolean; data: LabReport }>('/admin/lab-reports', data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Update lab report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: LabReport }> => {
    return apiClient.post<{ success: boolean; data: LabReport }>(`/admin/lab-reports/${id}`, data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Delete lab report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/lab-reports/${id}`);
  },

  // Get patient's own lab reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<LabReport>> => {
    return apiClient.get<PaginatedResponse<LabReport>>('/patient/lab-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Get single lab report
  getById: async (id: number): Promise<{ success: boolean; data: LabReport }> => {
    return apiClient.get<{ success: boolean; data: LabReport }>(`/patient/lab-reports/${id}`);
  },

  // Get lab reports statistics
  getStatistics: async (): Promise<LabReportStatistics> => {
    const result = await apiClient.get<{ data: LabReportStatistics }>('/patient/lab-reports-stats');
    return result.data;
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
    return apiClient.get<PaginatedResponse<RadiologyReport>>('/admin/radiology-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Create radiology report
  create: async (data: FormData): Promise<{ success: boolean; data: RadiologyReport }> => {
    return apiClient.post<{ success: boolean; data: RadiologyReport }>('/admin/radiology-reports', data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Update radiology report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: RadiologyReport }> => {
    return apiClient.post<{ success: boolean; data: RadiologyReport }>(`/admin/radiology-reports/${id}`, data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Delete radiology report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/radiology-reports/${id}`);
  },

  // Get patient's own radiology reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    modality?: string;
  }): Promise<PaginatedResponse<RadiologyReport>> => {
    return apiClient.get<PaginatedResponse<RadiologyReport>>('/patient/radiology-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Get single radiology report
  getById: async (id: number): Promise<{ success: boolean; data: RadiologyReport }> => {
    return apiClient.get<{ success: boolean; data: RadiologyReport }>(`/patient/radiology-reports/${id}`);
  },

  // Get radiology reports statistics
  getStatistics: async (): Promise<RadiologyReportStatistics> => {
    const result = await apiClient.get<{ data: RadiologyReportStatistics }>('/patient/radiology-reports-stats');
    return result.data;
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
    return apiClient.get<PaginatedResponse<MedicalReport>>('/admin/medical-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Create medical report
  create: async (data: FormData): Promise<{ success: boolean; data: MedicalReport }> => {
    return apiClient.post<{ success: boolean; data: MedicalReport }>('/admin/medical-reports', data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Update medical report
  update: async (id: number, data: FormData): Promise<{ success: boolean; data: MedicalReport }> => {
    return apiClient.post<{ success: boolean; data: MedicalReport }>(`/admin/medical-reports/${id}`, data, {
      'Content-Type': 'multipart/form-data',
    });
  },

  // Delete medical report
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/medical-reports/${id}`);
  },

  // Get patient's own medical reports
  getMyReports: async (params?: {
    page?: number;
    per_page?: number;
    report_type?: string;
  }): Promise<PaginatedResponse<MedicalReport>> => {
    return apiClient.get<PaginatedResponse<MedicalReport>>('/patient/medical-reports', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Get single medical report
  getById: async (id: number): Promise<{ success: boolean; data: MedicalReport }> => {
    return apiClient.get<{ success: boolean; data: MedicalReport }>(`/patient/medical-reports/${id}`);
  },

  // Get medical reports statistics
  getStatistics: async (): Promise<MedicalReportStatistics> => {
    const result = await apiClient.get<{ data: MedicalReportStatistics }>('/patient/medical-reports-stats');
    return result.data;
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
    return apiClient.get('/patient/vitals/latest');
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
    return apiClient.get('/patient/consultation/latest');
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
      prov_diagonosis: string;
      advice_treat: string;
      advice_med: string;
      doctor_name: string | null;
      temperature: number | string;
      bp_max: number | string;
      bp_min: number | string;
      pulse: number | string;
      revisit: number;
      revisit_after: number | null;
      revisit_after_unit: string | null;
    }>;
  }> => {
    return apiClient.get('/patient/consultation/history');
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
    return apiClient.get<PaginatedResponse<User>>('/admin/users', params as Record<string, string | number | boolean | undefined | null>);
  },

  // Get single user by ID
  getById: async (id: number): Promise<{ success: boolean; data: User }> => {
    return apiClient.get<{ success: boolean; data: User }>(`/admin/users/${id}`);
  },
};

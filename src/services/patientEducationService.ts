import apiClient from './apiClient';

export interface PatientEducation {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;

  // English/primary PDF (existing)
  pdf_path: string;
  /**
   * Public S3 URL returned by backend (preferred for direct view/download)
   */
  pdf_url?: string | null;

  // New fields
  photo_path?: string | null;
  photo_url?: string | null;
  arabic_pdf_path?: string | null;
  arabic_pdf_url?: string | null;

  sort_order: number;
  is_active: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}


interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class PatientEducationService {
  // Public endpoints
  getDownloadPdfUrl(id: number) {
    return `/patient-educations/${id}/pdf`;
  }

  getDownloadArabicPdfUrl(id: number) {
    return `/patient-educations/${id}/arabic-pdf`;
  }

  async getEducations(filters?: { active?: boolean }) {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (filters?.active !== undefined) params.active = String(filters.active);

    const data = await apiClient.get<ApiResponse<PatientEducation[]>>('/patient-educations', params);
    return data.success ? data.data : [];
  }

  // Admin endpoints
  async getAdminEducations(filters?: { active?: boolean }) {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (filters?.active !== undefined) params.active = String(filters.active);

    const data = await apiClient.get<ApiResponse<PatientEducation[]>>('/patient-educations', params);
    if (!data.success) throw new Error(data.message || 'Failed to load patient educations');
    return data.data as PatientEducation[];
  }

  async createEducation(payload: {
    name: string;
    name_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    photo: File;
    pdf: File;
    arabic_pdf: File;
    sort_order?: number;
    is_active?: boolean;
    published_at?: string | null;
  }) {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.name_ar !== undefined) formData.append('name_ar', payload.name_ar ?? '');
    if (payload.description !== undefined) formData.append('description', payload.description ?? '');
    if (payload.description_ar !== undefined) formData.append('description_ar', payload.description_ar ?? '');
    formData.append('photo', payload.photo);
    formData.append('pdf', payload.pdf);
    formData.append('arabic_pdf', payload.arabic_pdf);

    if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active !== undefined) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.published_at !== undefined && payload.published_at !== null) {
      formData.append('published_at', payload.published_at);
    }

    const data = await apiClient.upload<ApiResponse<PatientEducation>>('/patient-educations', formData, 'POST');
    if (!data.success) throw new Error(data.message || 'Failed to create patient education');
    return data.data as PatientEducation;
  }


  async updateEducation(
    id: number,
    payload: {
      name?: string;
      name_ar?: string | null;
      description?: string | null;
      description_ar?: string | null;
      photo?: File;
      pdf?: File;
      arabic_pdf?: File;
      sort_order?: number;
      is_active?: boolean;
      published_at?: string | null;
    }
  ) {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.name_ar !== undefined) formData.append('name_ar', payload.name_ar ?? '');
    if (payload.description !== undefined) formData.append('description', payload.description ?? '');
    if (payload.description_ar !== undefined) formData.append('description_ar', payload.description_ar ?? '');
    if (payload.photo) formData.append('photo', payload.photo);
    if (payload.pdf) formData.append('pdf', payload.pdf);
    if (payload.arabic_pdf) formData.append('arabic_pdf', payload.arabic_pdf);

    if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active !== undefined) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.published_at !== undefined && payload.published_at !== null) {
      formData.append('published_at', payload.published_at);
    }
    // If published_at should be cleared, caller can send published_at: null; backend validation allows nullable date only if key exists.
    if (payload.published_at === null) formData.append('published_at', '');

    const data = await apiClient.upload<ApiResponse<PatientEducation>>(`/patient-educations/${id}`, formData, 'POST');
    if (!data.success) throw new Error(data.message || 'Failed to update patient education');
    return data.data as PatientEducation;
  }


  async deleteEducation(id: number) {
    const data = await apiClient.delete<ApiResponse<null>>(`/patient-educations/${id}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete patient education');
    return data;
  }
}

export const patientEducationService = new PatientEducationService();

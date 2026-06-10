const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface PatientEducation {
  id: number;
  name: string;
  description?: string | null;
  pdf_path: string;
  /**
   * Public S3 URL returned by backend (preferred for direct view/download)
   */
  pdf_url?: string | null;
  sort_order: number;
  is_active: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

class PatientEducationService {
  // Public endpoints
  getDownloadPdfUrl(id: number) {
    return `${API_BASE_URL}/patient-educations/${id}/pdf`;
  }

  async getEducations(filters?: { active?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    const res = await fetch(`${API_BASE_URL}/patient-educations?${params}`);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  // Admin endpoints
  async getAdminEducations(filters?: { active?: boolean }) {
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    const res = await fetch(`${API_BASE_URL}/patient-educations?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load patient educations');
    return data.data as PatientEducation[];
  }

  async createEducation(payload: {
    name: string;
    description?: string | null;
    pdf: File;
    sort_order?: number;
    is_active?: boolean;
    published_at?: string | null;
  }) {
    const token = localStorage.getItem('auth_token');

    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.description !== undefined) formData.append('description', payload.description ?? '');
    formData.append('pdf', payload.pdf);
    if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active !== undefined) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.published_at !== undefined && payload.published_at !== null) {
      formData.append('published_at', payload.published_at);
    }

    const res = await fetch(`${API_BASE_URL}/patient-educations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create patient education');
    return data.data as PatientEducation;
  }

  async updateEducation(
    id: number,
    payload: {
      name?: string;
      description?: string | null;
      pdf?: File;
      sort_order?: number;
      is_active?: boolean;
      published_at?: string | null;
    }
  ) {
    const token = localStorage.getItem('auth_token');

    const formData = new FormData();
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.description !== undefined) formData.append('description', payload.description ?? '');
    if (payload.pdf) formData.append('pdf', payload.pdf);
    if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active !== undefined) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.published_at !== undefined && payload.published_at !== null) {
      formData.append('published_at', payload.published_at);
    }
    // If published_at should be cleared, caller can send published_at: null; backend validation allows nullable date only if key exists.
    if (payload.published_at === null) formData.append('published_at', '');

    const res = await fetch(`${API_BASE_URL}/patient-educations/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update patient education');
    return data.data as PatientEducation;
  }

  async deleteEducation(id: number) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-educations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete patient education');
    return data;
  }
}

export const patientEducationService = new PatientEducationService();

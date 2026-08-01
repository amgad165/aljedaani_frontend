import apiClient from './apiClient';

export type QuestionType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';

export interface PatientExperienceQuestion {
  id: number;
  patient_experience_id: number;
  question: Record<string, string>;
  field_name: string;
  question_type: QuestionType;
  options?: string[] | Record<string, string>[];
  placeholder?: Record<string, string>;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientExperience {
  id: number;
  title: Record<string, string>;
  description?: Record<string, string>;
  sort_order: number;
  is_active: boolean;
  published_at?: string;
  questions_count?: number;
  submissions_count?: number;
  questions?: PatientExperienceQuestion[];
  created_at: string;
  updated_at: string;
}

export interface PatientExperienceSubmission {
  id: number;
  patient_experience_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  answers: Record<string, unknown>;
  status: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class PatientExperienceService {
  // Public endpoints
  async getExperiences(filters?: { active?: boolean }) {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (filters?.active !== undefined) params.active = String(filters.active);

    const result = await apiClient.get<ApiResponse<PatientExperience[]>>('/patient-experiences', params);
    return result.success ? result.data : [];
  }

  async getExperience(id: number) {
    const result = await apiClient.get<ApiResponse<PatientExperience>>(`/patient-experiences/${id}`);
    return result.success ? result.data : null;
  }

  async submitExperience(
    id: number,
    payload: {
      full_name: string;
      email?: string;
      phone?: string;
      answers: Record<string, unknown>;
    }
  ) {
    const data = await apiClient.post<ApiResponse<unknown>>(`/patient-experiences/${id}/submit`, payload);
    if (!data.success) throw new Error(data.message || 'Failed to submit experience');
    return data;
  }

  // Admin endpoints
  async createExperience(payload: {
    title: Record<string, string>;
    description?: Record<string, string>;
    sort_order?: number;
    is_active?: boolean;
    published_at?: string;
  }) {
    const data = await apiClient.post<ApiResponse<PatientExperience>>('/patient-experiences', payload);
    if (!data.success) throw new Error(data.message || 'Failed to create experience');
    return data.data;
  }

  async updateExperience(
    id: number,
    payload: Partial<{
      title: Record<string, string>;
      description?: Record<string, string>;
      sort_order?: number;
      is_active?: boolean;
      published_at?: string;
    }>
  ) {
    const data = await apiClient.put<ApiResponse<PatientExperience>>(`/patient-experiences/${id}`, payload);
    if (!data.success) throw new Error(data.message || 'Failed to update experience');
    return data.data;
  }

  async deleteExperience(id: number) {
    const data = await apiClient.delete<ApiResponse<null>>(`/patient-experiences/${id}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete experience');
    return data;
  }

  async getQuestions(experienceId: number) {
    const result = await apiClient.get<ApiResponse<PatientExperienceQuestion[]>>(`/patient-experiences/${experienceId}/questions`);
    return result.success ? result.data : [];
  }

  async createQuestion(
    experienceId: number,
    payload: {
      question: Record<string, string>;
      field_name?: string;
      question_type: QuestionType;
      options?: unknown;
      placeholder?: Record<string, string>;
      is_required?: boolean;
      sort_order?: number;
      is_active?: boolean;
    }
  ) {
    const data = await apiClient.post<ApiResponse<PatientExperienceQuestion>>(`/patient-experiences/${experienceId}/questions`, payload);
    if (!data.success) throw new Error(data.message || 'Failed to create question');
    return data.data;
  }

  async updateQuestion(
    experienceId: number,
    questionId: number,
    payload: Partial<{
      question: Record<string, string>;
      field_name: string;
      question_type: QuestionType;
      options?: unknown;
      placeholder?: Record<string, string>;
      is_required: boolean;
      sort_order: number;
      is_active: boolean;
    }>
  ) {
    const data = await apiClient.put<ApiResponse<PatientExperienceQuestion>>(
      `/patient-experiences/${experienceId}/questions/${questionId}`,
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to update question');
    return data.data;
  }

  async deleteQuestion(experienceId: number, questionId: number) {
    const data = await apiClient.delete<ApiResponse<null>>(`/patient-experiences/${experienceId}/questions/${questionId}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete question');
    return data;
  }

  async getSubmissions(experienceId: number) {
    const result = await apiClient.get<ApiResponse<PatientExperienceSubmission[]>>(`/patient-experiences/${experienceId}/submissions`);
    return result.success ? result.data : [];
  }

  async updateSubmission(
    experienceId: number,
    submissionId: number,
    payload: {
      status?: string;
      admin_notes?: string;
    }
  ) {
    const data = await apiClient.put<ApiResponse<PatientExperienceSubmission>>(
      `/patient-experiences/${experienceId}/submissions/${submissionId}`,
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to update submission');
    return data.data;
  }

  // Helper functions
  getField(obj: Record<string, string> | string | undefined): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj.en || obj.ar || '';
  }
}

export const patientExperienceService = new PatientExperienceService();

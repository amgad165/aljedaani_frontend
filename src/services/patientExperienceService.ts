const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
  answers: Record<string, any>;
  status: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

class PatientExperienceService {
  // Public endpoints
  async getExperiences(filters?: { active?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) {
      params.append('active', String(filters.active));
    }

    const res = await fetch(`${API_BASE_URL}/patient-experiences?${params}`);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async getExperience(id: number) {
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  }

  async submitExperience(
    id: number,
    payload: {
      full_name: string;
      email?: string;
      phone?: string;
      answers: Record<string, any>;
    }
  ) {
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${id}/submit`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
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
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
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
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update experience');
    return data.data;
  }

  async deleteExperience(id: number) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete experience');
    return data;
  }

  async getQuestions(experienceId: number) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${experienceId}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async createQuestion(
    experienceId: number,
    payload: {
      question: Record<string, string>;
      field_name?: string;
      question_type: QuestionType;
      options?: any;
      placeholder?: Record<string, string>;
      is_required?: boolean;
      sort_order?: number;
      is_active?: boolean;
    }
  ) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${experienceId}/questions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
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
      options?: any;
      placeholder?: Record<string, string>;
      is_required: boolean;
      sort_order: number;
      is_active: boolean;
    }>
  ) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(
      `${API_BASE_URL}/patient-experiences/${experienceId}/questions/${questionId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update question');
    return data.data;
  }

  async deleteQuestion(experienceId: number, questionId: number) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(
      `${API_BASE_URL}/patient-experiences/${experienceId}/questions/${questionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete question');
    return data;
  }

  async getSubmissions(experienceId: number) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/patient-experiences/${experienceId}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async updateSubmission(
    experienceId: number,
    submissionId: number,
    payload: {
      status?: string;
      admin_notes?: string;
    }
  ) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(
      `${API_BASE_URL}/patient-experiences/${experienceId}/submissions/${submissionId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
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

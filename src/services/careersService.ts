const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';
export type QuestionType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';

export interface TranslationField {
  en: string;
  ar: string;
}

export interface CareerQuestion {
  id: number;
  career_id: number;
  question: TranslationField | string;
  field_name: string;
  question_type: QuestionType;
  options: string[] | null;
  placeholder: TranslationField | string | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: number;
  title: TranslationField | string;
  department: TranslationField | string | null;
  location: string;
  employment_type: EmploymentType;
  experience_level: string | null;
  description: TranslationField | string | null;
  requirements: string[] | null;
  application_email: string | null;
  application_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  published_at: string | null;
  questions?: CareerQuestion[];
  questions_count?: number;
  applications_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CareerApplication {
  id: number;
  career_id: number;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string | null;
  cv_url: string | null;
  answers: Record<string, string | string[]> | null;
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

class CareersService {
  getField(field: TranslationField | string | null, locale: 'en' | 'ar' = 'en'): string {
    if (!field) return '';
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return parsed[locale] ?? parsed.en ?? '';
      } catch {
        return field;
      }
    }
    return field[locale] ?? field.en ?? '';
  }

  getEmploymentTypeLabel(type: EmploymentType): string {
    const labels: Record<EmploymentType, string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      temporary: 'Temporary',
    };
    return labels[type] ?? 'Full Time';
  }

  async getCareers(params: { active?: string } = {}): Promise<Career[]> {
    const qs = new URLSearchParams();
    if (params.active !== undefined) qs.set('active', params.active);
    const res = await fetch(`${API_BASE_URL}/careers?${qs}`);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async getCareer(id: number | string): Promise<Career | null> {
    const res = await fetch(`${API_BASE_URL}/careers/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  }

  async getQuestions(careerId: number, token: string): Promise<CareerQuestion[]> {
    const res = await fetch(`${API_BASE_URL}/careers/${careerId}/questions`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async submitApplication(careerId: number, formData: FormData): Promise<CareerApplication> {
    const res = await fetch(`${API_BASE_URL}/careers/${careerId}/apply`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to submit application');
    return data.data;
  }

  async getApplications(careerId: number, token: string): Promise<CareerApplication[]> {
    const res = await fetch(`${API_BASE_URL}/careers/${careerId}/applications`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async updateApplication(
    careerId: number,
    applicationId: number,
    payload: { status?: CareerApplication['status']; admin_notes?: string | null },
    token: string,
  ): Promise<CareerApplication> {
    const res = await fetch(`${API_BASE_URL}/careers/${careerId}/applications/${applicationId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update application');
    return data.data;
  }
}

export const careersService = new CareersService();

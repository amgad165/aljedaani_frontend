import apiClient from './apiClient';

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
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
    const result = await apiClient.get<ApiResponse<Career[]>>('/careers', params as Record<string, string | number | boolean | undefined | null>);
    return result.success ? result.data : [];
  }

  async getCareer(id: number | string): Promise<Career | null> {
    const result = await apiClient.get<ApiResponse<Career>>(`/careers/${id}`);
    return result.success ? result.data : null;
  }

  async getQuestions(careerId: number): Promise<CareerQuestion[]> {
    const result = await apiClient.get<ApiResponse<CareerQuestion[]>>(`/careers/${careerId}/questions`);
    return result.success ? result.data : [];
  }

  async submitApplication(careerId: number, formData: FormData): Promise<CareerApplication> {
    const data = await apiClient.upload<ApiResponse<CareerApplication>>(`/careers/${careerId}/apply`, formData, 'POST');
    if (!data.success) throw new Error(data.message || 'Failed to submit application');
    return data.data;
  }

  async getApplications(careerId: number): Promise<CareerApplication[]> {
    const result = await apiClient.get<ApiResponse<CareerApplication[]>>(`/careers/${careerId}/applications`);
    return result.success ? result.data : [];
  }

  async updateApplication(
    careerId: number,
    applicationId: number,
    payload: { status?: CareerApplication['status']; admin_notes?: string | null },
  ): Promise<CareerApplication> {
    const data = await apiClient.put<ApiResponse<CareerApplication>>(`/careers/${careerId}/applications/${applicationId}`, payload);
    if (!data.success) throw new Error(data.message || 'Failed to update application');
    return data.data;
  }
}

export const careersService = new CareersService();

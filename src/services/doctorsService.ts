import apiClient from './apiClient';
import type { Doctor } from './departmentsService';

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class DoctorsService {
  async getDoctors(params?: {
    active?: boolean;
    department_id?: number;
    branch_id?: number;
    status?: 'available_today' | 'busy' | 'available_soon';
    location?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Doctor>> {
    const result = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>('/doctors', params as Record<string, string | number | boolean | undefined | null>);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch doctors');
    }
    
    return result.data;
  }

  async getDoctor(id: number): Promise<Doctor> {
    const result = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch doctor');
    }
    
    return result.data;
  }

  async createDoctor(data: {
    name: string;
    email: string;
    phone?: string;
    image_url?: string;
    department_id: number;
    location: string;
    experience_years: number;
    education: string;
    specialization?: string;
    appointment_price?: number;
    status: 'available_today' | 'busy' | 'available_soon';
    is_active?: boolean;
  }): Promise<Doctor> {
    const result = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create doctor');
    }
    
    return result.data;
  }

  async updateDoctor(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    image_url?: string;
    department_id?: number;
    location?: string;
    experience_years?: number;
    education?: string;
    specialization?: string;
    appointment_price?: number;
    status?: 'available_today' | 'busy' | 'available_soon';
    is_active?: boolean;
  }): Promise<Doctor> {
    const result = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update doctor');
    }
    
    return result.data;
  }

  async deleteDoctor(id: number): Promise<void> {
    const result = await apiClient.delete<ApiResponse<null>>(`/doctors/${id}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete doctor');
    }
  }
}

export const doctorsService = new DoctorsService();
export type { Doctor };

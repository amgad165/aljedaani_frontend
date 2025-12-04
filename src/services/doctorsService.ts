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
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

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
    const url = new URL(`${this.baseUrl}/doctors`);
    
    if (params?.active !== undefined) {
      url.searchParams.append('active', String(params.active));
    }
    
    if (params?.department_id) {
      url.searchParams.append('department_id', String(params.department_id));
    }
    
    if (params?.branch_id) {
      url.searchParams.append('branch_id', String(params.branch_id));
    }
    
    if (params?.status) {
      url.searchParams.append('status', params.status);
    }
    
    if (params?.location) {
      url.searchParams.append('location', params.location);
    }
    
    if (params?.search) {
      url.searchParams.append('search', params.search);
    }
    
    if (params?.per_page) {
      url.searchParams.append('per_page', String(params.per_page));
    }
    
    if (params?.page) {
      url.searchParams.append('page', String(params.page));
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<PaginatedResponse<Doctor>> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch doctors');
    }
    
    return result.data;
  }

  async getDoctor(id: number): Promise<Doctor> {
    const response = await fetch(`${this.baseUrl}/doctors/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Doctor> = await response.json();
    
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
    status: 'available_today' | 'busy' | 'available_soon';
    is_active?: boolean;
  }, token: string): Promise<Doctor> {
    const response = await fetch(`${this.baseUrl}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Doctor> = await response.json();
    
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
    status?: 'available_today' | 'busy' | 'available_soon';
    is_active?: boolean;
  }, token: string): Promise<Doctor> {
    const response = await fetch(`${this.baseUrl}/doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Doctor> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update doctor');
    }
    
    return result.data;
  }

  async deleteDoctor(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/doctors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete doctor');
    }
  }
}

export const doctorsService = new DoctorsService();
export type { Doctor };
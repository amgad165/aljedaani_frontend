export interface Gallery {
  id: number;
  branch_id: number;
  title?: string;
  description?: string;
  image_url: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: number;
  name: string;
  region?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  mobile_image?: string;
  is_active: boolean;
  doctors_count?: number;
  galleries?: Gallery[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class BranchesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  async getBranches(params?: {
    active?: boolean;
    with_doctors_count?: boolean;
    with_doctors?: boolean;
    with_galleries?: boolean;
  }): Promise<Branch[]> {
    const url = new URL(`${this.baseUrl}/branches`);
    
    if (params?.active !== undefined) {
      url.searchParams.append('active', String(params.active));
    }
    
    if (params?.with_doctors_count) {
      url.searchParams.append('with_doctors_count', 'true');
    }
    
    if (params?.with_doctors) {
      url.searchParams.append('with_doctors', 'true');
    }
    
    if (params?.with_galleries) {
      url.searchParams.append('with_galleries', 'true');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Branch[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch branches');
    }
    
    return result.data;
  }

  async getBranch(id: number, params?: {
    with_doctors?: boolean;
    with_galleries?: boolean;
  }): Promise<Branch> {
    const url = new URL(`${this.baseUrl}/branches/${id}`);
    
    if (params?.with_doctors) {
      url.searchParams.append('with_doctors', 'true');
    }
    
    if (params?.with_galleries) {
      url.searchParams.append('with_galleries', 'true');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Branch> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch branch');
    }
    
    return result.data;
  }
}

export const branchesService = new BranchesService();

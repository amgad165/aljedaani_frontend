import apiClient from './apiClient';
import type { Doctor } from './doctorsService';
import type { Department } from './departmentsService';

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
  map_url?: string;
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
  async getBranches(params?: {
    active?: boolean;
    with_doctors_count?: boolean;
    with_doctors?: boolean;
    with_galleries?: boolean;
  }): Promise<Branch[]> {
    const result = await apiClient.get<ApiResponse<Branch[]>>('/branches', params as Record<string, string | number | boolean | undefined | null>);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch branches');
    }
    
    return result.data;
  }

  async getBranch(id: number, params?: {
    with_doctors?: boolean;
    with_galleries?: boolean;
  }): Promise<Branch> {
    const result = await apiClient.get<ApiResponse<Branch>>(`/branches/${id}`, params as Record<string, string | number | boolean | undefined | null>);

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch branch');
    }

    return result.data;
  }

  async getBranchDetails(id: number): Promise<{
    branch: Branch;
    doctors: Doctor[];
    departments: Department[];
  }> {
    const result = await apiClient.get<ApiResponse<{
      branch: Branch;
      doctors: Doctor[];
      departments: Department[];
    }>>(`/branches/${id}/details`);

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch branch details');
    }

    return result.data;
  }
}

export const branchesService = new BranchesService();

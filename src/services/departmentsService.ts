import apiClient from './apiClient';
import type { Testimonial } from './testimonialsService';

export interface Department {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  doctors_count?: number;
  doctors?: Doctor[];
  tab_contents?: DepartmentTabContent[];
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: number;
  name: string;
  location?: string;
  address?: string;
}

export interface ServiceItem {
  title?: string;
  description?: string;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
}

// Sub-section structure for Overview tab
export interface SubSection {
  image?: string;
  mobile_image?: string;
  title?: string;
  description?: string;
  position?: 'left' | 'right';
}

// Service list structure for OPD/Inpatient/Investigations tabs
export interface ServiceListItem {
  title?: string;
  items?: string[];
}

// Sidebar item structure - each item has its own content
export interface SidebarItem {
  id: string;
  title: string;
  image?: string;
  mobile_image?: string;
  description?: string;
  service_list?: ServiceListItem[];
  sort_order?: number;
}

// Department Tab Content interface
export interface DepartmentTabContent {
  id: number;
  department_id: number;
  tab_type: 'overview' | 'opd_services' | 'inpatient_services' | 'investigations';
  main_image?: string;
  mobile_image?: string;
  main_description?: string;
  quote_text?: string;
  sub_sections?: SubSection[];
  service_list?: ServiceListItem[];
  sidebar_items?: SidebarItem[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image_url?: string;
  department_id: number;
  branch_id?: number;
  location: string;
  experience_years: number;
  education: string;
  specialization?: string;
  bio?: string;
  appointment_price?: number;
  status: 'available_today' | 'busy' | 'available_soon';
  is_active: boolean;
  department?: Department;
  branch?: Branch;
  outpatient_services?: ServiceItem[];
  inpatient_services?: ServiceItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data: Department[];
  branches?: { id: number; name: string }[];
  message: string;
}

class DepartmentsService {
  async getDepartments(params?: {
    active?: boolean;
    with_doctors_count?: boolean;
    with_doctors?: boolean;
    branch_id?: number;
    with_branches?: boolean;
  }): Promise<{ departments: Department[]; branches?: { id: number; name: string }[] }> {
    const result = await apiClient.get<DepartmentsResponse>('/departments', params as Record<string, string | number | boolean | undefined | null>);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch departments');
    }
    
    return {
      departments: result.data,
      branches: result.branches
    };
  }

  async getDepartment(id: number, params?: {
    with_doctors?: boolean;
  }): Promise<Department> {
    const result = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`, params as Record<string, string | number | boolean | undefined | null>);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch department');
    }
    
    return result.data;
  }

  async createDepartment(data: {
    name: string;
    icon?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<Department> {
    const result = await apiClient.post<ApiResponse<Department>>('/departments', data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create department');
    }
    
    return result.data;
  }

  async updateDepartment(id: number, data: {
    name?: string;
    icon?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<Department> {
    const result = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update department');
    }
    
    return result.data;
  }

  async deleteDepartment(id: number): Promise<void> {
    const result = await apiClient.delete<ApiResponse<null>>(`/departments/${id}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete department');
    }
  }

  // Get department with all tab contents
  async getDepartmentWithTabs(id: number): Promise<Department> {
    const result = await apiClient.get<ApiResponse<Department>>(`/departments/${id}/details`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch department with tabs');
    }
    
    return result.data;
  }

  // Get all tab contents for a department
  async getDepartmentTabs(departmentId: number, params?: {
    active?: boolean;
    tab_type?: string;
  }): Promise<DepartmentTabContent[]> {
    const result = await apiClient.get<ApiResponse<DepartmentTabContent[]>>(`/departments/${departmentId}/tabs`, params as Record<string, string | number | boolean | undefined | null>);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch department tabs');
    }
    
    return result.data;
  }

  // Get specific tab content
  async getDepartmentTabContent(departmentId: number, tabType: string): Promise<DepartmentTabContent> {
    const result = await apiClient.get<ApiResponse<DepartmentTabContent>>(`/departments/${departmentId}/tabs/${tabType}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch tab content');
    }
    
    return result.data;
  }

  // Create or update tab content
  async saveTabContent(departmentId: number, data: {
    tab_type: string;
    main_image?: string;
    main_description?: string;
    quote_text?: string;
    sub_sections?: SubSection[];
    service_list?: ServiceListItem[];
    sidebar_items?: string[];
    is_active?: boolean;
    sort_order?: number;
  }): Promise<DepartmentTabContent> {
    const result = await apiClient.post<ApiResponse<DepartmentTabContent>>(`/departments/${departmentId}/tabs`, data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to save tab content');
    }
    
    return result.data;
  }

  // Update specific tab content
  async updateTabContent(departmentId: number, tabContentId: number, data: {
    main_image?: string;
    main_description?: string;
    quote_text?: string;
    sub_sections?: SubSection[];
    service_list?: ServiceListItem[];
    sidebar_items?: string[];
    is_active?: boolean;
    sort_order?: number;
  }): Promise<DepartmentTabContent> {
    const result = await apiClient.put<ApiResponse<DepartmentTabContent>>(`/departments/${departmentId}/tabs/${tabContentId}`, data);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update tab content');
    }
    
    return result.data;
  }

  // Delete tab content
  async deleteTabContent(departmentId: number, tabContentId: number): Promise<void> {
    const result = await apiClient.delete<ApiResponse<null>>(`/departments/${departmentId}/tabs/${tabContentId}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete tab content');
    }
  }

  // Get available tab types
  async getTabTypes(): Promise<{ types: string[]; labels: Record<string, string> }> {
    const result = await apiClient.get<ApiResponse<{ types: string[]; labels: Record<string, string> }>>('/department-tab-types');
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch tab types');
    }
    
    return result.data;
  }

  // Get testimonials for a specific department
  async getDepartmentTestimonials(departmentId: number): Promise<Testimonial[]> {
    const result = await apiClient.get<{ success: boolean; data: Testimonial[]; message: string }>(
      `/departments/${departmentId}/testimonials`
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch department testimonials');
    }

    return result.data;
  }
}

export const departmentsService = new DepartmentsService();

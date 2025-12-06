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
  title: string;
  description: string;
}

// Sub-section structure for Overview tab
export interface SubSection {
  image?: string;
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
  main_description?: string;
  quote_text?: string;
  sub_sections?: SubSection[];
  service_list?: ServiceListItem[];  // Used for Overview tab
  sidebar_items?: SidebarItem[];     // Changed from string[] to SidebarItem[]
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

class DepartmentsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  async getDepartments(params?: {
    active?: boolean;
    with_doctors_count?: boolean;
    with_doctors?: boolean;
  }): Promise<Department[]> {
    const url = new URL(`${this.baseUrl}/departments`);
    
    if (params?.active !== undefined) {
      url.searchParams.append('active', String(params.active));
    }
    
    if (params?.with_doctors_count) {
      url.searchParams.append('with_doctors_count', 'true');
    }
    
    if (params?.with_doctors) {
      url.searchParams.append('with_doctors', 'true');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Department[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch departments');
    }
    
    return result.data;
  }

  async getDepartment(id: number, params?: {
    with_doctors?: boolean;
  }): Promise<Department> {
    const url = new URL(`${this.baseUrl}/departments/${id}`);
    
    if (params?.with_doctors) {
      url.searchParams.append('with_doctors', 'true');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Department> = await response.json();
    
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
  }, token: string): Promise<Department> {
    const response = await fetch(`${this.baseUrl}/departments`, {
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

    const result: ApiResponse<Department> = await response.json();
    
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
  }, token: string): Promise<Department> {
    const response = await fetch(`${this.baseUrl}/departments/${id}`, {
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

    const result: ApiResponse<Department> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update department');
    }
    
    return result.data;
  }

  async deleteDepartment(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/departments/${id}`, {
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
      throw new Error(result.message || 'Failed to delete department');
    }
  }

  // Get department with all tab contents
  async getDepartmentWithTabs(id: number): Promise<Department> {
    const response = await fetch(`${this.baseUrl}/departments/${id}/details`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Department> = await response.json();
    
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
    const url = new URL(`${this.baseUrl}/departments/${departmentId}/tabs`);
    
    if (params?.active !== undefined) {
      url.searchParams.append('active', String(params.active));
    }
    
    if (params?.tab_type) {
      url.searchParams.append('tab_type', params.tab_type);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<DepartmentTabContent[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch department tabs');
    }
    
    return result.data;
  }

  // Get specific tab content
  async getDepartmentTabContent(departmentId: number, tabType: string): Promise<DepartmentTabContent> {
    const response = await fetch(`${this.baseUrl}/departments/${departmentId}/tabs/${tabType}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<DepartmentTabContent> = await response.json();
    
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
  }, token: string): Promise<DepartmentTabContent> {
    const response = await fetch(`${this.baseUrl}/departments/${departmentId}/tabs`, {
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

    const result: ApiResponse<DepartmentTabContent> = await response.json();
    
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
  }, token: string): Promise<DepartmentTabContent> {
    const response = await fetch(`${this.baseUrl}/departments/${departmentId}/tabs/${tabContentId}`, {
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

    const result: ApiResponse<DepartmentTabContent> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update tab content');
    }
    
    return result.data;
  }

  // Delete tab content
  async deleteTabContent(departmentId: number, tabContentId: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/departments/${departmentId}/tabs/${tabContentId}`, {
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
      throw new Error(result.message || 'Failed to delete tab content');
    }
  }

  // Get available tab types
  async getTabTypes(): Promise<{ types: string[]; labels: Record<string, string> }> {
    const response = await fetch(`${this.baseUrl}/department-tab-types`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<{ types: string[]; labels: Record<string, string> }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch tab types');
    }
    
    return result.data;
  }
}

export const departmentsService = new DepartmentsService();
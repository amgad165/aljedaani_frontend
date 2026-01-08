const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ExcellenceCenter {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  map_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExcellenceCenterFormData {
  name: string;
  description: string;
  image?: File | null;
  map_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const getAuthHeaders = (isFormData: boolean = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const excellenceCentersService = {
  async getAll(activeOnly: boolean = false): Promise<ExcellenceCenter[]> {
    const url = new URL(`${API_BASE_URL}/excellence-centers`);
    if (activeOnly) {
      url.searchParams.append('active', 'true');
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<ExcellenceCenter[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch excellence centers');
    }
    
    return result.data;
  },

  async getById(id: number): Promise<ExcellenceCenter> {
    const response = await fetch(`${API_BASE_URL}/excellence-centers/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<ExcellenceCenter> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch excellence center');
    }
    
    return result.data;
  },

  async create(data: ExcellenceCenterFormData): Promise<ExcellenceCenter> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.map_url) formData.append('map_url', data.map_url);
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');

    const response = await fetch(`${API_BASE_URL}/excellence-centers`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<ExcellenceCenter> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create excellence center');
    }
    
    return result.data;
  },

  async update(id: number, data: Partial<ExcellenceCenterFormData>): Promise<ExcellenceCenter> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.map_url !== undefined) formData.append('map_url', data.map_url || '');
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');

    const response = await fetch(`${API_BASE_URL}/excellence-centers/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<ExcellenceCenter> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update excellence center');
    }
    
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/excellence-centers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete excellence center');
    }
  },
};

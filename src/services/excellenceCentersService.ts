import apiClient from './apiClient';

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

export const excellenceCentersService = {
  async getAll(activeOnly: boolean = false): Promise<ExcellenceCenter[]> {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (activeOnly) params.active = 'true';
    
    const result = await apiClient.get<ApiResponse<ExcellenceCenter[]>>('/excellence-centers', params);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch excellence centers');
    }
    
    return result.data;
  },

  async getById(id: number): Promise<ExcellenceCenter> {
    const result = await apiClient.get<ApiResponse<ExcellenceCenter>>(`/excellence-centers/${id}`);
    
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

    const result = await apiClient.upload<ApiResponse<ExcellenceCenter>>('/excellence-centers', formData, 'POST');
    
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

    const result = await apiClient.upload<ApiResponse<ExcellenceCenter>>(`/excellence-centers/${id}`, formData, 'POST');
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update excellence center');
    }
    
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const result = await apiClient.delete<ApiResponse<null>>(`/excellence-centers/${id}`);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete excellence center');
    }
  },
};

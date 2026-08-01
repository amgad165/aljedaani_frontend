import apiClient from './apiClient';

export interface Offer {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discount: number;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OfferInput {
  title: string;
  description?: string;
  price: number;
  discount: number;
  image?: File;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const offersService = {
  async getAll(activeOnly: boolean = false): Promise<Offer[]> {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (activeOnly) params.active = 'true';
    
    const result = await apiClient.get<ApiResponse<Offer[]>>('/offers', params);
    return result.data || [];
  },

  async getById(id: number): Promise<Offer> {
    const result = await apiClient.get<ApiResponse<Offer>>(`/offers/${id}`);
    return result.data;
  },

  async create(offerData: OfferInput): Promise<Offer> {
    const formData = new FormData();
    formData.append('title', offerData.title);
    if (offerData.description) formData.append('description', offerData.description);
    formData.append('price', offerData.price.toString());
    formData.append('discount', offerData.discount.toString());
    if (offerData.image) formData.append('image', offerData.image);
    if (offerData.sort_order !== undefined) formData.append('sort_order', offerData.sort_order.toString());
    if (offerData.is_active !== undefined) formData.append('is_active', offerData.is_active ? '1' : '0');

    const result = await apiClient.upload<ApiResponse<Offer>>('/offers', formData, 'POST');
    return result.data;
  },

  async update(id: number, offerData: Partial<OfferInput>): Promise<Offer> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    if (offerData.title) formData.append('title', offerData.title);
    if (offerData.description !== undefined) formData.append('description', offerData.description);
    if (offerData.price !== undefined) formData.append('price', offerData.price.toString());
    if (offerData.discount !== undefined) formData.append('discount', offerData.discount.toString());
    if (offerData.image) formData.append('image', offerData.image);
    if (offerData.sort_order !== undefined) formData.append('sort_order', offerData.sort_order.toString());
    if (offerData.is_active !== undefined) formData.append('is_active', offerData.is_active ? '1' : '0');

    const result = await apiClient.upload<ApiResponse<Offer>>(`/offers/${id}`, formData, 'POST');
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/offers/${id}`);
  },
};

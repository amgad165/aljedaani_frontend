import apiClient from './apiClient';

export interface HeroSlider {
  id: number;
  title?: string | Record<string, string> | null;
  subtitle?: string | Record<string, string> | null;
  button_text?: string | Record<string, string> | null;
  button_url?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface HeroSliderInput {
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
  image?: File;
  image_url?: string;
  mobile_image?: File;
  mobile_image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const heroSlidersService = {
  async getAll(activeOnly = false): Promise<HeroSlider[]> {
    const params: Record<string, string | number | boolean | undefined | null> = {};
    if (activeOnly) params.active = 'true';
    
    const result = await apiClient.get<ApiResponse<HeroSlider[]>>('/hero-sliders', params);
    return result.data || [];
  },

  async create(input: HeroSliderInput): Promise<HeroSlider> {
    const formData = new FormData();

    if (input.title) formData.append('title', input.title);
    if (input.subtitle) formData.append('subtitle', input.subtitle);
    if (input.button_text) formData.append('button_text', input.button_text);
    if (input.button_url) formData.append('button_url', input.button_url);
    if (input.image) formData.append('image', input.image);
    if (input.mobile_image) formData.append('mobile_image', input.mobile_image);
    if (input.sort_order !== undefined) formData.append('sort_order', input.sort_order.toString());
    if (input.is_active !== undefined) formData.append('is_active', input.is_active ? '1' : '0');

    const result = await apiClient.upload<ApiResponse<HeroSlider>>('/hero-sliders', formData, 'POST');
    return result.data;
  },

  async update(id: number, input: HeroSliderInput): Promise<HeroSlider> {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    if (input.title !== undefined) formData.append('title', input.title || '');
    if (input.subtitle !== undefined) formData.append('subtitle', input.subtitle || '');
    if (input.button_text !== undefined) formData.append('button_text', input.button_text || '');
    if (input.button_url !== undefined) formData.append('button_url', input.button_url || '');
    if (input.image) formData.append('image', input.image);
    if (input.mobile_image) formData.append('mobile_image', input.mobile_image);
    if (input.sort_order !== undefined) formData.append('sort_order', input.sort_order.toString());
    if (input.is_active !== undefined) formData.append('is_active', input.is_active ? '1' : '0');

    const result = await apiClient.upload<ApiResponse<HeroSlider>>(`/hero-sliders/${id}`, formData, 'POST');
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/hero-sliders/${id}`);
  },
};

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

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

export const heroSlidersService = {
  async getAll(activeOnly = false): Promise<HeroSlider[]> {
    const endpoint = activeOnly ? `${API_URL}/hero-sliders?active=true` : `${API_URL}/hero-sliders`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch hero sliders');
    }

    const result = await response.json();
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

    const response = await fetch(`${API_URL}/hero-sliders`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create hero slider');
    }

    const result = await response.json();
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

    const response = await fetch(`${API_URL}/hero-sliders/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update hero slider');
    }

    const result = await response.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/hero-sliders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete hero slider');
    }
  },
};

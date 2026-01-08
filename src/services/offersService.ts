const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

export const offersService = {
  async getAll(activeOnly: boolean = false): Promise<Offer[]> {
    const url = activeOnly ? `${API_URL}/offers?active=true` : `${API_URL}/offers`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    
    const result = await response.json();
    return result.data || [];
  },

  async getById(id: number): Promise<Offer> {
    const response = await fetch(`${API_URL}/offers/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch offer');
    }
    
    const result = await response.json();
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

    const response = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create offer');
    }

    const result = await response.json();
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

    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update offer');
    }

    const result = await response.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete offer');
    }
  },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  marital_status?: string;
  nationality: string;
  religion?: string;
  medical_record_number?: string;
  national_id?: string;
  address?: string;
  phone: string;
  profile_photo?: File;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'doctor' | 'staff' | 'patient';
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    full_name?: string;
    nationality?: string;
    medical_record_number?: string;
    national_id?: string;
  };
  token: string;
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Use FormData to support file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);
      formData.append('first_name', data.first_name);
      if (data.middle_name) formData.append('middle_name', data.middle_name);
      formData.append('last_name', data.last_name);
      formData.append('gender', data.gender);
      formData.append('date_of_birth', data.date_of_birth);
      if (data.marital_status) formData.append('marital_status', data.marital_status);
      formData.append('nationality', data.nationality);
      if (data.religion) formData.append('religion', data.religion);
      if (data.medical_record_number) formData.append('medical_record_number', data.medical_record_number);
      if (data.national_id) formData.append('national_id', data.national_id);
      if (data.address) formData.append('address', data.address);
      formData.append('phone', data.phone);
      if (data.profile_photo && data.profile_photo instanceof File) {
        formData.append('profile_photo', data.profile_photo, data.profile_photo.name);
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json() as ApiError;
        throw error;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json() as ApiError;
        throw error;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

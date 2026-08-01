import apiClient from './apiClient';
import type { Doctor } from './doctorsService';

export interface Testimonial {
  id: number;
  doctor_id: number;
  doctor?: Doctor;
  name?: string;
  role?: string;
  testimonial_image?: string | null;
  location?: string;
  experience?: string;
  review_title: string;
  description: string;
  full_story?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TestimonialsResponse {
  status: string;
  data: Testimonial[];
  message?: string;
}

interface TestimonialResponse {
  status: string;
  data: Testimonial;
  message?: string;
}

class TestimonialsService {
  /**
   * Fetch all active testimonials
   */
  async getTestimonials(): Promise<Testimonial[]> {
    const result = await apiClient.get<TestimonialsResponse>('/testimonials');

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error('Failed to fetch testimonials');
    }
  }

  /**
   * Fetch a single testimonial by ID
   */
  async getTestimonial(id: number): Promise<Testimonial> {
    const result = await apiClient.get<TestimonialResponse>(`/testimonials/${id}`);

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error('Failed to fetch testimonial');
    }
  }

  /**
   * Create a new testimonial (requires authentication)
   */
  async createTestimonial(testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> {
    const result = await apiClient.post<TestimonialResponse>('/testimonials', testimonialData);

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error('Failed to create testimonial');
    }
  }

  /**
   * Update an existing testimonial (requires authentication)
   */
  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    const result = await apiClient.put<TestimonialResponse>(`/testimonials/${id}`, testimonialData);

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error('Failed to update testimonial');
    }
  }

  /**
   * Delete a testimonial (requires authentication)
   */
  async deleteTestimonial(id: number): Promise<void> {
    const result = await apiClient.delete<{ status: string; message?: string }>(`/testimonials/${id}`);

    if (result.status !== 'success') {
      throw new Error('Failed to delete testimonial');
    }
  }
}

export default TestimonialsService;

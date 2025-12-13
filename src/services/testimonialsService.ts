import type { Doctor } from './doctorsService';

interface Testimonial {
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
}

interface TestimonialResponse {
  status: string;
  data: Testimonial;
  message?: string;
}

class TestimonialsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  /**
   * Fetch all active testimonials
   */
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TestimonialsResponse = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error('Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  /**
   * Fetch a single testimonial by ID
   */
  async getTestimonial(id: number): Promise<Testimonial> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TestimonialResponse = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error('Failed to fetch testimonial');
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  }

  /**
   * Create a new testimonial (requires authentication)
   */
  async createTestimonial(testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>, token: string): Promise<Testimonial> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testimonialData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TestimonialResponse = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error('Failed to create testimonial');
      }
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  /**
   * Update an existing testimonial (requires authentication)
   */
  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>, token: string): Promise<Testimonial> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testimonialData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TestimonialResponse = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error('Failed to update testimonial');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  /**
   * Delete a testimonial (requires authentication)
   */
  async deleteTestimonial(id: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
}

// Export both the service class and the interface
export default TestimonialsService;
export type { Testimonial };
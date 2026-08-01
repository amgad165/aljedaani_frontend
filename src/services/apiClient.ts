type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiClientOptions {
  baseUrl?: string;
}

interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
}

type LogoutCallback = () => void;

class ApiClient {
  private baseUrl: string;
  private logoutCallback: LogoutCallback | null = null;
  private isLoggingOut = false;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  }

  /**
   * Register the logout callback to be called when a 401 is detected.
   */
  onUnauthorized(callback: LogoutCallback): void {
    this.logoutCallback = callback;
  }

  /**
   * Clear the logout callback.
   */
  clearUnauthorizedCallback(): void {
    this.logoutCallback = null;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * ====================================================================
   * Public HTTP method helpers
   * ====================================================================
   */

  async get<T = any>(url: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    let fullUrl = `${this.baseUrl}${url}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    const config: RequestConfig = {
      method: 'GET',
    };

    return this.request<T>(fullUrl, config);
  }

  async post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const config: RequestConfig = {
      method: 'POST',
    };

    return this.resolveBodyAndRequest<T>(url, body, config, headers);
  }

  async put<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const config: RequestConfig = {
      method: 'PUT',
    };

    return this.resolveBodyAndRequest<T>(url, body, config, headers);
  }

  async patch<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const config: RequestConfig = {
      method: 'PATCH',
    };

    return this.resolveBodyAndRequest<T>(url, body, config, headers);
  }

  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
    const config: RequestConfig = {
      method: 'DELETE',
    };

    const fullUrl = `${this.baseUrl}${url}`;
    return this.request<T>(fullUrl, config, headers);
  }

  /**
   * GET a response as a Blob (for PDFs, images, etc.)
   */
  async getBlob(url: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<Blob> {
    let fullUrl = `${this.baseUrl}${url}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json, application/pdf',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Upload a file or FormData
   */
  async upload<T = any>(url: string, formData: FormData, method: HttpMethod = 'POST'): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    
    const config: RequestConfig = {
      method,
      body: formData,
    };

    // Do NOT set Content-Type for FormData – browser sets it with boundary
    return this.request<T>(fullUrl, config);
  }

  /**
   * ====================================================================
   * Private helpers
   * ====================================================================
   */

  private async resolveBodyAndRequest<T>(
    url: string,
    body: any,
    config: RequestConfig,
    headers?: Record<string, string>,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;

    // If body is FormData, pass it directly (no Content-Type header)
    if (body instanceof FormData) {
      return this.request<T>(
        fullUrl,
        { ...config, body },
      { ...headers, Accept: 'application/json' } as Record<string, string>,
      );
    }

    return this.request<T>(
      fullUrl,
      {
        ...config,
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : null,
      },
      headers,
    );
  }

  private async request<T>(
    fullUrl: string,
    config: RequestConfig,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(config.headers as Record<string, string>),
      ...extraHeaders,
    };

    // Attach token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: config.method,
        headers,
        body: config.body,
        signal: config.signal,
      });
    } catch {
      throw new Error('Network error. Please check your connection.');
    }

    // Try parsing JSON; fallback to text if empty
    let result: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        result = await response.json();
      } catch {
        result = {};
      }
    } else {
      const text = await response.text();
      result = text ? { message: text } : {};
    }

    // ---- UNAUTHORIZED INTERCEPTION ----
    if (response.status === 401) {
      const message = result?.message || '';
      // Match both "Unauthenticated" and other 401 messages
      if (
        message.toLowerCase().includes('unauthenticated') ||
        message.toLowerCase().includes('login again') ||
        message.toLowerCase().includes('token has expired') ||
        message.toLowerCase().includes('token is invalid')
      ) {
        this.handleUnauthorized();
      }
      const error = new Error(message || 'Unauthorized');
      (error as any).status = 401;
      (error as any).response = result;
      throw error;
    }

    // Handle other non-ok responses
    if (!response.ok) {
      const errorMessage = result?.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = result;
      throw error;
    }

    return result as T;
  }

  private handleUnauthorized(): void {
    // Prevent multiple simultaneous logout calls
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    // Clear auth data from localStorage immediately
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Call the registered logout callback (e.g., from AuthContext)
    if (this.logoutCallback) {
      this.logoutCallback();
    }

    this.isLoggingOut = false;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default apiClient;

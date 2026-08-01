import apiClient from './apiClient';

export interface NewsTranslation {
  en: string;
  ar: string;
}

export interface NewsItem {
  id: number;
  title: NewsTranslation | string;
  description: NewsTranslation | string | null;
  blockquote: NewsTranslation | string | null;
  body: NewsTranslation | string | null;
  image_url: string | null;
  author: string;
  read_time: string | null;
  published_at: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TranslatableField = NewsTranslation | string | null;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class NewsService {
  getField(field: TranslatableField, locale: 'en' | 'ar' = 'en'): string {
    if (!field) return '';
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return parsed[locale] ?? parsed.en ?? '';
      } catch {
        return field;
      }
    }
    return (field as NewsTranslation)[locale] ?? (field as NewsTranslation).en ?? '';
  }

  async getNews(params: { active?: string } = {}): Promise<NewsItem[]> {
    const result = await apiClient.get<ApiResponse<NewsItem[]>>('/news', params as Record<string, string | number | boolean | undefined | null>);
    return result.success ? result.data : [];
  }

  async getNewsItem(id: number | string): Promise<NewsItem | null> {
    const result = await apiClient.get<ApiResponse<NewsItem>>(`/news/${id}`);
    return result.success ? result.data : null;
  }

  async createNews(formData: FormData): Promise<NewsItem> {
    const data = await apiClient.upload<ApiResponse<NewsItem>>('/news', formData, 'POST');
    if (!data.success) throw new Error(data.message || 'Failed to create news');
    return data.data;
  }

  async updateNews(id: number, formData: FormData): Promise<NewsItem> {
    formData.append('_method', 'PUT');
    const data = await apiClient.upload<ApiResponse<NewsItem>>(`/news/${id}`, formData, 'POST');
    if (!data.success) throw new Error(data.message || 'Failed to update news');
    return data.data;
  }

  async deleteNews(id: number): Promise<void> {
    const data = await apiClient.delete<ApiResponse<null>>(`/news/${id}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete news');
  }
}

export const newsService = new NewsService();



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
    const qs = new URLSearchParams();
    if (params.active !== undefined) qs.set('active', params.active);
    const res = await fetch(`${API_BASE_URL}/news?${qs}`);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async getNewsItem(id: number | string): Promise<NewsItem | null> {
    const res = await fetch(`${API_BASE_URL}/news/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  }

  async createNews(formData: FormData, token: string): Promise<NewsItem> {
    const res = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create news');
    return data.data;
  }

  async updateNews(id: number, formData: FormData, token: string): Promise<NewsItem> {
    formData.append('_method', 'PUT');
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update news');
    return data.data;
  }

  async deleteNews(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete news');
  }
}

export const newsService = new NewsService();



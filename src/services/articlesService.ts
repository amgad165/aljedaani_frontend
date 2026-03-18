const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ArticleTranslation {
  en: string;
  ar: string;
}

export interface Article {
  id: number;
  title: ArticleTranslation | string;
  description: ArticleTranslation | string | null;
  blockquote: ArticleTranslation | string | null;
  body: ArticleTranslation | string | null;
  image_url: string | null;
  author: string;
  read_time: string | null;
  published_at: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TranslatableField = ArticleTranslation | string | null;

class ArticlesService {
  /** Extract the locale-appropriate string from a translatable field */
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
    return (field as ArticleTranslation)[locale] ?? (field as ArticleTranslation).en ?? '';
  }

  async getArticles(params: { active?: string } = {}): Promise<Article[]> {
    const qs = new URLSearchParams();
    if (params.active !== undefined) qs.set('active', params.active);
    const res = await fetch(`${API_BASE_URL}/articles?${qs}`);
    const data = await res.json();
    return data.success ? data.data : [];
  }

  async getArticle(id: number | string): Promise<Article | null> {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  }

  async createArticle(formData: FormData, token: string): Promise<Article> {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create article');
    return data.data;
  }

  async updateArticle(id: number, formData: FormData, token: string): Promise<Article> {
    formData.append('_method', 'PUT');
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update article');
    return data.data;
  }

  async deleteArticle(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete article');
  }
}

export const articlesService = new ArticlesService();

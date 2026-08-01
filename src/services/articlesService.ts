import apiClient from './apiClient';

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
    const result = await apiClient.get<{ success: boolean; data: Article[] }>('/articles', params as Record<string, string | number | boolean | undefined | null>);
    return result.success ? result.data : [];
  }

  async getArticle(id: number | string): Promise<Article | null> {
    const result = await apiClient.get<{ success: boolean; data: Article }>(`/articles/${id}`);
    return result.success ? result.data : null;
  }

  async createArticle(formData: FormData): Promise<Article> {
    const data = await apiClient.post<{ success: boolean; data: Article; message: string }>('/articles', formData, {
      'Content-Type': 'multipart/form-data',
    });
    if (!data.success) throw new Error(data.message || 'Failed to create article');
    return data.data;
  }

  async updateArticle(id: number, formData: FormData): Promise<Article> {
    formData.append('_method', 'PUT');
    const data = await apiClient.post<{ success: boolean; data: Article; message: string }>(`/articles/${id}`, formData, {
      'Content-Type': 'multipart/form-data',
    });
    if (!data.success) throw new Error(data.message || 'Failed to update article');
    return data.data;
  }

  async deleteArticle(id: number): Promise<void> {
    const data = await apiClient.delete<{ success: boolean; message: string }>(`/articles/${id}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete article');
  }
}

export const articlesService = new ArticlesService();

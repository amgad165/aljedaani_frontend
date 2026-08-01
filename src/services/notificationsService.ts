import apiClient from './apiClient';

export interface NotificationItem {
  id: number;
  user_id: number;
  notification_id: number;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  status: string;
  notification: {
    id: number;
    type: string;
    channel: string;
    title: string;
    body: string;
    payload: Record<string, unknown> | null;
    sent_at: string | null;
    created_at: string;
  };
}

export interface NotificationListResponse {
  data: NotificationItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const notificationsService = {
  async list(unreadOnly = false, page = 1, perPage = 20): Promise<NotificationListResponse> {
    const params: Record<string, string | number | boolean | undefined | null> = {
      page,
      per_page: perPage,
    };
    if (unreadOnly) {
      params.unread_only = '1';
    }
    return apiClient.get<NotificationListResponse>('/notifications', params);
  },

  async unreadCount(): Promise<number> {
    const result = await apiClient.get<{ unread_count: number }>('/notifications/unread-count');
    return result.unread_count;
  },

  async markAsRead(recipientId: number): Promise<void> {
    await apiClient.post(`/notifications/${recipientId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};

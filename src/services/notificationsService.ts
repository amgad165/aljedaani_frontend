const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw new Error('Auth token not found');
  }

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const notificationsService = {
  async list(unreadOnly = false, page = 1, perPage = 20): Promise<NotificationListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (unreadOnly) {
      params.set('unread_only', '1');
    }

    const response = await fetch(`${API_URL}/notifications?${params.toString()}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  async unreadCount(): Promise<number> {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread notification count');
    }

    const result = await response.json() as { unread_count: number };
    return result.unread_count;
  },

  async markAsRead(recipientId: number): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/${recipientId}/read`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },
};

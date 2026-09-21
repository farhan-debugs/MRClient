import { mockStore } from './mockStore';

const API_BASE = import.meta.env?.VITE_API_URL || '/api';
let isBackendAvailable = null;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const activeUserId = localStorage.getItem('activeUserId');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(activeUserId ? { 'x-user-id': activeUserId } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      // If 404 or 5xx when not running custom backend, fall through to catch
      throw new Error(`Request failed with status ${response.status}`);
    }

    isBackendAvailable = true;
    return await response.json();
  } catch (error) {
    // Graceful fallback to interactive in-browser demo store (for GitHub Pages / standalone preview)
    if (isBackendAvailable !== true) {
      // console.info('[API] Backend unreachable; using client demo store.');
    }
    throw error;
  }
}

export const api = {
  // Auth & Users
  getUsers: async () => {
    try {
      return await request('/auth/users');
    } catch {
      return mockStore.getUsers();
    }
  },
  getMe: async () => {
    try {
      return await request('/auth/me');
    } catch {
      return mockStore.getMe();
    }
  },
  login: async (credentials) => {
    try {
      return await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    } catch {
      return { user: mockStore.getMe(), token: 'demo_token' };
    }
  },
  register: async (data) => {
    try {
      return await request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return { user: mockStore.getMe(), token: 'demo_token' };
    }
  },

  // Tasks
  getTasks: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const qs = query.toString();
      return await request(`/tasks${qs ? `?${qs}` : ''}`);
    } catch {
      return mockStore.getTasks(params);
    }
  },
  getTask: async (id) => {
    try {
      return await request(`/tasks/${id}`);
    } catch {
      return mockStore.getTask(id);
    }
  },
  createTask: async (data) => {
    try {
      return await request('/tasks', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return mockStore.createTask(data);
    }
  },
  updateTask: async (id, data) => {
    try {
      return await request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    } catch {
      return mockStore.updateTask(id, data);
    }
  },
  deleteTask: async (id) => {
    try {
      return await request(`/tasks/${id}`, { method: 'DELETE' });
    } catch {
      return mockStore.deleteTask(id);
    }
  },

  // Comments
  addComment: async (taskId, content) => {
    try {
      return await request(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    } catch {
      return mockStore.addComment(taskId, content);
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      return await request('/dashboard/stats');
    } catch {
      return mockStore.getDashboardStats();
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      return await request('/notifications');
    } catch {
      return mockStore.getNotifications();
    }
  },
  markNotificationRead: async (id) => {
    try {
      return await request(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      return mockStore.markNotificationRead(id);
    }
  },
  markAllNotificationsRead: async () => {
    try {
      return await request('/notifications/read-all', { method: 'POST' });
    } catch {
      return mockStore.markAllNotificationsRead();
    }
  }
};


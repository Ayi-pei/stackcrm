// API 工具函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // 从localStorage获取token
    this.token = localStorage.getItem('auth-token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API请求失败');
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || '文件上传失败');
      }

      return data;
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 导出常用的API方法
export const api = {
  // 认证相关
  auth: {
    login: (accessKey: string) => apiClient.post('/auth/login', { accessKey }),
    validateKey: (key: string) => apiClient.post('/auth/validate-key', { key }),
    logout: () => apiClient.post('/auth/logout'),
  },

  // 管理员相关
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getStats: (period?: string) => apiClient.get(`/admin/stats${period ? `?period=${period}` : ''}`),
    getConfig: () => apiClient.get('/admin/config'),
    updateConfig: (settings: any[]) => apiClient.put('/admin/config', { settings }),
    getLogs: (params?: any) => apiClient.get(`/admin/logs${params ? `?${new URLSearchParams(params)}` : ''}`),
    cleanup: (type: string, days?: number) => apiClient.post('/admin/cleanup', { type, days }),
  },

  // 密钥管理
  keys: {
    getAll: (params?: any) => apiClient.get(`/keys${params ? `?${new URLSearchParams(params)}` : ''}`),
    generate: (options: any) => apiClient.post('/keys/generate', options),
    update: (id: string, updates: any) => apiClient.put(`/keys/${id}`, updates),
    suspend: (id: string) => apiClient.post(`/keys/${id}/suspend`),
    activate: (id: string) => apiClient.post(`/keys/${id}/activate`),
    delete: (id: string) => apiClient.delete(`/keys/${id}`),
    getLogs: (id: string, params?: any) => apiClient.get(`/keys/${id}/logs${params ? `?${new URLSearchParams(params)}` : ''}`),
  },

  // 坐席管理
  agents: {
    getAll: (params?: any) => apiClient.get(`/agents${params ? `?${new URLSearchParams(params)}` : ''}`),
    create: (agent: any) => apiClient.post('/agents', agent),
    update: (id: string, updates: any) => apiClient.put(`/agents/${id}`, updates),
    delete: (id: string) => apiClient.delete(`/agents/${id}`),
    updateStatus: (id: string, status: string) => apiClient.put(`/agents/${id}/status`, { status }),
  },

  // 聊天相关
  chat: {
    getCustomers: (params?: any) => apiClient.get(`/chat/customers${params ? `?${new URLSearchParams(params)}` : ''}`),
    getSessions: (params?: any) => apiClient.get(`/chat/sessions${params ? `?${new URLSearchParams(params)}` : ''}`),
    getMessages: (sessionId: string, params?: any) => apiClient.get(`/chat/sessions/${sessionId}/messages${params ? `?${new URLSearchParams(params)}` : ''}`),
    sendMessage: (sessionId: string, message: any) => apiClient.post(`/chat/sessions/${sessionId}/messages`, message),
    assignSession: (sessionId: string, agentId: string) => apiClient.post(`/chat/sessions/${sessionId}/assign`, { agentId }),
  },

  // 坐席设置
  agentSettings: {
    get: (agentId: string) => apiClient.get(`/agentSettings/${agentId}`),
    update: (agentId: string, settings: any) => apiClient.put(`/agentSettings/${agentId}`, settings),
    addQuickReply: (agentId: string, quickReply: any) => apiClient.post(`/agentSettings/${agentId}/quick-replies`, quickReply),
    updateQuickReply: (agentId: string, id: string, quickReply: any) => apiClient.put(`/agentSettings/${agentId}/quick-replies/${id}`, quickReply),
    deleteQuickReply: (agentId: string, id: string) => apiClient.delete(`/agentSettings/${agentId}/quick-replies/${id}`),
    addWelcomeMessage: (agentId: string, message: any) => apiClient.post(`/agentSettings/${agentId}/welcome-messages`, message),
    updateWelcomeMessage: (agentId: string, id: string, message: any) => apiClient.put(`/agentSettings/${agentId}/welcome-messages/${id}`, message),
    deleteWelcomeMessage: (agentId: string, id: string) => apiClient.delete(`/agentSettings/${agentId}/welcome-messages/${id}`),
    addToBlacklist: (agentId: string, customerId: string) => apiClient.post(`/agentSettings/${agentId}/blacklist`, { customerId }),
    removeFromBlacklist: (agentId: string, customerId: string) => apiClient.delete(`/agentSettings/${agentId}/blacklist/${customerId}`),
  },

  // 文件上传
  upload: {
    file: (file: File, sessionId?: string) => apiClient.uploadFile('/upload/file', file, sessionId ? { sessionId } : undefined),
    avatar: (file: File) => apiClient.uploadFile('/upload/avatar', file),
    getFileInfo: (id: string) => apiClient.get(`/upload/files/${id}`),
    deleteFile: (id: string) => apiClient.delete(`/upload/files/${id}`),
  },

  // 短链接
  shortlinks: {
    create: (longUrl: string, agentId?: string) => apiClient.post('/shortlinks/shorten', { longUrl, agentId }),
    resolve: (shortId: string) => apiClient.get(`/shortlinks/resolve/${shortId}`),
    getStats: (shortId: string) => apiClient.get(`/shortlinks/stats/${shortId}`),
  },
};

export default apiClient;
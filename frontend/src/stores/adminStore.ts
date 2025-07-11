import { create } from 'zustand';
import { KeyInfo, KeyUsageLog, DailyStats, AdminDashboardData, KeyGenerationOptions } from '../types/admin';
import { api } from '../utils/api';

interface AdminState {
  // Keys management
  keys: KeyInfo[];
  usageLogs: KeyUsageLog[];
  dailyStats: DailyStats[];
  dashboardData: AdminDashboardData | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedKey: KeyInfo | null;
  
  // Actions
  setKeys: (keys: KeyInfo[]) => void;
  addKey: (key: KeyInfo) => void;
  updateKey: (id: string, updates: Partial<KeyInfo>) => void;
  deleteKey: (id: string) => void;
  suspendKey: (id: string) => void;
  activateKey: (id: string) => void;
  
  // Usage logs
  setUsageLogs: (logs: KeyUsageLog[]) => void;
  addUsageLog: (log: KeyUsageLog) => void;
  
  // Dashboard
  setDashboardData: (data: AdminDashboardData) => void;
  refreshDashboard: () => void;
  
  // Key generation
  generateKey: (options: KeyGenerationOptions) => Promise<void>;
  validateKey: (key: string) => Promise<boolean>;
  
  // Utilities
  getKeysByStatus: (status: KeyInfo['status']) => KeyInfo[];
  getExpiringKeys: (days: number) => KeyInfo[];
  getKeyUsage: (keyId: string) => KeyUsageLog[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectKey: (key: KeyInfo | null) => void;
}

// 生成随机naoiod格式密钥
const generateNaoiodKey = (type: 'agent' | 'admin'): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = type === 'admin' ? 12 : 16; // 管理员密钥12位，坐席密钥16位
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// 验证naoiod格式密钥
const validateNaoiodFormat = (key: string): boolean => {
  // naoiod格式：纯小写字母和数字组合，长度12-16位
  const pattern = /^[a-z0-9]{12,16}$/;
  return pattern.test(key);
};

export const useAdminStore = create<AdminState>((set, get) => ({
  keys: [],
  usageLogs: [],
  dailyStats: [],
  dashboardData: null,
  loading: false,
  error: null,
  selectedKey: null,

  setKeys: (keys) => set({ keys }),
  
  addKey: (key) => set((state) => ({
    keys: [...state.keys, key]
  })),
  
  updateKey: (id, updates) => set((state) => ({
    keys: state.keys.map(key => 
      key.id === id ? { ...key, ...updates } : key
    )
  })),
  
  deleteKey: (id) => set((state) => ({
    keys: state.keys.filter(key => key.id !== id)
  })),
  
  suspendKey: (id) => set((state) => ({
    keys: state.keys.map(key => 
      key.id === id ? { ...key, status: 'suspended' as const } : key
    )
  })),
  
  activateKey: (id) => set((state) => ({
    keys: state.keys.map(key => 
      key.id === id ? { ...key, status: 'active' as const } : key
    )
  })),
  
  setUsageLogs: (logs) => set({ usageLogs: logs }),
  
  addUsageLog: (log) => set((state) => ({
    usageLogs: [log, ...state.usageLogs]
  })),
  
  setDashboardData: (data) => set({ dashboardData: data }),
  
  refreshDashboard: async () => {
    set({ loading: true });
    
    try {
      const response = await api.admin.getDashboard();
      
      if (response.success && response.data) {
        set({ 
          dashboardData: response.data,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.message || '获取仪表盘数据失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取仪表盘数据失败';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      throw error;
    }
  },
  
  generateKey: async (options: KeyGenerationOptions): Promise<void> => {
    set({ loading: true });
    
    try {
      const response = await api.keys.generate(options);
      
      if (response.success && response.data) {
        get().addKey(response.data);
        set({ loading: false, error: null });
      } else {
        throw new Error(response.message || '密钥生成失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '密钥生成失败';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
  
  validateKey: async (key: string): Promise<boolean> => {
    try {
      const response = await api.auth.validateKey(key);
      return response.success && response.data?.isValid === true;
    } catch (error) {
      console.error('Key validation error:', error);
      return false;
    }
  },
  
  getKeysByStatus: (status) => {
    const { keys } = get();
    return keys.filter(key => key.status === status);
  },
  
  getExpiringKeys: (days) => {
    const { keys } = get();
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return keys.filter(key => 
      key.status === 'active' && 
      key.expiresAt <= cutoffDate
    );
  },
  
  getKeyUsage: (keyId) => {
    const { usageLogs } = get();
    return usageLogs.filter(log => log.keyId === keyId);
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  selectKey: (key) => set({ selectedKey: key })
}));
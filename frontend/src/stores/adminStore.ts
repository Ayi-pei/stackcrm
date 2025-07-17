import { create } from 'zustand';
import { api } from '../utils/api';

// 密钥信息
interface KeyInfo {
  id: string;
  key: string;
  type: 'agent' | 'admin';
  status: 'active' | 'expired' | 'expiring_soon' | 'suspended';
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  agentId?: string;
  agentName?: string;
  usageCount: number;
  maxUsage?: number;
  isOnline: boolean;
  sessionCount: number;
  totalSessions: number;
  createdBy: string;
  notes?: string;
}

// 密钥使用日志
interface KeyUsageLog {
  id: string;
  keyId: string;
  agentId: string;
  action: 'login' | 'logout' | 'session_start' | 'session_end' | 'heartbeat';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  duration?: number;
}

// 每日统计
interface DailyStats {
  date: string;
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  newKeys: number;
  totalUsage: number;
  onlineAgents: number;
  totalSessions: number;
}

// 管理员仪表盘数据
interface AdminDashboardData {
  todayStats: DailyStats;
  recentLogs: KeyUsageLog[];
  expiringKeys: KeyInfo[];
  topAgents: {
    agentId: string;
    agentName: string;
    sessionCount: number;
    onlineTime: number;
    satisfaction: number;
  }[];
}

// 密钥生成选项
interface KeyGenerationOptions {
  type: 'agent' | 'admin';
  validityDays: number;
  maxUsage?: number;
  agentId?: string;
  notes?: string;
}

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
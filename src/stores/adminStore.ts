import { create } from 'zustand';
import { KeyInfo, KeyUsageLog, DailyStats, AdminDashboardData, KeyGenerationOptions } from '../types/admin';

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
  generateKey: (options: KeyGenerationOptions) => Promise<KeyInfo>;
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
    const { keys, usageLogs } = get();
    
    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = usageLogs.filter(log => 
      log.timestamp.toISOString().split('T')[0] === today
    );
    
    const todayStats: DailyStats = {
      date: today,
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.status === 'active').length,
      expiredKeys: keys.filter(k => k.status === 'expired').length,
      newKeys: keys.filter(k => 
        k.createdAt.toISOString().split('T')[0] === today
      ).length,
      totalUsage: todayLogs.length,
      onlineAgents: keys.filter(k => k.isOnline).length,
      totalSessions: keys.reduce((sum, k) => sum + k.sessionCount, 0)
    };
    
    // Get expiring keys (within 7 days)
    const expiringKeys = get().getExpiringKeys(7);
    
    // Calculate top agents
    const topAgents = keys
      .filter(k => k.type === 'agent' && k.agentName)
      .map(k => ({
        agentId: k.agentId!,
        agentName: k.agentName!,
        sessionCount: k.sessionCount,
        onlineTime: k.isOnline ? 8 : 0, // Mock data
        satisfaction: Math.random() * 2 + 3 // Mock 3-5 rating
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 5);
    
    const dashboardData: AdminDashboardData = {
      todayStats,
      recentLogs: usageLogs.slice(0, 10),
      expiringKeys,
      topAgents
    };
    
    set({ dashboardData });
  },
  
  generateKey: async (options: KeyGenerationOptions): Promise<KeyInfo> => {
    // 生成naoiod格式密钥
    const key = generateNaoiodKey(options.type);
    
    const newKey: KeyInfo = {
      id: Date.now().toString(),
      key,
      type: options.type,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + options.validityDays * 24 * 60 * 60 * 1000),
      agentId: options.agentId,
      usageCount: 0,
      maxUsage: options.maxUsage,
      isOnline: false,
      sessionCount: 0,
      totalSessions: 0,
      createdBy: 'admin',
      notes: options.notes
    };
    
    get().addKey(newKey);
    return newKey;
  },
  
  validateKey: async (key: string): Promise<boolean> => {
    // 首先验证格式
    if (!validateNaoiodFormat(key)) {
      return false;
    }
    
    const { keys } = get();
    const keyInfo = keys.find(k => k.key === key);
    
    if (!keyInfo) return false;
    if (keyInfo.status !== 'active') return false;
    if (keyInfo.expiresAt < new Date()) return false;
    if (keyInfo.maxUsage && keyInfo.usageCount >= keyInfo.maxUsage) return false;
    
    return true;
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
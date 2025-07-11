export interface KeyInfo {
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

export interface KeyUsageLog {
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

export interface DailyStats {
  date: string;
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  newKeys: number;
  totalUsage: number;
  onlineAgents: number;
  totalSessions: number;
}

export interface AdminDashboardData {
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

export interface KeyGenerationOptions {
  type: 'agent' | 'admin';
  validityDays: number;
  maxUsage?: number;
  agentId?: string;
  notes?: string;
}
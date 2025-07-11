import { AgentStatus } from './index';

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  skills: Skill[];
  status: AgentStatus;
  statusUpdatedAt: Date;
  currentSessions: number;
  maxSessions: number;
  totalSessions: number;
  averageResponseTime: number;
  satisfactionRating: number;
  schedule: AgentSchedule;
  groups: AgentGroup[];
  isOnline: boolean;
  lastSeen?: Date;
  workloadScore: number;
  // 新增密钥相关字段
  accessKey?: string;
  keyExpiresAt?: Date;
  keyStatus: 'active' | 'expired' | 'expiring_soon';
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  color: string;
}

export interface AgentGroup {
  id: string;
  name: string;
  description: string;
  department: string;
  type: 'department' | 'skill' | 'product';
  color: string;
  agents: string[];
}

export interface AgentSchedule {
  id: string;
  agentId: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  days: number[];
  timezone: string;
}

export interface AgentStatusLog {
  id: string;
  agentId: string;
  status: AgentStatus;
  previousStatus: AgentStatus;
  timestamp: Date;
  duration: number;
  reason?: string;
}

// AgentStatus 已在 index.ts 中定义

export const AGENT_STATUS_CONFIG = {
  [AgentStatus.ONLINE]: {
    label: 'Online',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'circle',
    canReceiveSessions: true
  },
  [AgentStatus.BUSY]: {
    label: 'Busy',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'clock',
    canReceiveSessions: false
  },
  [AgentStatus.BREAK]: {
    label: 'Break',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'coffee',
    canReceiveSessions: false
  },
  [AgentStatus.OFFLINE]: {
    label: 'Offline',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
    canReceiveSessions: false
  },
  [AgentStatus.TRAINING]: {
    label: 'Training',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    icon: 'graduation-cap',
    canReceiveSessions: false
  }
};

// 密钥验证接口
export interface KeyValidationResult {
  isValid: boolean;
  expiresAt?: Date;
  daysRemaining?: number;
  message: string;
}
export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  agentId?: string;
  agentName?: string;
  status: SessionStatus;
  priority: SessionPriority;
  source: string;
  startTime: Date;
  endTime?: Date;
  lastMessageTime: Date;
  messageCount: number;
  waitTime: number;
  responseTime: number;
  satisfactionRating?: number;
  tags: string[];
  metadata: Record<string, any>;
}

export enum SessionStatus {
  WAITING = 'waiting',
  ASSIGNED = 'assigned',
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum SessionPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  VIP = 'vip',
  URGENT = 'urgent'
}

export interface SessionDistributionConfig {
  strategy: 'round_robin' | 'least_connections' | 'skill_based' | 'vip_priority' | 'sticky';
  skillMatching: boolean;
  vipPriority: boolean;
  maxSessionsPerAgent: number;
  considerWorkload: boolean;
}

export const SESSION_STATUS_CONFIG = {
  [SessionStatus.WAITING]: {
    label: 'Waiting',
    color: '#F59E0B',
    bgColor: '#FEF3C7'
  },
  [SessionStatus.ASSIGNED]: {
    label: 'Assigned',
    color: '#3B82F6',
    bgColor: '#DBEAFE'
  },
  [SessionStatus.ACTIVE]: {
    label: 'Active',
    color: '#10B981',
    bgColor: '#D1FAE5'
  },
  [SessionStatus.RESOLVED]: {
    label: 'Resolved',
    color: '#8B5CF6',
    bgColor: '#EDE9FE'
  },
  [SessionStatus.CLOSED]: {
    label: 'Closed',
    color: '#6B7280',
    bgColor: '#F3F4F6'
  }
};

export const SESSION_PRIORITY_CONFIG = {
  [SessionPriority.LOW]: {
    label: 'Low',
    color: '#6B7280',
    bgColor: '#F3F4F6'
  },
  [SessionPriority.NORMAL]: {
    label: 'Normal',
    color: '#3B82F6',
    bgColor: '#DBEAFE'
  },
  [SessionPriority.HIGH]: {
    label: 'High',
    color: '#F59E0B',
    bgColor: '#FEF3C7'
  },
  [SessionPriority.VIP]: {
    label: 'VIP',
    color: '#8B5CF6',
    bgColor: '#EDE9FE'
  },
  [SessionPriority.URGENT]: {
    label: 'Urgent',
    color: '#DC2626',
    bgColor: '#FEE2E2'
  }
};
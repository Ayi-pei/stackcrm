export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  department: string;
  status: AgentStatus;
  permissions: Permission[];
  lastLogin?: Date;
  createdAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  level: number;
  color: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export enum AgentStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  BREAK = 'break',
  OFFLINE = 'offline',
  TRAINING = 'training'
}

export const USER_ROLES = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Admin',
    level: 100,
    color: '#DC2626',
    permissions: ['*']
  },
  ADMIN: {
    id: 'admin',
    name: 'admin',
    displayName: 'Admin',
    level: 90,
    color: '#7C3AED',
    permissions: ['agents.*', 'roles.*', 'analytics.*', 'settings.*']
  },
  SUPERVISOR: {
    id: 'supervisor',
    name: 'supervisor',
    displayName: 'Supervisor',
    level: 70,
    color: '#2563EB',
    permissions: ['agents.view', 'agents.manage_team', 'analytics.team', 'sessions.monitor']
  },
  SENIOR_AGENT: {
    id: 'senior_agent',
    name: 'senior_agent',
    displayName: 'Senior Agent',
    level: 60,
    color: '#059669',
    permissions: ['sessions.*', 'chat.transfer', 'chat.vip', 'training.assist']
  },
  AGENT: {
    id: 'agent',
    name: 'agent',
    displayName: 'Agent',
    level: 50,
    color: '#0891B2',
    permissions: ['sessions.own', 'chat.basic', 'quickreply.use']
  },
  TRAINEE: {
    id: 'trainee',
    name: 'trainee',
    displayName: 'Trainee',
    level: 30,
    color: '#9333EA',
    permissions: ['sessions.supervised', 'chat.restricted']
  }
} as const;
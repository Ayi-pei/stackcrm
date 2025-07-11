// 用户角色定义
export interface Role {
  id: string;
  name: string;
  displayName: string;
  color: string;
  level: number;
  permissions: Permission[];
}

// 权限定义
export interface Permission {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
}

// 坐席状态
export enum AgentStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  BREAK = 'break',
  OFFLINE = 'offline',
  TRAINING = 'training'
}

// 坐席信息
export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  role: Role;
  status: AgentStatus;
  skills: Skill[];
  groups: AgentGroup[];
  schedule?: Schedule;
  lastActiveAt: Date;
  createdAt: Date;
  isOnline: boolean;
  currentSessions: number;
  maxSessions: number;
}

// 技能标签
export interface Skill {
  id: string;
  name: string;
  displayName: string;
  category: 'presale' | 'aftersale' | 'technical' | 'complaint';
  level: number;
}

// 坐席分组
export interface AgentGroup {
  id: string;
  name: string;
  displayName: string;
  type: 'department' | 'skill' | 'product';
  parentId?: string;
  children?: AgentGroup[];
  agents: Agent[];
}

// 排班信息
export interface Schedule {
  id: string;
  agentId: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  workDays: number[];
  isActive: boolean;
}

// 会话信息
export interface Session {
  id: string;
  userId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended';
  priority: 'low' | 'normal' | 'high' | 'vip';
  requiredSkills: string[];
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  satisfaction?: number;
}

// 消息
export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// 用户信息
export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: Role;
  isOnline: boolean;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

// 权限检查结果
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

// 统计数据
export interface Statistics {
  totalAgents: number;
  onlineAgents: number;
  activeSessions: number;
  waitingQueue: number;
  avgResponseTime: number;
  satisfaction: number;
  todayMessages: number;
  todayResolved: number;
}

// 操作日志
export interface OperationLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// 分配策略
export enum AssignmentStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTION = 'least_connection',
  SKILL_BASED = 'skill_based',
  VIP_PRIORITY = 'vip_priority',
  STICKY = 'sticky'
}

// 系统配置
export interface SystemConfig {
  maxSessionsPerAgent: number;
  autoAssignmentEnabled: boolean;
  assignmentStrategy: AssignmentStrategy;
  workingHours: {
    start: string;
    end: string;
  };
  breakDuration: number;
  sessionTimeout: number;
  enableNotifications: boolean;
}
import { AgentStatus } from '../types';

export const AGENT_STATUS_CONFIG = {
  [AgentStatus.ONLINE]: {
    label: '在线',
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    icon: '🟢'
  },
  [AgentStatus.BUSY]: {
    label: '忙碌',
    color: '#fa8c16',
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
    icon: '🟡'
  },
  [AgentStatus.BREAK]: {
    label: '小休',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff',
    icon: '🔵'
  },
  [AgentStatus.OFFLINE]: {
    label: '离线',
    color: '#8c8c8c',
    bgColor: '#f5f5f5',
    borderColor: '#d9d9d9',
    icon: '⚫'
  },
  [AgentStatus.TRAINING]: {
    label: '培训',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7',
    icon: '🟣'
  }
};

// 状态转换规则
export const STATUS_TRANSITIONS = {
  [AgentStatus.OFFLINE]: [AgentStatus.ONLINE],
  [AgentStatus.ONLINE]: [AgentStatus.BUSY, AgentStatus.BREAK, AgentStatus.OFFLINE, AgentStatus.TRAINING],
  [AgentStatus.BUSY]: [AgentStatus.ONLINE, AgentStatus.BREAK, AgentStatus.OFFLINE],
  [AgentStatus.BREAK]: [AgentStatus.ONLINE, AgentStatus.OFFLINE],
  [AgentStatus.TRAINING]: [AgentStatus.ONLINE, AgentStatus.OFFLINE]
};

// 检查状态转换是否有效
export const isValidStatusTransition = (from: AgentStatus, to: AgentStatus): boolean => {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
};

// 获取可转换的状态列表
export const getAvailableTransitions = (currentStatus: AgentStatus): AgentStatus[] => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};
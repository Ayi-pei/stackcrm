import { Role, Permission } from '../types';

// 权限定义
export const PERMISSIONS: Permission[] = [
  // 聊天相关权限
  { id: 'chat.send', name: 'chat.send', displayName: '发送消息', category: 'chat', description: '发送聊天消息' },
  { id: 'chat.receive', name: 'chat.receive', displayName: '接收消息', category: 'chat', description: '接收聊天消息' },
  { id: 'chat.transfer', name: 'chat.transfer', displayName: '转接会话', category: 'chat', description: '将会话转接给其他客服' },
  { id: 'chat.end', name: 'chat.end', displayName: '结束会话', category: 'chat', description: '结束当前会话' },
  { id: 'chat.history', name: 'chat.history', displayName: '查看历史', category: 'chat', description: '查看聊天历史记录' },
  
  // 数据相关权限
  { id: 'data.view.own', name: 'data.view.own', displayName: '查看个人数据', category: 'data', description: '查看自己的数据' },
  { id: 'data.view.team', name: 'data.view.team', displayName: '查看团队数据', category: 'data', description: '查看团队数据' },
  { id: 'data.view.all', name: 'data.view.all', displayName: '查看全部数据', category: 'data', description: '查看所有数据' },
  { id: 'data.export', name: 'data.export', displayName: '导出数据', category: 'data', description: '导出数据报表' },
  
  // 管理相关权限
  { id: 'agent.create', name: 'agent.create', displayName: '创建坐席', category: 'management', description: '创建新的坐席账号' },
  { id: 'agent.edit', name: 'agent.edit', displayName: '编辑坐席', category: 'management', description: '编辑坐席信息' },
  { id: 'agent.delete', name: 'agent.delete', displayName: '删除坐席', category: 'management', description: '删除坐席账号' },
  { id: 'agent.assign', name: 'agent.assign', displayName: '分配坐席', category: 'management', description: '分配坐席到组织' },
  
  // 系统相关权限
  { id: 'system.config', name: 'system.config', displayName: '系统配置', category: 'system', description: '修改系统配置' },
  { id: 'system.monitor', name: 'system.monitor', displayName: '系统监控', category: 'system', description: '查看系统监控数据' },
  { id: 'system.logs', name: 'system.logs', displayName: '系统日志', category: 'system', description: '查看系统操作日志' },
  
  // 质检相关权限
  { id: 'quality.check', name: 'quality.check', displayName: '质量检查', category: 'quality', description: '进行服务质量检查' },
  { id: 'quality.report', name: 'quality.report', displayName: '质检报告', category: 'quality', description: '生成质检报告' },
  
  // 培训相关权限
  { id: 'training.conduct', name: 'training.conduct', displayName: '培训指导', category: 'training', description: '进行培训指导' },
  { id: 'training.receive', name: 'training.receive', displayName: '接受培训', category: 'training', description: '接受培训指导' }
];

// 角色定义
export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'super_admin',
    displayName: '超级管理员',
    color: '#ff4d4f',
    level: 100,
    permissions: PERMISSIONS // 拥有所有权限
  },
  {
    id: 'admin',
    name: 'admin',
    displayName: '管理员',
    color: '#fa8c16',
    level: 90,
    permissions: PERMISSIONS.filter(p => 
      !p.name.includes('system.config') || p.category !== 'system'
    )
  },
  {
    id: 'supervisor',
    name: 'supervisor',
    displayName: '主管',
    color: '#1890ff',
    level: 70,
    permissions: PERMISSIONS.filter(p => 
      p.category === 'chat' || 
      p.category === 'data' && (p.name.includes('team') || p.name.includes('own')) ||
      p.category === 'quality' ||
      p.name === 'agent.assign'
    )
  },
  {
    id: 'senior_agent',
    name: 'senior_agent',
    displayName: '高级客服',
    color: '#52c41a',
    level: 50,
    permissions: PERMISSIONS.filter(p => 
      p.category === 'chat' ||
      p.name === 'data.view.own' ||
      p.category === 'training' && p.name === 'training.conduct'
    )
  },
  {
    id: 'agent',
    name: 'agent',
    displayName: '普通客服',
    color: '#722ed1',
    level: 30,
    permissions: PERMISSIONS.filter(p => 
      p.category === 'chat' && !p.name.includes('transfer') ||
      p.name === 'data.view.own'
    )
  },
  {
    id: 'trainee',
    name: 'trainee',
    displayName: '实习客服',
    color: '#13c2c2',
    level: 10,
    permissions: PERMISSIONS.filter(p => 
      p.name === 'chat.send' ||
      p.name === 'chat.receive' ||
      p.name === 'data.view.own' ||
      p.name === 'training.receive'
    )
  }
];

// 根据角色名称获取角色信息
export const getRoleByName = (roleName: string): Role | undefined => {
  return ROLES.find(role => role.name === roleName);
};

// 根据角色ID获取角色信息
export const getRoleById = (roleId: string): Role | undefined => {
  return ROLES.find(role => role.id === roleId);
};

// 检查角色是否有特定权限
export const hasPermission = (role: Role, permissionName: string): boolean => {
  return role.permissions.some(permission => permission.name === permissionName);
};

// 检查角色级别
export const hasHigherLevel = (role1: Role, role2: Role): boolean => {
  return role1.level > role2.level;
};
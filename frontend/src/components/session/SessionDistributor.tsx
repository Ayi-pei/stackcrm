import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Tag, message, Space, Tooltip } from 'antd';
import { Play, Pause, Settings, RefreshCw } from 'lucide-react';
import { useAgentStore } from '../../stores/agentStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Agent, Session, AssignmentStrategy, AgentStatus } from '../../types';
import { PermissionGuard } from '../common/PermissionGuard';

const { Option } = Select;

interface DistributorConfig {
  strategy: AssignmentStrategy;
  autoAssign: boolean;
  maxWaitTime: number;
  vipPriority: boolean;
}

export const SessionDistributor: React.FC = () => {
  const { agents, getAvailableAgents } = useAgentStore();
  const { waitingQueue, assignSession } = useSessionStore();
  
  const [config, setConfig] = useState<DistributorConfig>({
    strategy: AssignmentStrategy.ROUND_ROBIN,
    autoAssign: true,
    maxWaitTime: 300, // 5分钟
    vipPriority: true
  });
  
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0);

  // 智能分配算法
  const distributeSession = (session: Session): Agent | null => {
    const availableAgents = getAvailableAgents();
    
    if (availableAgents.length === 0) {
      return null;
    }

    switch (config.strategy) {
      case AssignmentStrategy.ROUND_ROBIN:
        return roundRobinAssign(session, availableAgents);
      
      case AssignmentStrategy.LEAST_CONNECTION:
        return leastConnectionAssign(session, availableAgents);
      
      case AssignmentStrategy.SKILL_BASED:
        return skillBasedAssign(session, availableAgents);
      
      case AssignmentStrategy.VIP_PRIORITY:
        return vipPriorityAssign(session, availableAgents);
      
      case AssignmentStrategy.STICKY:
        return stickyAssign(session, availableAgents);
      
      default:
        return availableAgents[0];
    }
  };

  // 轮询分配
  const roundRobinAssign = (session: Session, agents: Agent[]): Agent => {
    const agent = agents[lastAssignedIndex % agents.length];
    setLastAssignedIndex(prev => prev + 1);
    return agent;
  };

  // 最少连接分配
  const leastConnectionAssign = (session: Session, agents: Agent[]): Agent => {
    return agents.reduce((prev, current) => 
      current.currentSessions < prev.currentSessions ? current : prev
    );
  };

  // 技能匹配分配
  const skillBasedAssign = (session: Session, agents: Agent[]): Agent => {
    if (session.requiredSkills.length === 0) {
      return leastConnectionAssign(session, agents);
    }

    const matchedAgents = agents.filter(agent =>
      session.requiredSkills.every(skill =>
        agent.skills.some(agentSkill => agentSkill.id === skill)
      )
    );

    if (matchedAgents.length === 0) {
      return leastConnectionAssign(session, agents);
    }

    return leastConnectionAssign(session, matchedAgents);
  };

  // VIP优先分配
  const vipPriorityAssign = (session: Session, agents: Agent[]): Agent => {
    if (session.priority === 'vip') {
      const seniorAgents = agents.filter(agent => 
        agent.role.level >= 50 // 高级客服及以上
      );
      
      if (seniorAgents.length > 0) {
        return leastConnectionAssign(session, seniorAgents);
      }
    }

    return leastConnectionAssign(session, agents);
  };

  // 历史客服优先分配
  const stickyAssign = (session: Session, agents: Agent[]): Agent => {
    // 这里应该查询历史记录，找到之前服务过该用户的客服
    // 暂时使用最少连接分配
    return leastConnectionAssign(session, agents);
  };

  // 手动分配会话
  const handleManualAssign = (sessionId: string, agentId: string) => {
    assignSession(sessionId, agentId);
    message.success('会话分配成功');
  };

  // 自动分配处理
  useEffect(() => {
    if (!config.autoAssign) return;

    const interval = setInterval(() => {
      waitingQueue.forEach(session => {
        const waitTime = Date.now() - session.startTime.getTime();
        
        // 检查是否超过最大等待时间
        if (waitTime > config.maxWaitTime * 1000) {
          const agent = distributeSession(session);
          if (agent) {
            assignSession(session.id, agent.id);
            message.info(`会话已自动分配给 ${agent.name}`);
          }
        }
      });
    }, 5000); // 每5秒检查一次

    return () => clearInterval(interval);
  }, [config, waitingQueue, assignSession]);

  // 排队表格列
  const queueColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId'
    },
    {
      title: '优先级',
      key: 'priority',
      render: (record: Session) => {
        const colors = {
          low: 'default',
          normal: 'blue',
          high: 'orange',
          vip: 'red'
        };
        return <Tag color={colors[record.priority]}>{record.priority.toUpperCase()}</Tag>;
      }
    },
    {
      title: '等待时间',
      key: 'waitTime',
      render: (record: Session) => {
        const waitTime = Math.floor((Date.now() - record.startTime.getTime()) / 1000);
        const minutes = Math.floor(waitTime / 60);
        const seconds = waitTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    },
    {
      title: '所需技能',
      key: 'skills',
      render: (record: Session) => (
        <div>
          {record.requiredSkills.map(skill => (
            <Tag key={skill} size="small">{skill}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Session) => (
        <PermissionGuard permission="agent.assign">
          <Select
            placeholder="选择坐席"
            style={{ width: 120 }}
            onSelect={(agentId) => handleManualAssign(record.id, agentId)}
          >
            {getAvailableAgents().map(agent => (
              <Option key={agent.id} value={agent.id}>
                {agent.name} ({agent.currentSessions}/{agent.maxSessions})
              </Option>
            ))}
          </Select>
        </PermissionGuard>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">会话分配系统</h1>
        
        <Space>
          <Tooltip title={config.autoAssign ? '暂停自动分配' : '启动自动分配'}>
            <Button
              type={config.autoAssign ? 'primary' : 'default'}
              icon={config.autoAssign ? <Pause size={16} /> : <Play size={16} />}
              onClick={() => setConfig(prev => ({ ...prev, autoAssign: !prev.autoAssign }))}
            >
              {config.autoAssign ? '自动分配中' : '手动分配'}
            </Button>
          </Tooltip>
          
          <Button icon={<RefreshCw size={16} />}>
            刷新队列
          </Button>
        </Space>
      </div>

      {/* 分配策略配置 */}
      <Card title="分配策略配置" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">分配策略</label>
            <Select
              value={config.strategy}
              onChange={(strategy) => setConfig(prev => ({ ...prev, strategy }))}
              style={{ width: '100%' }}
            >
              <Option value={AssignmentStrategy.ROUND_ROBIN}>轮询分配</Option>
              <Option value={AssignmentStrategy.LEAST_CONNECTION}>最少连接</Option>
              <Option value={AssignmentStrategy.SKILL_BASED}>技能匹配</Option>
              <Option value={AssignmentStrategy.VIP_PRIORITY}>VIP优先</Option>
              <Option value={AssignmentStrategy.STICKY}>历史客服优先</Option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">最大等待时间（秒）</label>
            <Select
              value={config.maxWaitTime}
              onChange={(maxWaitTime) => setConfig(prev => ({ ...prev, maxWaitTime }))}
              style={{ width: '100%' }}
            >
              <Option value={60}>1分钟</Option>
              <Option value={180}>3分钟</Option>
              <Option value={300}>5分钟</Option>
              <Option value={600}>10分钟</Option>
            </Select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.vipPriority}
                onChange={(e) => setConfig(prev => ({ ...prev, vipPriority: e.target.checked }))}
              />
              <span className="text-sm font-medium">VIP优先处理</span>
            </label>
          </div>
        </div>
      </Card>

      {/* 排队列表 */}
      <Card title={`排队列表 (${waitingQueue.length})`}>
        <Table
          columns={queueColumns}
          dataSource={waitingQueue}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无排队用户' }}
        />
      </Card>

      {/* 可用坐席 */}
      <Card title={`可用坐席 (${getAvailableAgents().length})`} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getAvailableAgents().map(agent => (
            <div key={agent.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{agent.name}</span>
                <Tag color={agent.role.color}>{agent.role.displayName}</Tag>
              </div>
              <div className="text-sm text-gray-500">
                当前会话: {agent.currentSessions}/{agent.maxSessions}
              </div>
              <div className="text-sm text-gray-500">
                技能: {agent.skills.map(skill => skill.displayName).join(', ') || '无'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
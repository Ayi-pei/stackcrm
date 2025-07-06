import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Avatar } from 'antd';
import { 
  Users, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAgentStore } from '../../stores/agentStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Agent, AgentStatus, Statistics } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AGENT_STATUS_CONFIG } from '../../constants/agentStatus';

export const StatusMonitor: React.FC = () => {
  const { agents, getOnlineAgents, getAvailableAgents } = useAgentStore();
  const { activeSessions, waitingQueue } = useSessionStore();
  const [statistics, setStatistics] = useState<Statistics>({
    totalAgents: 0,
    onlineAgents: 0,
    activeSessions: 0,
    waitingQueue: 0,
    avgResponseTime: 0,
    satisfaction: 0,
    todayMessages: 0,
    todayResolved: 0
  });

  // 实时更新统计数据
  useEffect(() => {
    const updateStats = () => {
      const onlineAgents = getOnlineAgents();
      const availableAgents = getAvailableAgents();
      
      setStatistics({
        totalAgents: agents.length,
        onlineAgents: onlineAgents.length,
        activeSessions: activeSessions.length,
        waitingQueue: waitingQueue.length,
        avgResponseTime: Math.floor(Math.random() * 60) + 30, // 模拟数据
        satisfaction: Math.floor(Math.random() * 20) + 80, // 模拟数据
        todayMessages: Math.floor(Math.random() * 1000) + 500, // 模拟数据
        todayResolved: Math.floor(Math.random() * 100) + 50 // 模拟数据
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [agents, activeSessions, waitingQueue, getOnlineAgents, getAvailableAgents]);

  // 状态分布统计
  const statusDistribution = Object.values(AgentStatus).map(status => {
    const count = agents.filter(agent => agent.status === status).length;
    const percentage = agents.length > 0 ? (count / agents.length) * 100 : 0;
    
    return {
      status,
      count,
      percentage,
      config: AGENT_STATUS_CONFIG[status]
    };
  });

  // 坐席工作负载表格列
  const workloadColumns = [
    {
      title: '坐席',
      key: 'agent',
      render: (record: Agent) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.avatar} size={32}>
            {record.name.charAt(0)}
          </Avatar>
          <span>{record.name}</span>
        </div>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Agent) => (
        <StatusBadge status={record.status} size="sm" />
      )
    },
    {
      title: '当前会话',
      key: 'sessions',
      render: (record: Agent) => (
        <div className="flex items-center gap-2">
          <span>{record.currentSessions}/{record.maxSessions}</span>
          <Progress 
            percent={(record.currentSessions / record.maxSessions) * 100}
            size="small"
            showInfo={false}
            strokeColor={record.currentSessions >= record.maxSessions ? '#ff4d4f' : '#52c41a'}
          />
        </div>
      )
    },
    {
      title: '工作负载',
      key: 'workload',
      render: (record: Agent) => {
        const percentage = (record.currentSessions / record.maxSessions) * 100;
        let color = '#52c41a';
        let text = '轻松';
        
        if (percentage >= 80) {
          color = '#ff4d4f';
          text = '繁忙';
        } else if (percentage >= 60) {
          color = '#fa8c16';
          text = '适中';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">实时监控大屏</h1>
      
      {/* 核心指标 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总坐席数"
              value={statistics.totalAgents}
              prefix={<Users className="text-blue-500" size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线坐席"
              value={statistics.onlineAgents}
              prefix={<CheckCircle className="text-green-500" size={20} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${statistics.totalAgents}`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会话"
              value={statistics.activeSessions}
              prefix={<MessageCircle className="text-orange-500" size={20} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="排队用户"
              value={statistics.waitingQueue}
              prefix={<Clock className="text-red-500" size={20} />}
              valueStyle={{ color: statistics.waitingQueue > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能指标 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={statistics.avgResponseTime}
              suffix="秒"
              prefix={<TrendingUp className="text-purple-500" size={20} />}
              valueStyle={{ 
                color: statistics.avgResponseTime > 60 ? '#ff4d4f' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="满意度评分"
              value={statistics.satisfaction}
              suffix="%"
              prefix={<CheckCircle className="text-green-500" size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日消息数"
              value={statistics.todayMessages}
              prefix={<MessageCircle className="text-blue-500" size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日解决数"
              value={statistics.todayResolved}
              prefix={<CheckCircle className="text-green-500" size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 状态分布 */}
        <Col xs={24} lg={8}>
          <Card title="坐席状态分布" className="h-full">
            <div className="space-y-4">
              {statusDistribution.map(({ status, count, percentage, config }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{count}人</span>
                    <Progress 
                      percent={percentage} 
                      size="small" 
                      strokeColor={config.color}
                      style={{ width: 60 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 坐席工作负载 */}
        <Col xs={24} lg={16}>
          <Card title="坐席工作负载" className="h-full">
            <Table
              columns={workloadColumns}
              dataSource={agents.filter(agent => agent.isOnline)}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 告警信息 */}
      {statistics.waitingQueue > 5 && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <span className="font-medium">
              告警：当前排队用户过多（{statistics.waitingQueue}人），建议增加在线坐席
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};
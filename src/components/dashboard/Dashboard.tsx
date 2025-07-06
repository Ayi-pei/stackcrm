import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { Users, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import { useAgentStore } from '../../stores/agentStore';
import { useSessionStore } from '../../stores/sessionStore';
import { StatusMonitor } from './StatusMonitor';

export const Dashboard: React.FC = () => {
  const { agents, getOnlineAgents } = useAgentStore();
  const { activeSessions, waitingQueue } = useSessionStore();

  const onlineAgents = getOnlineAgents();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      
      {/* 快速统计 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总坐席数"
              value={agents.length}
              prefix={<Users className="text-blue-500" size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线坐席"
              value={onlineAgents.length}
              prefix={<Users className="text-green-500" size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会话"
              value={activeSessions.length}
              prefix={<MessageCircle className="text-orange-500" size={20} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="排队用户"
              value={waitingQueue.length}
              prefix={<Clock className="text-red-500" size={20} />}
              valueStyle={{ color: waitingQueue.length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 实时监控组件 */}
      <StatusMonitor />
    </div>
  );
};
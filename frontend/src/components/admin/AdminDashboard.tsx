import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
  Button,
  Space,
} from "antd";
import {
  Key,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useAdminStore } from "../../stores/adminStore";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, keys, refreshDashboard, loading, getExpiringKeys } =
    useAdminStore();

  useEffect(() => {
    refreshDashboard();

    // Auto refresh every 30 seconds
    const interval = setInterval(refreshDashboard, 30000);
    return () => clearInterval(interval);
  }, [refreshDashboard]);

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  const { todayStats, recentLogs, expiringKeys, topAgents } = dashboardData;
  const criticalKeys = getExpiringKeys(3); // 3天内过期的关键密钥

  // 计算在线率
  const onlineRate = todayStats.activeKeys > 0 
    ? (todayStats.onlineAgents / todayStats.activeKeys) * 100 
    : 0;

  // 密钥状态分布
  const keyStatusData = [
    { status: "active", count: todayStats.activeKeys, color: "#52c41a" },
    { status: "expired", count: todayStats.expiredKeys, color: "#ff4d4f" },
    { status: "expiring_soon", count: expiringKeys.length, color: "#fa8c16" },
  ];

  // 最近使用日志表格列
  const logColumns = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
      render: (timestamp: Date) => (
        <span className="text-sm">
          {formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })}
        </span>
      ),
    },
    {
      title: "密钥",
      dataIndex: "keyId",
      key: "keyId",
      width: 150,
      render: (keyId: string) => {
        const key = keys.find((k) => k.id === keyId);
        return (
          <span className="font-mono text-sm">
            {key?.key.slice(-8) || keyId.slice(-8)}
          </span>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (action: string) => {
        const actionConfig = {
          login: { color: "green", text: "登录" },
          logout: { color: "orange", text: "登出" },
          session_start: { color: "blue", text: "开始会话" },
          session_end: { color: "purple", text: "结束会话" },
          heartbeat: { color: "default", text: "心跳" },
        };
        const config = actionConfig[action as keyof typeof actionConfig] || {
          color: "default",
          text: action,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 120,
      render: (ip: string) => <span className="text-sm font-mono">{ip}</span>,
    },
  ];

  // 即将过期密钥表格列
  const expiringKeyColumns = [
    {
      title: "密钥",
      dataIndex: "key",
      key: "key",
      render: (key: string) => <span className="font-mono text-sm">{key}</span>,
    },
    {
      title: "坐席",
      dataIndex: "agentName",
      key: "agentName",
      render: (name: string) => (
        <div>
          <div className="font-medium">{name || "未分配"}</div>
        </div>
      ),
    },
    {
      title: "过期时间",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date: Date) => {
        const daysLeft = Math.ceil(
          (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return (
          <div>
            <div className="text-sm">{date.toLocaleDateString("zh-CN")}</div>
            <div
              className={`text-xs ${
                daysLeft <= 1
                  ? "text-red-600"
                  : daysLeft <= 3
                  ? "text-orange-600"
                  : "text-gray-500"
              }`}
            >
              {daysLeft <= 0 ? "已过期" : `${daysLeft}天后过期`}
            </div>
          </div>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "isOnline",
      key: "isOnline",
      render: (isOnline: boolean) => (
        <Tag color={isOnline ? "green" : "default"}>
          {isOnline ? "在线" : "离线"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AYI云聚控制台</h1>
          <p className="text-gray-600 mt-1">密钥管理与使用监控</p>
        </div>
        <Space>
          <Button
            icon={<RefreshCw size={16} />}
            onClick={refreshDashboard}
            loading={loading}
          >
            刷新数据
          </Button>
          <Button
            icon={<Eye size={16} />}
            onClick={() => navigate("/admin/keys")}
          >
            密钥管理
          </Button>
        </Space>
      </div>

      {/* 关键告警 */}
      {criticalKeys.length > 0 && (
        <Alert
          message="紧急提醒"
          description={`有 ${criticalKeys.length} 个密钥将在3天内过期，请及时处理以避免影响坐席正常使用。`}
          type="error"
          icon={<AlertTriangle />}
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={() => navigate("/admin/keys?filter=expiring")}
            >
              立即处理
            </Button>
          }
          className="mb-6"
        />
      )}

      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日生成密钥"
              value={todayStats.newKeys}
              prefix={<Key className="text-blue-500" size={20} />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              总密钥数: {todayStats.totalKeys}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日使用次数"
              value={todayStats.totalUsage}
              prefix={<Activity className="text-green-500" size={20} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              活跃密钥: {todayStats.activeKeys}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线坐席"
              value={todayStats.onlineAgents}
              prefix={<Users className="text-orange-500" size={20} />}
              valueStyle={{ color: "#fa8c16" }}
              suffix={`/ ${todayStats.activeKeys}`}
            />
            <div className="mt-2">
              <Progress
                percent={Math.round(onlineRate)}
                size="small"
                strokeColor="#fa8c16"
                showInfo={false}
              />
              <span className="text-xs text-gray-500">
                在线率 {Math.round(onlineRate)}%
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会话"
              value={todayStats.totalSessions}
              prefix={<TrendingUp className="text-purple-500" size={20} />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              平均每坐席:{" "}
              {todayStats.onlineAgents > 0
                ? Math.round(todayStats.totalSessions / todayStats.onlineAgents)
                : 0}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 密钥状态分布 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="密钥状态分布" className="h-full">
            <div className="space-y-4">
              {keyStatusData.map(({ status, count, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">
                      {status === "active"
                        ? "正常"
                        : status === "expired"
                        ? "已过期"
                        : "即将过期"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Progress
                      percent={
                        todayStats.totalKeys > 0
                          ? (count / todayStats.totalKeys) * 100
                          : 0
                      }
                      size="small"
                      strokeColor={color}
                      style={{ width: 60 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="即将过期密钥" className="h-full">
            <Table
              columns={expiringKeyColumns}
              dataSource={expiringKeys.slice(0, 5)}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: "暂无即将过期的密钥" }}
            />
            {expiringKeys.length > 5 && (
              <div className="mt-3 text-center">
                <Button
                  type="link"
                  onClick={() => navigate("/admin/keys?filter=expiring")}
                >
                  查看全部 {expiringKeys.length} 个即将过期密钥
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 使用日志和性能统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="最近使用日志" className="h-full">
            <Table
              columns={logColumns}
              dataSource={recentLogs}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
              locale={{ emptyText: "暂无使用记录" }}
            />
            <div className="mt-3 text-center">
              <Button type="link" onClick={() => navigate("/admin/logs")}>
                查看完整日志
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="坐席性能排行" className="h-full">
            <div className="space-y-3">
              {topAgents.map((agent, index) => (
                <div
                  key={agent.agentId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-600"
                          : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {agent.agentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {agent.sessionCount} 会话 • 满意度{" "}
                        {agent.satisfaction.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {agent.onlineTime}h
                    </div>
                    <div className="text-xs text-gray-500">在线时长</div>
                  </div>
                </div>
              ))}
            </div>
            {topAgents.length === 0 && (
              <div className="text-center py-8 text-gray-500">暂无坐席数据</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Card title="系统状态">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium">密钥服务</span>
              </div>
              <div className="text-sm text-gray-500">正常运行</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="text-blue-500" size={20} />
                <span className="font-medium">认证服务</span>
              </div>
              <div className="text-sm text-gray-500">正常运行</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Activity className="text-green-500" size={20} />
                <span className="font-medium">监控服务</span>
              </div>
              <div className="text-sm text-gray-500">正常运行</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
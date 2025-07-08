import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Tooltip,
  Card,
  DatePicker,
  InputNumber,
  Switch,
  Alert,
  Progress
} from 'antd';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Pause, 
  Play,
  Download,
  Upload,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { KeyInfo, KeyGenerationOptions } from '../../types/admin';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const KeyManagement: React.FC = () => {
  const { 
    keys, 
    loading,
    generateKey,
    updateKey,
    deleteKey,
    suspendKey,
    activateKey,
    getKeysByStatus,
    getExpiringKeys,
    refreshDashboard
  } = useAdminStore();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<KeyInfo['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<KeyInfo['type'] | 'all'>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyInfo | null>(null);
  const [showKeyValues, setShowKeyValues] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();

  useEffect(() => {
    // Load keys data on component mount
    refreshDashboard();
  }, [refreshDashboard]);

  // 过滤数据 - 确保去重
  const filteredKeys = React.useMemo(() => {
    // 首先去重，基于密钥ID
    const uniqueKeys = keys.filter((key, index, self) => 
      index === self.findIndex(k => k.id === key.id)
    );

    return uniqueKeys.filter(key => {
      const matchesSearch = key.key.toLowerCase().includes(searchText.toLowerCase()) ||
                           (key.agentName && key.agentName.toLowerCase().includes(searchText.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
      const matchesType = typeFilter === 'all' || key.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [keys, searchText, statusFilter, typeFilter]);

  // 获取密钥状态配置
  const getStatusConfig = (status: KeyInfo['status']) => {
    const configs = {
      active: { color: 'green', text: '正常', icon: <CheckCircle size={14} /> },
      expired: { color: 'red', text: '已过期', icon: <AlertTriangle size={14} /> },
      expiring_soon: { color: 'orange', text: '即将过期', icon: <Clock size={14} /> },
      suspended: { color: 'default', text: '已暂停', icon: <Pause size={14} /> }
    };
    return configs[status];
  };

  // 计算剩余天数
  const getDaysRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 复制密钥
  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      message.success('密钥已复制到剪贴板');
    } catch (err) {
      message.error('复制失败');
    }
  };

  // 切换密钥显示
  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => 
      prev.includes(keyId) 
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '密钥信息',
      key: 'keyInfo',
      width: 300,
      render: (record: KeyInfo) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">
              {showKeyValues.includes(record.id) 
                ? record.key 
                : record.key.replace(/./g, '*').slice(0, -4) + record.key.slice(-4)
              }
            </span>
            <Button
              type="text"
              size="small"
              icon={showKeyValues.includes(record.id) ? <EyeOff size={12} /> : <Eye size={12} />}
              onClick={() => toggleKeyVisibility(record.id)}
            />
            <Button
              type="text"
              size="small"
              icon={<Copy size={12} />}
              onClick={() => copyKey(record.key)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Tag color={record.type === 'admin' ? 'red' : 'blue'}>
              {record.type === 'admin' ? '管理员' : '坐席'}
            </Tag>
            <span className="text-xs text-gray-500">
              创建于 {formatDistanceToNow(record.createdAt, { addSuffix: true, locale: zhCN })}
            </span>
          </div>
        </div>
      )
    },
    {
      title: '绑定坐席',
      key: 'agent',
      width: 200,
      render: (record: KeyInfo) => (
        record.type === 'agent' ? (
          <div>
            <div className="font-medium">{record.agentName || '未分配'}</div>
            {record.isOnline && (
              <Tag color="green" size="small">在线</Tag>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (record: KeyInfo) => {
        const config = getStatusConfig(record.status);
        return (
          <div className="space-y-1">
            <Tag color={config.color} icon={config.icon}>
              {config.text}
            </Tag>
            {record.status === 'active' || record.status === 'expiring_soon' ? (
              <div className="text-xs text-gray-500">
                {getDaysRemaining(record.expiresAt)}天后过期
              </div>
            ) : record.status === 'expired' ? (
              <div className="text-xs text-red-500">
                已过期{Math.abs(getDaysRemaining(record.expiresAt))}天
              </div>
            ) : null}
          </div>
        );
      }
    },
    {
      title: '使用情况',
      key: 'usage',
      width: 150,
      render: (record: KeyInfo) => (
        <div className="space-y-1">
          <div className="text-sm">
            使用 {record.usageCount} 次
            {record.maxUsage && ` / ${record.maxUsage}`}
          </div>
          {record.maxUsage && (
            <Progress 
              percent={(record.usageCount / record.maxUsage) * 100}
              size="small"
              strokeColor={record.usageCount >= record.maxUsage ? '#ff4d4f' : '#52c41a'}
            />
          )}
          {record.lastUsedAt && (
            <div className="text-xs text-gray-500">
              最后使用: {formatDistanceToNow(record.lastUsedAt, { addSuffix: true, locale: zhCN })}
            </div>
          )}
        </div>
      )
    },
    {
      title: '会话数据',
      key: 'sessions',
      width: 120,
      render: (record: KeyInfo) => (
        record.type === 'agent' ? (
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{record.sessionCount}</div>
            <div className="text-xs text-gray-500">当前会话</div>
            <div className="text-xs text-gray-500">总计: {record.totalSessions}</div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: KeyInfo) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          {record.status === 'active' ? (
            <Tooltip title="暂停">
              <Button
                type="text"
                size="small"
                icon={<Pause size={14} />}
                onClick={() => handleSuspend(record.id)}
              />
            </Tooltip>
          ) : record.status === 'suspended' ? (
            <Tooltip title="激活">
              <Button
                type="text"
                size="small"
                icon={<Play size={14} />}
                onClick={() => handleActivate(record.id)}
              />
            </Tooltip>
          ) : null}
          
          <Popconfirm
            title="确定要删除这个密钥吗？"
            description="删除后无法恢复，相关坐席将无法继续使用。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 size={14} />}
                disabled={record.key === 'adminayi888'} // 不能删除超级管理员密钥
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理编辑
  const handleEdit = (key: KeyInfo) => {
    setEditingKey(key);
    form.setFieldsValue({
      ...key,
      expiresAt: key.expiresAt
    });
    setIsModalVisible(true);
  };

  // 处理暂停
  const handleSuspend = (id: string) => {
    suspendKey(id);
    message.success('密钥已暂停');
  };

  // 处理激活
  const handleActivate = (id: string) => {
    activateKey(id);
    message.success('密钥已激活');
  };

  // 处理删除
  const handleDelete = (id: string) => {
    deleteKey(id);
    message.success('密钥已删除');
  };

  // 处理生成密钥
  const handleGenerate = async (values: any) => {
    try {
      const options: KeyGenerationOptions = {
        type: values.type,
        validityDays: values.validityDays,
        maxUsage: values.maxUsage,
        agentId: values.agentId,
        notes: values.notes
      };
      
      const newKey = await generateKey(options);
      setIsGenerateModalVisible(false);
      generateForm.resetFields();
      message.success(`密钥生成成功: ${newKey.key}`);
      
      // 自动复制到剪贴板
      copyKey(newKey.key);
    } catch (error) {
      message.error('密钥生成失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      if (editingKey) {
        updateKey(editingKey.id, values);
        message.success('密钥更新成功');
      }
      
      setIsModalVisible(false);
      setEditingKey(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 批量操作
  const handleBatchDelete = () => {
    selectedRowKeys.forEach(id => deleteKey(id));
    setSelectedRowKeys([]);
    message.success('批量删除成功');
  };

  const handleBatchSuspend = () => {
    selectedRowKeys.forEach(id => suspendKey(id));
    setSelectedRowKeys([]);
    message.success('批量暂停成功');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: KeyInfo) => ({
      disabled: record.key === 'adminayi888' // 不能选择超级管理员密钥
    })
  };

  // 统计数据 - 基于去重后的数据
  const stats = React.useMemo(() => {
    const uniqueKeys = keys.filter((key, index, self) => 
      index === self.findIndex(k => k.id === key.id)
    );
    
    return {
      total: uniqueKeys.length,
      active: uniqueKeys.filter(k => k.status === 'active').length,
      expired: uniqueKeys.filter(k => k.status === 'expired').length,
      expiring: uniqueKeys.filter(k => k.status === 'expiring_soon').length
    };
  }, [keys]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">密钥管理</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>总计: {stats.total}</span>
              <span className="text-green-600">正常: {stats.active}</span>
              <span className="text-orange-600">即将过期: {stats.expiring}</span>
              <span className="text-red-600">已过期: {stats.expired}</span>
            </div>
          </div>
          
          <Space>
            <Button 
              icon={<RefreshCw size={16} />}
              onClick={refreshDashboard}
              loading={loading}
            >
              刷新
            </Button>
            
            <Button 
              icon={<Download size={16} />}
            >
              导出数据
            </Button>
            
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsGenerateModalVisible(true)}
            >
              生成密钥
            </Button>
          </Space>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索密钥或坐席姓名"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            placeholder="状态筛选"
          >
            <Option value="all">全部状态</Option>
            <Option value="active">正常</Option>
            <Option value="expiring_soon">即将过期</Option>
            <Option value="expired">已过期</Option>
            <Option value="suspended">已暂停</Option>
          </Select>
          
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 120 }}
            placeholder="类型筛选"
          >
            <Option value="all">全部类型</Option>
            <Option value="agent">坐席密钥</Option>
            <Option value="admin">管理员密钥</Option>
          </Select>
        </div>

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Button 
                size="small" 
                onClick={handleBatchSuspend}
              >
                批量暂停
              </Button>
              <Button 
                size="small" 
                danger 
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
            </Space>
          </div>
        )}

        {/* 即将过期提醒 */}
        {stats.expiring > 0 && (
          <Alert
            message={`有 ${stats.expiring} 个密钥将在7天内过期`}
            description="请及时处理以避免影响坐席正常使用"
            type="warning"
            showIcon
            className="mb-4"
            action={
              <Button
                size="small"
                onClick={() => setStatusFilter('expiring_soon')}
              >
                查看详情
              </Button>
            }
          />
        )}
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={filteredKeys}
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          total: filteredKeys.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />

      {/* 编辑模态框 */}
      <Modal
        title="编辑密钥"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="maxUsage"
            label="最大使用次数"
          >
            <InputNumber 
              min={1} 
              placeholder="留空表示无限制" 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="expiresAt"
            label="过期时间"
          >
            <DatePicker 
              showTime 
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              更新
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 生成密钥模态框 */}
      <Modal
        title="生成新密钥"
        open={isGenerateModalVisible}
        onCancel={() => {
          setIsGenerateModalVisible(false);
          generateForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="naoiod安全密钥格式"
            description="新密钥将采用naoiod安全格式，由12-16位小写字母和数字组成，提供更高的安全性。"
            type="info"
            showIcon
            className="mb-4"
          />

          <Form
            form={generateForm}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              type: 'agent',
              validityDays: 2  // 修改默认有效期为2天（48小时）
            }}
          >
            <Form.Item
              name="type"
              label="密钥类型"
              rules={[{ required: true, message: '请选择密钥类型' }]}
            >
              <Select>
                <Option value="agent">坐席密钥</Option>
                <Option value="admin">管理员密钥</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="validityDays"
              label="有效期（天）"
              rules={[{ required: true, message: '请输入有效期' }]}
              extra="默认48小时（2天），可根据需要调整"
            >
              <InputNumber 
                min={1} 
                max={3650}
                style={{ width: '100%' }}
                placeholder="请输入有效天数"
              />
            </Form.Item>
            
            <Form.Item
              name="maxUsage"
              label="最大使用次数"
            >
              <InputNumber 
                min={1} 
                placeholder="留空表示无限制" 
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="agentId"
              label="绑定坐席ID"
              tooltip="仅坐席密钥需要填写"
            >
              <Input placeholder="请输入坐席ID（可选）" />
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="备注"
            >
              <Input.TextArea placeholder="请输入备注信息" rows={3} />
            </Form.Item>
            
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsGenerateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" icon={<Key size={16} />}>
                生成密钥
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
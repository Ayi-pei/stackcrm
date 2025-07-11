import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, ColorPicker, message, Popconfirm, Tree, Checkbox } from 'antd';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { ROLES, PERMISSIONS } from '../../constants/roles';
import { Role, Permission } from '../../types';
import { PermissionGuard } from '../common/PermissionGuard';

// 权限树组件
const PermissionTree: React.FC<{
  selectedRole: Role | null;
  onRoleUpdate: (role: Role) => void;
}> = ({ selectedRole, onRoleUpdate }) => {
  if (!selectedRole) return null;

  // 按分类组织权限
  const permissionsByCategory = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const updatedPermissions = checked
      ? [...selectedRole.permissions, PERMISSIONS.find(p => p.id === permissionId)!]
      : selectedRole.permissions.filter(p => p.id !== permissionId);

    onRoleUpdate({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  const categoryNames = {
    chat: '聊天功能',
    data: '数据权限',
    management: '管理功能',
    system: '系统配置',
    quality: '质量检查',
    training: '培训功能'
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        为角色 <strong>{selectedRole.displayName}</strong> 配置权限
      </div>
      
      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
        <div key={category} className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            {categoryNames[category as keyof typeof categoryNames] || category}
          </h4>
          <div className="space-y-2">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedRole.permissions.some(p => p.id === permission.id)}
                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{permission.displayName}</div>
                  <div className="text-xs text-gray-500">{permission.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="primary"
          onClick={() => message.success('权限配置已保存')}
        >
          保存配置
        </Button>
      </div>
    </div>
  );
};

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // 表格列定义
  const columns = [
    {
      title: '角色名称',
      key: 'role',
      render: (record: Role) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: record.color }}
          />
          <span className="font-medium">{record.displayName}</span>
        </div>
      )
    },
    {
      title: '权限级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => (
        <Tag color={level >= 90 ? 'red' : level >= 70 ? 'orange' : level >= 50 ? 'blue' : 'green'}>
          {level}
        </Tag>
      )
    },
    {
      title: '权限数量',
      key: 'permissions',
      render: (record: Role) => (
        <span>{record.permissions.length} 个权限</span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Role) => (
        <Space>
          <Button
            type="text"
            icon={<Shield size={16} />}
            onClick={() => handleConfigPermissions(record)}
          >
            配置权限
          </Button>
          
          <PermissionGuard permission="system.config">
            <Button
              type="text"
              icon={<Edit size={16} />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          
          <PermissionGuard permission="system.config">
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                disabled={record.name === 'super_admin'} // 不能删除超级管理员
              >
                删除
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      )
    }
  ];

  // 配置权限
  const handleConfigPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalVisible(true);
  };

  // 编辑角色
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      ...role,
      color: role.color
    });
    setIsModalVisible(true);
  };

  // 删除角色
  const handleDelete = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
    message.success('角色删除成功');
  };

  // 提交角色表单
  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        // 更新角色
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...values }
            : role
        ));
        message.success('角色更新成功');
      } else {
        // 创建新角色
        const newRole: Role = {
          id: Date.now().toString(),
          name: values.name.toLowerCase().replace(/\s+/g, '_'),
          ...values,
          permissions: []
        };
        setRoles(prev => [...prev, newRole]);
        message.success('角色创建成功');
      }
      
      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 更新角色权限
  const handleRoleUpdate = (updatedRole: Role) => {
    setRoles(prev => prev.map(role => 
      role.id === updatedRole.id ? updatedRole : role
    ));
    setSelectedRole(updatedRole);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">角色管理</h1>
        
        <PermissionGuard permission="system.config">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditingRole(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新增角色
          </Button>
        </PermissionGuard>
      </div>

      {/* 角色列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 角色编辑模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRole(null);
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
            name="displayName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色显示名称" />
          </Form.Item>
          
          <Form.Item
            name="level"
            label="权限级别"
            rules={[{ required: true, message: '请输入权限级别' }]}
          >
            <Input 
              type="number" 
              min={1} 
              max={100} 
              placeholder="1-100，数字越大权限越高" 
            />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="角色颜色"
            rules={[{ required: true, message: '请选择角色颜色' }]}
          >
            <ColorPicker showText />
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingRole ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 权限配置模态框 */}
      <Modal
        title="权限配置"
        open={isPermissionModalVisible}
        onCancel={() => {
          setIsPermissionModalVisible(false);
          setSelectedRole(null);
        }}
        footer={null}
        width={800}
      >
        <PermissionTree
          selectedRole={selectedRole}
          onRoleUpdate={handleRoleUpdate}
        />
      </Modal>
    </div>
  );
};
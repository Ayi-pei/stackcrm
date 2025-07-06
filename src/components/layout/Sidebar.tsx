import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Monitor, 
  GitBranch,
  Key,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuthStore();

  const isAdmin = user?.role.name === 'super_admin' || user?.role.name === 'admin';

  // Admin menu items
  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: '管理控制台'
    },
    {
      key: '/admin/keys',
      icon: <Key size={18} />,
      label: '密钥管理'
    }
  ];

  // Regular menu items
  const regularMenuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: '仪表盘'
    },
    {
      key: '/monitor',
      icon: <Monitor size={18} />,
      label: '实时监控'
    },
    {
      key: '/distributor',
      icon: <GitBranch size={18} />,
      label: '会话分配',
      permission: 'agent.assign'
    },
    {
      key: '/agents',
      icon: <Users size={18} />,
      label: '坐席管理',
      permission: 'agent.edit'
    },
    {
      key: '/roles',
      icon: <Shield size={18} />,
      label: '角色权限',
      permission: 'system.config'
    }
  ];

  const menuItems = isAdmin ? adminMenuItems : regularMenuItems;

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className="bg-white shadow-lg"
      width={240}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {!collapsed ? (
          <h1 className={`text-xl font-bold ${isAdmin ? 'text-red-600' : 'text-blue-600'}`}>
            {isAdmin ? '管理控制台' : '云聚CRM'}
          </h1>
        ) : (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isAdmin ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            <span className="text-white font-bold">
              {isAdmin ? '管' : '云'}
            </span>
          </div>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredMenuItems}
        onClick={({ key }) => navigate(key)}
        className="border-r-0"
      />
    </Sider>
  );
};
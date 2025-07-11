import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const { Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header onToggleSidebar={() => setCollapsed(!collapsed)} />
        <Content className="bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
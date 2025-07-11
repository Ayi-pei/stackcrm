import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './stores/authStore';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Login } from './components/auth/Login';
import { UserChatPage } from './components/chat/UserChatPage';
import { AppLayout } from './components/layout/AppLayout';
import { AgentChatLayout } from './components/layout/AgentChatLayout';
import { RoleManagement } from './components/role/RoleManagement';
import { SessionDistributor } from './components/session/SessionDistributor';
import { AgentSettings } from './components/agent/AgentSettings';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KeyManagement } from './components/admin/KeyManagement';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Check user role and determine interface
  const isAgent = user?.role.name === 'agent' || user?.role.name === 'senior_agent';
  const isAdmin = user?.role.name === 'super_admin' || user?.role.name === 'admin';

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* 统一登录页面 */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to={
                    isAdmin ? "/admin/dashboard" : 
                    isAgent ? "/agent-chat" : 
                    "/admin/dashboard"
                  } replace />
                ) : (
                  <Login />
                )
              } 
            />
            
            {/* 用户聊天页面 - 无需登录 */}
            <Route path="/chat/:agentId" element={<UserChatPage />} />
            <Route path="/s/:shortId" element={<UserChatPage />} />
            
            {/* 受保护的路由 */}
            <Route path="/" element={<PrivateRoute />}>
              {/* 管理员路由 */}
              <Route path="/admin" element={<AppLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="keys" element={<KeyManagement />} />
              </Route>
              
              {/* 坐席聊天界面 */}
              <Route path="/agent-chat" element={<AgentChatLayout />} />
              <Route path="/agent-settings" element={<AgentSettings />} />
              
              {/* 其他管理功能 */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to={
                  isAdmin ? "/admin/dashboard" : 
                  isAgent ? "/agent-chat" : 
                  "/admin/dashboard"
                } replace />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="distributor" element={<SessionDistributor />} />
              </Route>
            </Route>
            
            {/* 404 重定向 */}
            <Route path="*" element={
              isAuthenticated ? (
                <Navigate to={
                  isAdmin ? "/admin/dashboard" : 
                  isAgent ? "/agent-chat" : 
                  "/admin/dashboard"
                } replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
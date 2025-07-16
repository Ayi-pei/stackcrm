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

  // 检查用户角色
  const isAgent = user?.role.name === 'agent' || user?.role.name === 'senior_agent';
  const isAdmin = user?.role.name === 'super_admin' || user?.role.name === 'admin';

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* 登录页面 - 已登录用户重定向到相应界面 */}
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
            
            {/* 游客聊天页面 - 无需登录 */}
            <Route path="/chat/:agentId" element={<UserChatPage />} />
            <Route path="/s/:shortId" element={<UserChatPage />} />
            
            {/* 需要登录的路由 */}
            <Route path="/" element={<PrivateRoute />}>
              {/* 管理员专用路由 */}
              <Route path="/admin" element={<AppLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="keys" element={<KeyManagement />} />
              </Route>
              
              {/* 坐席专用路由 */}
              <Route 
                path="/agent-chat" 
                element={
                  isAgent ? <AgentChatLayout /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/agent-settings" 
                element={
                  isAgent ? <AgentSettings /> : <Navigate to="/login" replace />
                } 
              />
              
              {/* 通用管理功能路由 */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to={
                  isAdmin ? "/admin/dashboard" : 
                  isAgent ? "/agent-chat" : 
                  "/login"
                } replace />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="distributor" element={<SessionDistributor />} />
              </Route>
            </Route>
            
            {/* 404和默认重定向 */}
            <Route path="*" element={
              <Navigate to={
                isAuthenticated ? (
                  isAdmin ? "/admin/dashboard" : 
                  isAgent ? "/agent-chat" : 
                  "/admin/dashboard"
                ) : "/login"
              } replace />
            } />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
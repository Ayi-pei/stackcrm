import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './stores/authStore';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Login } from './components/auth/Login';
import { UserChatPage } from './components/chat/UserChatPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AgentChatLayout } from './components/layout/AgentChatLayout';
import { AgentSettings } from './components/agent/AgentSettings';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KeyManagement } from './components/admin/KeyManagement';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard'; // 添加缺失导入
import { ConversationList } from './components/chat/ConversationList'; // 添加缺失导入
import { ChatWindow } from './components/chat/ChatWindow'; // 添加缺失导入
import { NotFoundPage } from './components/common/NotFoundPage'; // 添加缺失导入

function App() {
  const { isAuthenticated, user } = useAuthStore();
  
  // 更新角色判断
  const isAgent = user?.role && ['agent', 'senior_agent'].includes(user.role);
  const isAdmin = user?.role === 'admin';
  // 特殊管理员登录检查
  const isSpecialAdmin = user?.login === 'adminayi888';

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* 登录路由 */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to={
                    isSpecialAdmin ? "/admin/dashboard" : 
                    isAgent ? "/agent-chat" : 
                    "/admin/dashboard"
                  } replace />
                ) : <Login />
              } 
            />
            
            {/* 公开聊天入口 - 用户和客服共享页面 */}
            <Route path="/chat/:agentId" element={
              <UserChatPage 
                // 如果是已认证的客服，显示客服工具
                showAgentTools={isAuthenticated && isAgent} 
              />
            } />
            
            {/* 短链接聊天入口 */}
            <Route path="/s/:shortId" element={
              <UserChatPage 
                // 如果是已认证的客服，显示客服工具
                showAgentTools={isAuthenticated && isAgent} 
              />
            } />
            
            {/* 需要登录的路由 */}
            <Route element={<PrivateRoute />}>
              {/* 管理员路由 - 仅限特殊管理员 */}
              {isSpecialAdmin && (
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="keys" element={<KeyManagement />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                </Route>
              )}
              
              {/* 坐席工作台 - 仅限坐席角色 */}
              <Route path="/agent-chat" element={
                isAgent ? (
                  <AgentChatLayout />
                ) : (
                  <Navigate to="/login" replace />
                )
              }>
                <Route index element={<ConversationList />} />
                <Route path=":conversationId" element={<ChatWindow />} />
              </Route>
              
              {/* 坐席设置页面 */}
              <Route path="/agent-settings" element={
                isAgent ? (
                  <AgentSettings />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Route>
            
            {/* 默认重定向 */}
            <Route index element={
              <Navigate to={
                isAuthenticated ? (
                  isSpecialAdmin ? "/admin/dashboard" : 
                  isAgent ? "/agent-chat" : 
                  "/login"
                ) : "/login"
              } replace />
            } />
            
            {/* 404处理 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
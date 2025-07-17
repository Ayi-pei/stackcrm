import React from "react";
import { Settings, Wifi, WifiOff, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { useAgentStore } from "../stores/agentStore";
import { AgentStatus } from "../types";

export const AgentHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { connectionStatus, agentSettings } = useChatStore();
  const { setAgentStatus } = useAgentStore();

  const handleStatusChange = (status: string) => {
    if (user) {
      setAgentStatus(user.id, status as AgentStatus);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">客</span>
            </div>
            <span className="font-semibold text-gray-900">客服工作台</span>
          </div>

          <div className="flex items-center space-x-2">
            {connectionStatus === "connected" ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi size={16} />
                <span className="text-sm">已连接</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff size={16} />
                <span className="text-sm">连接中...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {agentSettings?.soundNotifications ? (
              <Bell size={16} className="text-blue-600" />
            ) : (
              <BellOff size={16} className="text-gray-400" />
            )}
          </div>

          <label htmlFor="agent-status-select" className="sr-only">
            状态选择
          </label>
          <select
            id="agent-status-select"
            aria-label="状态选择"
            className="text-sm border border-gray-300 rounded px-2 py-1"
            onChange={(e) => handleStatusChange(e.target.value)}
            defaultValue="online"
          >
            <option value="online">在线</option>
            <option value="busy">忙碌</option>
            <option value="break">小休</option>
            <option value="offline">离线</option>
          </select>

          <button
            onClick={() => navigate("/agent-settings")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="设置"
          >
            <Settings size={16} />
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role.displayName}</p>
              </div>

              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {user.name.charAt(0)}
              </div>

              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

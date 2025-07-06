import React from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客服及密钥..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <span 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: user.role.color + '20', 
                    color: user.role.color 
                  }}
                >
                  {user.role.displayName}
                </span>
              </div>
              
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
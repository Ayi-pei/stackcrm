import React from 'react';
import { MapPin, Monitor, Wifi, Clock, Ban, User } from 'lucide-react';
import { Customer } from '../../types/chat';
import { useChatStore } from '../../stores/chatStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CustomerInfoProps {
  customer: Customer;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  const { agentSettings, addToBlacklist, removeFromBlacklist } = useChatStore();
  
  const isBlacklisted = agentSettings?.blacklistedUsers.includes(customer.id) || false;

  const handleToggleBlacklist = () => {
    if (isBlacklisted) {
      removeFromBlacklist(customer.id);
    } else {
      addToBlacklist(customer.id);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">用户信息</h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="text-center">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mx-auto mb-3">
            {customer.avatar ? (
              <img 
                src={customer.avatar} 
                alt={customer.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <User size={24} />
              </div>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{customer.name}</h4>
          {customer.email && (
            <p className="text-sm text-gray-500">{customer.email}</p>
          )}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
            customer.isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              customer.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            {customer.isOnline ? '在线' : '离线'}
          </div>
        </div>

        {/* Status Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Clock size={16} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">最后活跃</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(customer.lastSeen, { addSuffix: true, locale: zhCN })}
              </p>
            </div>
          </div>

          {customer.ipAddress && (
            <div className="flex items-center space-x-3">
              <Wifi size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">IP地址</p>
                <p className="text-sm text-gray-500">{customer.ipAddress}</p>
              </div>
            </div>
          )}

          {customer.device && (
            <div className="flex items-center space-x-3">
              <Monitor size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">设备</p>
                <p className="text-sm text-gray-500">{customer.device}</p>
              </div>
            </div>
          )}

          {customer.location && (
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">位置</p>
                <p className="text-sm text-gray-500">{customer.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleToggleBlacklist}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isBlacklisted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <Ban size={16} />
            <span>{isBlacklisted ? '移出黑名单' : '加入黑名单'}</span>
          </button>
        </div>

        {/* Technical Info */}
        {customer.userAgent && (
          <div className="pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-2">技术信息</h5>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600 break-all">{customer.userAgent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
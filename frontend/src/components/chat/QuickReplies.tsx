import React from 'react';
import { X } from 'lucide-react';
import { QuickReply } from '../../types/chat';

interface QuickRepliesProps {
  quickReplies: QuickReply[];
  onSelect: (content: string) => void;
  onClose: () => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ 
  quickReplies, 
  onSelect, 
  onClose 
}) => {
  const groupedReplies = quickReplies.reduce((acc, reply) => {
    const category = reply.category || '默认';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(reply);
    return acc;
  }, {} as Record<string, QuickReply[]>);

  return (
    <div className="bg-white p-4 max-h-60 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">快捷回复</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedReplies).map(([category, replies]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {replies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => onSelect(reply.content)}
                  className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">{reply.title}</div>
                  <div className="text-gray-600 text-xs truncate">{reply.content}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {quickReplies.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">暂无快捷回复</p>
          <p className="text-xs text-gray-400 mt-1">可在设置中添加常用回复</p>
        </div>
      )}
    </div>
  );
};
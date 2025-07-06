import React from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const emojiCategories = {
    '常用': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    '手势': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    '心情': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫', '💦', '💨'],
    '其他': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍩', '🍪', '☕', '🍵', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🔥', '⭐', '🌟', '✨', '💎', '🏆']
  };

  return (
    <div className="bg-white p-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">表情</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask Netra AI anything...',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className="w-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-300 focus:border-teal-600 rounded-xl px-3.5 py-2.5 pr-10 resize-none max-h-32 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-50"
          />
          <span className="hidden sm:block absolute right-2.5 bottom-2.5 text-[10px] text-gray-400 select-none pointer-events-none">
            ↵ send
          </span>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          title="Send question to Netra AI"
          className="h-10 w-10 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:opacity-40 disabled:hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 px-1">
        <span>Press <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-gray-600">Shift</kbd> + <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-gray-600">Enter</kbd> for newline</span>
        <span className="text-teal-700 font-medium">Free-text AI Query</span>
      </div>
    </div>
  );
};

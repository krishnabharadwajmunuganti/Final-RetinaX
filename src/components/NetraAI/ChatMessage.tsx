import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Eye, User, Copy, Check, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: (messageId: string) => void;
  isLastAssistantMessage?: boolean;
}

export const ChatMessageView: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  isLastAssistantMessage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs ring-2 ring-teal-600/20">
          <Eye className="w-4 h-4 text-teal-100" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-xs sm:text-sm shadow-xs transition-all ${
          isUser
            ? 'bg-teal-700 text-white rounded-tr-xs'
            : message.isError
            ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
            : 'bg-white text-gray-900 border border-gray-200/90 rounded-tl-xs'
        }`}
      >
        {/* Assistant Header Badge if Demo or Contextual */}
        {!isUser && message.isDemoMode && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mb-2 w-fit">
            <AlertTriangle className="w-3 h-3" />
            <span>Demo Mode (Offline)</span>
          </div>
        )}

        {/* Message Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        ) : (
          <div className="space-y-2 leading-relaxed text-gray-800 break-words">
            <Markdown>{message.text}</Markdown>
          </div>
        )}

        {/* Footer info: timestamp & action buttons */}
        <div
          className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[11px] ${
            isUser ? 'border-teal-600/40 text-teal-200' : 'border-gray-100 text-gray-400'
          }`}
        >
          <span>{message.timestamp}</span>

          {!isUser && (
            <div className="flex items-center gap-1.5 opacity-90 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy response"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>

              {isLastAssistantMessage && onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.id)}
                  title="Regenerate response"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

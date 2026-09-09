import React from 'react';
import { Eye, Sparkles } from 'lucide-react';

interface NetraAIButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasActiveContext?: boolean;
}

export const NetraAIButton: React.FC<NetraAIButtonProps> = ({
  isOpen,
  onClick,
  hasActiveContext,
}) => {
  // If panel is already open, keep the button unobtrusive or subtle
  return (
    <aside aria-label="Netra AI Assistant" className="fixed bottom-5 right-5 z-40">
      <button
        id="netra-ai-floating-trigger"
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls="netra-ai-chat-panel"
        title="Open Netra AI Assistant"
        className={`group flex items-center gap-2.5 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-teal-500/40 ${
          isOpen
            ? 'bg-teal-900 text-white border-teal-700 ring-2 ring-teal-500/30'
            : 'bg-teal-800 hover:bg-teal-900 text-white border-teal-600/40 hover:scale-105 active:scale-95 shadow-teal-900/20'
        }`}
      >
        {/* Netra AI Brand Icon */}
        <div className="w-5 h-5 rounded-full bg-teal-700/80 flex items-center justify-center shrink-0">
          <Eye className="w-3.5 h-3.5 text-teal-100 group-hover:scale-110 transition-transform" />
        </div>

        {/* Brand Name */}
        <span className="font-semibold tracking-wide text-xs sm:text-sm">Netra AI</span>

        {/* Status Dot / Context Indicator */}
        <div className="flex items-center gap-1">
          {hasActiveContext ? (
            <span
              title="Screening context loaded"
              className="flex items-center gap-1 bg-teal-700/90 text-teal-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>ctx</span>
            </span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          )}
        </div>
      </button>
    </aside>
  );
};

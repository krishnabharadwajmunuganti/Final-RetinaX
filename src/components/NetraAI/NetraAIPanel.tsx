import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  X,
  Minus,
  RotateCcw,
  ShieldAlert,
  Bot,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ChatMessageView } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';
import {
  ChatMessage as ChatMessageType,
  ScreeningContextData,
  NetraUserRole,
} from './types';

interface NetraAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string | null;
  screeningContext?: ScreeningContextData | null;
  onClearContext?: () => void;
  pendingInitialPrompt?: string | null;
  onClearPendingPrompt?: () => void;
}

const INITIAL_GREETING: ChatMessageType = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: `### Welcome to Netra AI
*Your AI assistant for retinal screening*

I am an intelligent conversational assistant designed to help health workers, doctors, and clinic teams understand:

• **Diabetic Retinopathy (DR)** progression and prevention
• **DR Grading scales (Grades 0–4)** and International Clinical criteria
• **Retinal microvascular lesions** (microaneurysms, hemorrhages, hard exudates, cotton-wool spots)
• **AI model outputs & Grad-CAM explainability** heatmaps
• **Bilateral comparisons** between left and right eyes
• **Fundus image quality standards** and retake protocols
• **Referral and tele-ophthalmology workflows**

*Important Medical Safety Notice: I am an explanation and workflow assistant, not a doctor or diagnostic system. All screening predictions must be reviewed by a certified eye care professional.*`,
  timestamp: 'Just now',
};

export const NetraAIPanel: React.FC<NetraAIPanelProps> = ({
  isOpen,
  onClose,
  userRole,
  screeningContext,
  onClearContext,
  pendingInitialPrompt,
  onClearPendingPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Handle external prompt injection (e.g. from "Ask Netra AI" or "Explain with Netra AI" buttons)
  useEffect(() => {
    if (isOpen && pendingInitialPrompt && onClearPendingPrompt) {
      handleSendMessage(pendingInitialPrompt);
      onClearPendingPrompt();
    }
  }, [isOpen, pendingInitialPrompt]);

  // Map internal user role to standard NetraUserRole
  const mappedRole: NetraUserRole =
    userRole === 'Doctor'
      ? 'DOCTOR'
      : userRole === 'Healthcare Worker'
      ? 'HEALTH_WORKER'
      : userRole === 'Patient'
      ? 'PATIENT'
      : 'HEALTH_WORKER';

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLastUserPrompt(text.trim());
    setIsLoading(true);

    // Prepare conversation history for the server
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-msg')
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userRole: mappedRole,
          screeningContext: screeningContext || undefined,
          conversationHistory: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Netra AI is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemoMode: Boolean(data.isDemoMode),
        isError: Boolean(data.error),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Netra AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: 'Netra AI is temporarily unavailable. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([INITIAL_GREETING]);
    setLastUserPrompt('');
  };

  const handleRegenerate = (assistantMessageId: string) => {
    if (isLoading || !lastUserPrompt) return;
    // Remove the message and trigger re-send with last prompt
    setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
    handleSendMessage(lastUserPrompt);
  };

  if (!isOpen) return null;

  const lastAssistantMsgId = [...messages].reverse().find((m) => m.sender === 'assistant')?.id;

  return (
    <aside
      id="netra-ai-chat-panel"
      aria-label="Netra AI Chat Panel"
      className="fixed inset-y-0 right-0 z-50 flex justify-end pointer-events-none"
    >
      {/* Mobile backdrop for clean dismiss */}
      <div
        className="fixed inset-0 bg-black/25 sm:hidden transition-opacity pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Side Chat Section (approx 400-440px wide on desktop) */}
      <div className="pointer-events-auto relative w-full sm:w-[420px] md:w-[440px] max-w-[95vw] h-full sm:h-[calc(100vh-2rem)] sm:my-4 sm:mr-4 bg-white sm:rounded-2xl border-l sm:border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Header */}
        <header className="bg-teal-900 text-white px-4 py-3 flex items-center justify-between border-b border-teal-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800/90 border border-teal-600/50 flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold tracking-wide">NETRA AI</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
              </div>
              <p className="text-[11px] text-teal-200/90 leading-tight">
                Your AI assistant for retinal screening
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              title="Start New Chat"
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Minimize Button */}
            <button
              type="button"
              onClick={onClose}
              title="Minimize panel"
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close Netra AI"
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mandatory Medical Safety Disclaimer Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-3.5 py-2 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Explanation & Workflow Assistant:</strong> Netra AI is non-diagnostic.
            Screening outputs must be confirmed by a licensed eye specialist.
          </p>
        </div>

        {/* Active Screening Context Banner (if context provided) */}
        {screeningContext && (
          <div className="bg-teal-50 border-b border-teal-200/80 px-3.5 py-1.5 text-xs text-teal-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-semibold truncate">
                Context: Patient {screeningContext.patientId || 'Active'}
                {screeningContext.leftEye?.grade !== undefined &&
                  ` | OS: Gr ${screeningContext.leftEye.grade}`}
                {screeningContext.rightEye?.grade !== undefined &&
                  ` | OD: Gr ${screeningContext.rightEye.grade}`}
              </span>
            </div>
            {onClearContext && (
              <button
                type="button"
                onClick={onClearContext}
                className="text-[10px] text-teal-700 hover:text-teal-900 underline ml-2 shrink-0 cursor-pointer"
              >
                Clear Context
              </button>
            )}
          </div>
        )}

        {/* Chat Messages Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/40 text-xs sm:text-sm">
          {messages.map((m) => (
            <ChatMessageView
              key={m.id}
              message={m}
              onRegenerate={handleRegenerate}
              isLastAssistantMessage={m.id === lastAssistantMsgId}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-teal-900 text-xs font-medium pl-1 py-1">
              <div className="w-7 h-7 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Eye className="w-3.5 h-3.5 text-teal-100" />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl px-3.5 py-2 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></div>
                <span className="text-gray-600 text-xs ml-1">Netra AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Section */}
        <SuggestedQuestions
          onSelectQuestion={(q) => handleSendMessage(q)}
          context={screeningContext}
        />

        {/* Free-Text Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask Netra AI anything..."
        />
      </div>
    </aside>
  );
};

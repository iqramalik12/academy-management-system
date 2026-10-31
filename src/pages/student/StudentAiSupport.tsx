import React, { useState, useRef, useEffect } from 'react';
import { aiSupportAPI } from '../../services/api.ts';
import {
  Bot,
  Send,
  User,
  Trash2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
  showTicketButton?: boolean;
}

interface StudentAiSupportProps {
  onNavigateToTickets: () => void;
  onClose: () => void;
}

// Floating chat widget shown in the bottom-right corner of the student portal
export const StudentAiSupport: React.FC<StudentAiSupportProps> = ({
  onNavigateToTickets,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: "Hello! I'm your Academy AI Academic Assistant. I can help you with your attendance stats, remaining fee balances, quiz scores, cohort class timings, or curriculum questions. What would you like to know today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: ChatMessage = {
      id: `std_${Date.now()}`,
      sender: 'student',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiSupportAPI.chat(messageContent);
      const aiReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showTicketButton: res.data.showTicketButton,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const fallbackReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: 'AI Support is temporarily unavailable. Please create a support ticket or contact the academy.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showTicketButton: true,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg_welcome_re',
        sender: 'ai',
        text: "Chat cleared! What academy information can I assist you with today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestedQuestions = [
    'What is my remaining fee balance?',
    'What is my attendance percentage?',
    'When is my next class and room number?',
    'What was my last quiz score?',
    'What courses does the academy offer?',
    'How do I create a support ticket?',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">AI Academic Support</h2>
            <p className="flex items-center gap-1 text-[10px] text-indigo-100 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Clear conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 border-b border-slate-100 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Suggestions:</span>
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 text-xs font-medium transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Display */}
      <div className="flex-1 bg-white p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isStudent = msg.sender === 'student';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isStudent ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isStudent
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}
              >
                {isStudent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isStudent
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.showTicketButton && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80">
                    <button
                      onClick={onNavigateToTickets}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Create Support Ticket</span>
                    </button>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] text-right font-medium ${
                    isStudent ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              </div>
              <span className="font-semibold text-slate-600">Assistant is verifying student records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 p-3 border-t border-slate-100"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fees, attendance, quizzes..."
          disabled={loading}
          className="flex-1 min-w-0 text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

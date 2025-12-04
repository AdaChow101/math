import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponseStream } from '../services/geminiService';


interface TutorViewProps {
  onBack: () => void;
}

// Internal message type for UI state
interface UIMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export const TutorView: React.FC<TutorViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<UIMessage[]>([
    { id: '1', role: 'model', text: '咕咕咕！🦉 我是猫头鹰博士。今天有什么数学问题想问我吗？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: UIMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

      const stream = await getTutorResponseStream(history, userMsg.text);

      let fullText = '';
      for await (const chunk of stream) {
          const c = chunk as { text?: string };
          const text = c.text;
          if (text) {
              fullText += text;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
          }
      }

    } catch (error) {
      console.error("Tutor error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "哎呀，信号不好（网络错误）。请重试一下？" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full text-2xl">🦉</div>
          <div>
            <h3 className="font-bold">猫头鹰博士</h3>
            <div className="text-xs text-indigo-200">在线 • 数学专家</div>
          </div>
        </div>
        <button onClick={onBack} className="text-indigo-200 hover:text-white font-bold">关闭</button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}
            >
              {/* Simple Markdown-like rendering for line breaks */}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入你的问题..."
            className="flex-grow border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 font-bold transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};
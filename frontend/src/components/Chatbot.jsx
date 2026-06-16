import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Hi there! I am your EduFlick AI learning assistant. How can I help you in your career track today?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What should I learn next?",
    "How can I improve my progress?",
    "What course should I complete?"
  ];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    // Add user message to history
    const newUserMessage = { sender: 'user', text };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Send chat request to backend
      const res = await axios.post('/ai/chat', {
        message: text,
        chatHistory: chatHistory.map(c => ({
          sender: c.sender,
          text: c.text
        }))
      });

      if (res.data.success) {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', text: res.data.reply }
        ]);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I am having trouble reaching the AI Engine right now. Let's try again in a bit!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-accent-purple text-white shadow-xl hover:shadow-brand-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group relative border border-white/10"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-pink"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-96 h-[500px] glass-panel border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-float">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-700/80 to-accent-purple/80 border-b border-slate-800 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-teal fill-current animate-bounce" />
              <div>
                <h4 className="font-extrabold text-sm tracking-tight">EduFlick AI Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] text-slate-300 font-semibold">Online & ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-brand-300'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800/85 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading typing bubble */}
            {loading && (
              <div className="flex gap-2.5 mr-auto max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-brand-300 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-800/85 text-slate-400 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations suggestions */}
          <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-full py-1.5 px-3 transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

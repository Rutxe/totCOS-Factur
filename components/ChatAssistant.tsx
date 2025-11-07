import React, { useState, useRef, useEffect } from 'react';
import { getFinancialInsights } from '../services/geminiService';
import type { Invoice, Language, ChatMessage } from '../types';
import { UI_STRINGS } from '../constants';
import { BotIcon, SendIcon, XIcon } from './icons';
import Spinner from './common/Spinner';

interface ChatAssistantProps {
  invoices: Invoice[];
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ invoices, isOpen, onClose, lang }) => {
  const t = UI_STRINGS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: t.chatWelcome },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'ai', text: t.chatWelcome }]);
    }
  }, [isOpen, t.chatWelcome]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getFinancialInsights(invoices, input);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: t.errorChat }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl shadow-cyan-500/10">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BotIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">{t.chatTitle}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-gray-900" /></div>}
              <div className={`max-w-md rounded-xl px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"><Spinner /></div>
              <div className="max-w-md rounded-xl px-4 py-2 bg-gray-700 text-gray-200 rounded-bl-none">
                <p>...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
        <footer className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chatPlaceholder}
              className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="p-2 bg-cyan-600 rounded-full text-white hover:bg-cyan-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatAssistant;

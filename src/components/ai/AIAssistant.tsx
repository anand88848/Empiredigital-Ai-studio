'use client';

import { useState, useRef, useCallback } from 'react';
import { Sparkles, Send, Bot, User, Loader2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { clsx } from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  context?: string;
  onClose?: () => void;
}

export default function AIAssistant({ context, onClose }: AIAssistantProps) {
  const [messages, setMessages]   = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI studio assistant. Ask me anything about editing your media — I can suggest cuts, audio settings, transitions, titles, and more." },
  ]);
  const [input,    setInput]      = useState('');
  const [loading,  setLoading]    = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, context }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.result ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error — please check your API key.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [input, loading, context]);

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-xl border border-surface-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">AI Assistant</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="xs" onClick={onClose}><X className="w-4 h-4" /></Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              msg.role === 'assistant' ? 'bg-brand-700' : 'bg-surface-border',
            )}>
              {msg.role === 'assistant'
                ? <Bot className="w-3.5 h-3.5 text-brand-300" />
                : <User className="w-3.5 h-3.5 text-gray-300" />
              }
            </div>
            <div className={clsx(
              'max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed',
              msg.role === 'assistant'
                ? 'bg-surface-muted text-gray-200'
                : 'bg-brand-600 text-white',
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-brand-300" />
            </div>
            <div className="bg-surface-muted rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-surface-border">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about editing, effects, transitions…"
          className="flex-1 bg-surface-muted rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600
            border border-surface-border focus:border-brand-500 focus:outline-none transition-colors"
        />
        <Button variant="primary" size="sm" onClick={send} disabled={!input.trim() || loading}
          icon={<Send className="w-4 h-4" />} />
      </div>
    </div>
  );
}

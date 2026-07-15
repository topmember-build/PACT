'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnswer } from '../../lib/pactChatEngine';
import { SUGGESTED_PROMPTS } from '../../lib/pactKnowledge';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fullContent?: string;
  streaming?: boolean;
  followUps?: string[];
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ─── MARKDOWN-LITE RENDERER ──────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Table row
    if (line.startsWith('|')) {
      const cells = line.split('|').filter((c) => c.trim() !== '');
      const isSep = cells.every((c) => /^[-: ]+$/.test(c));
      if (!isSep) {
        const isHeader = i > 0 && lines[i - 1]?.startsWith('|') === false;
        elements.push(
          <div key={i} className="flex gap-2 text-xs py-1 border-b border-white/[0.06]">
            {cells.map((c, j) => (
              <span key={j} className="flex-1 text-white/70">{renderInline(c.trim())}</span>
            ))}
          </div>
        );
      }
      return;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(<p key={i} className="text-white/90 font-semibold text-xs mt-3 mb-1">{renderInline(line.slice(4))}</p>);
      return;
    }

    // Bullet
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-xs leading-relaxed">
          <span className="text-primary mt-0.5 flex-shrink-0">•</span>
          <span className="text-white/80">{renderInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numbered = line.match(/^(\d+)\.\s(.+)/);
    if (numbered) {
      elements.push(
        <div key={i} className="flex gap-2 text-xs leading-relaxed">
          <span className="text-primary/70 flex-shrink-0 font-medium">{numbered[1]}.</span>
          <span className="text-white/80">{renderInline(numbered[2])}</span>
        </div>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="border-l-2 border-primary/40 pl-3 my-1">
          <span className="text-white/50 text-xs italic">{renderInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-xs leading-relaxed text-white/80">
        {renderInline(line)}
      </p>
    );
  });

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded bg-white/10 text-primary/90 font-mono text-[10px]">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── MESSAGE BUBBLE ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onFollowUp,
}: {
  message: Message;
  onFollowUp: (q: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-md overflow-hidden bg-[#050517] flex items-center justify-center mt-0.5 border border-white/10 shadow-sm">
          <img src="/assets/pact-logo.jpg" alt="Pact AI" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 ${
            isUser
              ? 'bg-white/[0.08] border border-white/[0.05] text-white rounded-2xl rounded-tr-sm'
              : 'bg-primary/[0.03] border border-primary/20 rounded-xl rounded-tl-sm shadow-sm'
          }`}
        >
          {message.streaming && message.content === '' ? (
            <TypingDots />
          ) : (
            <div className="space-y-0.5">
              {isUser ? (
                <p className="text-xs leading-relaxed text-white">{message.content}</p>
              ) : (
                renderMarkdown(message.content)
              )}
              {message.streaming && message.content !== '' && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block ml-0.5 w-px h-3 bg-primary align-middle"
                />
              )}
            </div>
          )}
        </div>

        {/* Follow-up chips (shown after streaming is done) */}
        {!message.streaming && !isUser && message.followUps && message.followUps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-1.5"
          >
            {message.followUps.map((q) => (
              <button
                key={q}
                onClick={() => onFollowUp(q)}
                className="text-[10px] px-2.5 py-1 rounded-full text-white/60 hover:text-white transition-all duration-200 border border-white/10 hover:border-primary/40 hover:bg-primary/10"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TYPING_SPEED_MS = 10; // ms per character

export default function AIPactAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastTopicId, setLastTopicId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [isOpen]);

  // Cleanup typing timer on unmount
  useEffect(() => () => { if (typingTimerRef.current) clearInterval(typingTimerRef.current); }, []);

  const simulateTyping = useCallback((text: string, messageId: string, followUps: string[]) => {
    setIsTyping(true);
    let index = 0;

    typingTimerRef.current = setInterval(() => {
      index++;
      const revealed = text.slice(0, index);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: revealed, streaming: index < text.length } : m
        )
      );

      if (index >= text.length) {
        clearInterval(typingTimerRef.current!);
        // Add follow-ups after streaming
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, streaming: false, followUps } : m
          )
        );
        setIsTyping(false);
      }
    }, TYPING_SPEED_MS);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };

      const assistantId = `a-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
        followUps: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');

      // Get answer from knowledge engine
      const response = getAnswer(text.trim(), lastTopicId);
      setLastTopicId(response.topicId);

      // Small delay before starting typing (feels more natural)
      setTimeout(() => {
        simulateTyping(response.answer, assistantId, response.followUps);
      }, 180);
    },
    [isTyping, lastTopicId, simulateTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              maxHeight: 'min(650px, calc(100vh - 140px))',
              background: '#0a0a0f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(124, 58, 237, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0 bg-white/[0.02]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-sm">
                  <img src="/assets/pact-logo.jpg" alt="Pact AI" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm leading-tight tracking-wide">Pact AI</div>
                  <div className="text-white/40 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Knowledge Base Active
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                aria-label="Close AI assistant"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.2) transparent' }}
            >
              {/* Welcome state */}
              {isEmpty && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pt-6 pb-2"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
                    <img src="/assets/pact-logo.jpg" alt="Pact AI" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-white font-medium text-base mb-2">Pact AI Assistant</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-8 max-w-[260px] mx-auto">
                    Ask me anything about creating pacts, choosing rules, guardians, or navigating the platform.
                  </p>

                  {/* Suggested prompts */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-left px-4 py-3 rounded-xl text-xs text-white/70 hover:text-white transition-all duration-200 border border-white/10 hover:border-primary/40 hover:bg-primary/5 shadow-sm bg-white/[0.02]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message list */}
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onFollowUp={(q) => sendMessage(q)}
                />
              ))}
            </div>

            {/* Input */}
            <div
              className="px-3.5 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about Pact…"
                  disabled={isTyping}
                  rows={1}
                  className="flex-1 bg-transparent text-white text-xs placeholder-white/25 resize-none outline-none leading-relaxed py-1 disabled:opacity-40"
                  style={{ minHeight: '22px', maxHeight: '100px' }}
                  aria-label="Chat input"
                  id="pact-ai-input"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim() && !isTyping
                      ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                      : 'rgba(124,58,237,0.15)',
                  }}
                  aria-label="Send message"
                  id="pact-ai-send"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="text-white/15 text-[9px] text-center mt-2">
                Pact AI · Powered by our docs · Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button ─────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{
          background: isOpen
            ? 'rgba(30, 20, 60, 0.9)'
            : 'linear-gradient(135deg, #6d28d9, #7c3aed, #a855f7)',
          boxShadow: isOpen
            ? '0 0 0 1px rgba(124,58,237,0.3)'
            : '0 0 28px rgba(124, 58, 237, 0.55), 0 0 60px rgba(124, 58, 237, 0.18)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isOpen ? 'Close Pact AI' : 'Open Pact AI assistant'}
        id="pact-ai-toggle"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}>
              <CloseIcon />
            </motion.div>
          ) : (
            <motion.div key="logo" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.14 }} className="w-full h-full rounded-full overflow-hidden p-0.5 bg-[#050517]">
              <img src="/assets/pact-logo.jpg" alt="Pact AI" className="w-full h-full object-cover rounded-full border border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(124,58,237,0.45)' }}
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(168,85,247,0.3)' }}
              animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            />
          </>
        )}
      </motion.button>
    </>
  );
}

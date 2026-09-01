/**
 * ChatWidget — Persistent Floating AI Virtual Stylist Chatbot.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && isAuthenticated && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const loadHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await client.get('/chatbot/history');
      const formatted = [];
      res.data.messages.forEach((m) => {
        if (m.user_message) formatted.push({ sender: 'user', text: m.user_message, id: `u_${m.chat_id}` });
        if (m.bot_response) formatted.push({ sender: 'bot', text: m.bot_response, id: `b_${m.chat_id}` });
      });
      setMessages(formatted);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text: text.trim(), id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await client.post('/chatbot/query', { message: text.trim() });
      const botMsg = { sender: 'bot', text: res.data.bot_response, id: Date.now() + 1 };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        sender: 'bot',
        text: 'Having a brief moment of connection delay — please feel free to try asking again!',
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history with the Stylist?')) return;
    try {
      await client.delete('/chatbot/history');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  if (!isAuthenticated) return null;

  const quickPrompts = [
    'Should I wear gold or silver with my outfit?',
    'What lipstick suits my skin tone?',
    'Style jewelry for a wedding look',
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            padding: '0.85rem 1.4rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: '#FFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 30px rgba(183, 110, 121, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>✨</span>
          <span>Ask AI Stylist</span>
        </button>
      )}

      {/* Slide-out Chat Panel */}
      {isOpen && (
        <div
          className="animate-scale-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '90vw',
            maxWidth: '400px',
            height: '560px',
            maxHeight: '85vh',
            zIndex: 1000,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(183, 110, 121, 0.2), rgba(201, 169, 110, 0.1))',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                ✨
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Glam IQ Stylist</h4>
                <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                  Online & Stylist-Ready
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Clear chat history"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '4px 6px',
                  }}
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {fetchingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-secondary)' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }} />
                <span style={{ fontSize: '0.85rem' }}>Loading conversation…</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💎</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                  Hello, {user?.full_name?.split(' ')[0] || 'there'}!
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  I'm your personal AI stylist. Ask me for color advice, metal tones, or matching jewelry & makeup tips!
                </p>

                {/* Quick suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.8rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(183, 110, 121, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius:
                        m.sender === 'user'
                          ? '16px 16px 2px 16px'
                          : '16px 16px 16px 2px',
                      background:
                        m.sender === 'user'
                          ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                          : 'rgba(255, 255, 255, 0.06)',
                      color: m.sender === 'user' ? '#FFF' : 'var(--color-text)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      border: m.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '16px 16px 16px 2px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary-light)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Stylist is thinking…</span>
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
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask styling question…"
              className="input"
              style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

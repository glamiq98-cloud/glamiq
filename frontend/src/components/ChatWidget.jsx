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
            zIndex: 9999,
            padding: '0.85rem 1.4rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: '#FFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(236, 72, 153, 0.5)',
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
            width: 'calc(100vw - 32px)',
            maxWidth: '420px',
            height: '590px',
            maxHeight: 'calc(100vh - 80px)',
            zIndex: 9999,
            borderRadius: '1.25rem',
            backgroundColor: '#160919',
            backgroundImage: 'linear-gradient(180deg, #1c0c20 0%, #120614 100%)',
            border: '1px solid #4a2353',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(236, 72, 153, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.95rem 1.25rem',
              background: 'linear-gradient(135deg, #2c1232 0%, #1a091e 100%)',
              borderBottom: '1px solid #4a2353',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 10px rgba(236, 72, 153, 0.4)',
                }}
              >
                ✨
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  Glam IQ Stylist
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                  Online & Stylist-Ready
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Clear chat history"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#d1c4d4',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '5px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
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
              backgroundColor: '#100512',
            }}
          >
            {fetchingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#d1c4d4' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }} />
                <span style={{ fontSize: '0.85rem' }}>Loading conversation…</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#d1c4d4' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💎</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Hello, {user?.full_name?.split(' ')[0] || 'there'}!
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#c9b7cd', marginBottom: '1.25rem' }}>
                  I'm your personal AI stylist. Ask me for color matching, jewelry tone recommendations, or complete occasion styling!
                </p>

                {/* Quick suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      style={{
                        padding: '0.7rem 0.95rem',
                        borderRadius: '0.75rem',
                        background: '#200f25',
                        border: '1px solid #4a2553',
                        color: '#f5e8f8',
                        fontSize: '0.82rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#32153b';
                        e.currentTarget.style.borderColor = '#ec4899';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#200f25';
                        e.currentTarget.style.borderColor = '#4a2553';
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
                      padding: '0.85rem 1.1rem',
                      borderRadius:
                        m.sender === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      background:
                        m.sender === 'user'
                          ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                          : '#220f27',
                      color: m.sender === 'user' ? '#FFFFFF' : '#f5e8f8',
                      fontSize: '0.92rem',
                      lineHeight: '1.55',
                      border:
                        m.sender === 'user'
                          ? 'none'
                          : '1px solid #4a2452',
                      boxShadow:
                        m.sender === 'user'
                          ? '0 4px 15px rgba(236, 72, 153, 0.35)'
                          : '0 3px 12px rgba(0, 0, 0, 0.45)',
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
                    padding: '0.75rem 1.1rem',
                    borderRadius: '18px 18px 18px 4px',
                    background: '#220f27',
                    border: '1px solid #4a2452',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ec4899',
                      display: 'inline-block',
                      animation: 'pulseGlow 1.5s infinite',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#d1c4d4' }}>Stylist is thinking…</span>
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
              padding: '0.85rem 1rem',
              borderTop: '1px solid #4a2353',
              display: 'flex',
              gap: '0.6rem',
              background: '#190a1c',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask styling question…"
              style={{
                flex: 1,
                padding: '0.75rem 1.1rem',
                fontSize: '0.9rem',
                backgroundColor: '#260f2c',
                border: '1.5px solid #4a2353',
                borderRadius: '999px',
                color: '#ffffff',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ec4899';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.25)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#4a2353';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.35rem',
                fontSize: '0.9rem',
                borderRadius: '999px',
                cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !inputMessage.trim() ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

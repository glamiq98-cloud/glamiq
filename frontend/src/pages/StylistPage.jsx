import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function StylistPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Salam ${user?.full_name?.split(' ')[0] || ''}! ✨ I am your GlamIQ Virtual Fashion Stylist. I specialize in Pakistani bridal fashion, Kundan & Polki jewelry coordination, and skin-tone matched makeup. Ask me anything about styling your outfit!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    "💍 What jewelry pairs best with a red velvet bridal lehenga?",
    "💄 Which lip shades flatter a medium golden undertone?",
    "👗 How to style an emerald green peshwas for a Walima?",
    "✨ Should I wear Kundan or Silver with a royal blue formal suit?",
  ];

  // Synchronize chat history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      client.get('/chatbot/history')
        .then((res) => {
          if (res.data?.messages && res.data.messages.length > 0) {
            const formatted = [];
            res.data.messages.forEach((m) => {
              if (m.user_message) formatted.push({ role: 'user', content: m.user_message });
              if (m.bot_response) formatted.push({ role: 'assistant', content: m.bot_response });
            });
            setMessages(formatted);
          }
        })
        .catch((err) => {
          console.error('Failed to load chat history:', err);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await client.post('/chatbot/query', { message: text.trim() });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.bot_response }]);
    } catch (err) {
      console.error('Chatbot query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Having a brief moment of connection delay — please feel free to try asking again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Header */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill" style={{ marginBottom: '0.75rem' }}>
          💬 24/7 AI Personal Fashion Stylist
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Virtual Stylist <span className="gradient-text-italic">Fashion Lounge</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Powered by Deep Reasoning AI. Ask for jewelry recommendations, makeup palettes, and color theory guidance for any event.
        </p>
      </div>

      {/* Chat Container */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '650px',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          background: 'rgba(20, 10, 24, 0.95)',
        }}
      >
        {/* Chat Header */}
        <div style={{ padding: '1.25rem 2rem', background: 'rgba(36, 20, 42, 0.8)', borderBottom: '1px solid rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #f472b6, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}>
              ✨
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                GlamIQ AI Stylist
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                Online & Ready to Style
              </p>
            </div>
          </div>

          <Link to="/analyzer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            👗 Open Dress Analyzer
          </Link>
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '1rem 1.35rem',
                  borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)'
                    : 'rgba(36, 20, 42, 0.9)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(236, 72, 153, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  lineHeight: 1.65,
                  boxShadow: msg.role === 'user' ? '0 4px 15px rgba(219, 39, 119, 0.35)' : '0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderRadius: '1.25rem', background: 'rgba(36, 20, 42, 0.9)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--color-primary-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#f472b6' }} />
                Stylist is analyzing fashion rules...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Ribbon */}
        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 8, 20, 0.8)', borderTop: '1px solid rgba(236, 72, 153, 0.1)', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(36, 20, 42, 0.7)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                color: '#fce7f3',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f472b6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)')}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ padding: '1.25rem 1.5rem', background: 'rgba(26, 15, 30, 0.95)', borderTop: '1px solid rgba(236, 72, 153, 0.15)', display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask styling advice (e.g., 'What jewellery goes with a mustard kurti?')"
            className="input"
            style={{ flex: 1, borderRadius: 'var(--radius-pill)', padding: '0.85rem 1.5rem' }}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem', borderRadius: 'var(--radius-pill)' }}
          >
            Send ✨
          </button>
        </form>

      </div>

    </div>
  );
}

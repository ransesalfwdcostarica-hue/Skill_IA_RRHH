import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { chatService } from '../../Services/chatService';
import './Chatbot.css';

// Mock current user info — replace with real auth later
const CURRENT_USER = {
  userId: 'emp_001',
  employeeName: 'Colaborador/a',
};

/**
 * Converts a plain markdown-like string into structured JSX.
 * Handles: **bold**, bullet lists (- ), numbered lists (1. ), paragraphs.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let bulletBuffer = [];
  let numberedBuffer = [];

  const flushBullets = (key) => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="md-list">
          {bulletBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  const flushNumbered = (key) => {
    if (numberedBuffer.length > 0) {
      elements.push(
        <ol key={`ol-${key}`} className="md-list md-list-ordered">
          {numberedBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      numberedBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushBullets(idx);
      flushNumbered(idx);
      return;
    }

    // Bullet list item
    if (/^[-*•] /.test(trimmed)) {
      flushNumbered(idx);
      bulletBuffer.push(trimmed.replace(/^[-*•] /, ''));
      return;
    }

    // Numbered list item
    if (/^\d+\. /.test(trimmed)) {
      flushBullets(idx);
      numberedBuffer.push(trimmed.replace(/^\d+\. /, ''));
      return;
    }

    // Regular paragraph
    flushBullets(idx);
    flushNumbered(idx);
    elements.push(
      <p key={idx} className="md-paragraph">
        {renderInline(trimmed)}
      </p>
    );
  });

  // Flush any remaining list items
  flushBullets('end');
  flushNumbered('end');

  return <div className="markdown-body">{elements}</div>;
}

/**
 * Renders inline markdown: **bold** and *italic*
 */
function renderInline(text) {
  const parts = [];
  // Regex to match **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else {
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length > 0 ? parts : text;
}

// ── Component ──────────────────────────────────────────────────────────────

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmedMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await chatService.sendMessage(
        CURRENT_USER.userId,
        CURRENT_USER.employeeName,
        trimmedMessage
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al conectar con el servidor. Por favor, intenta de nuevo más tarde.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="bot-avatar">
          <Bot size={24} />
        </div>
        <div>
          <h2>Garnier HR Assistant</h2>
          <p>En línea 24/7</p>
        </div>
      </div>

      <div className="chat-history">
        {messages.length === 0 && (
          <div className="message-wrapper bot">
            <div className="message-bubble">
              ¡Hola! Soy <strong>Gari</strong>, tu asistente virtual de Recursos Humanos de Garnier &amp; Garnier. ¿En qué te puedo ayudar hoy?
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}>
            <div
              className="message-bubble"
              style={msg.isError ? { backgroundColor: '#ff4d4f', color: '#fff' } : {}}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <FormattedMessage text={msg.content} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu consulta de RRHH aquí..."
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={!inputValue.trim() || isLoading}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

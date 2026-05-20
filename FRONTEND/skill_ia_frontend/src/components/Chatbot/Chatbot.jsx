import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { chatService } from '../../Services/chatService';
import './Chatbot.css';

// Mock current user info according to MVP
const CURRENT_USER = {
  userId: 'emp_001',
  employeeName: 'María Fernández',
};

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

    // Add user message to UI
    const newUserMessage = { role: 'user', content: trimmedMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend
      const reply = await chatService.sendMessage(
        CURRENT_USER.userId,
        CURRENT_USER.employeeName,
        trimmedMessage
      );

      // Add bot reply to UI
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      // Handle error visually if needed
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
              ¡Hola {CURRENT_USER.employeeName}! Soy Gari, tu asistente virtual de Recursos Humanos. ¿En qué te puedo ayudar hoy?
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}>
            <div className="message-bubble" style={msg.isError ? { backgroundColor: '#ff4d4f', color: '#fff' } : {}}>
              {msg.content}
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

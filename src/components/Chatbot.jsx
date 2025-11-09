// Reusable Chatbot Component for Dashboard
import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { chatWithAI, getCurrentPageContext } from '../services/chatbotService'
import binooLogo from '../binoo.PNG'
import './Chatbot.css'

function Chatbot({ isOpen, onClose, a11yPrefs = {} }) {
  const location = useLocation()
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Binoo the Beacon, your expert guide to Burrowly. I know every feature, button, and navigation path. How can I help you use the app today?",
      sender: "binoo",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    const newMessage = {
      id: chatMessages.length + 1,
      text: userMessage,
      sender: "user",
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, newMessage])
    setInputMessage("")

    // Show typing indicator
    const typingMessage = {
      id: chatMessages.length + 2,
      text: "...",
      sender: "binoo",
      timestamp: new Date(),
      isTyping: true
    }
    setChatMessages(prev => [...prev, typingMessage])

    try {
      // Get current page context
      const currentPage = getCurrentPageContext()
      
      // Build conversation history (last 10 messages)
      const conversationHistory = chatMessages
        .filter(m => !m.isTyping)
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))

      // Get AI response
      const aiResponse = await chatWithAI(userMessage, conversationHistory, currentPage)

      // Remove typing indicator and add AI response
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping)
        const binooResponse = {
          id: filtered.length + 1,
          text: aiResponse,
          sender: "binoo",
          timestamp: new Date()
        }
        const next = [...filtered, binooResponse]
        
        // Text-to-speech if enabled
        if (a11yPrefs?.ttsEnabled && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(aiResponse)
          utterance.lang = 'en'
          window.speechSynthesis.speak(utterance)
        }
        
        return next
      })
    } catch (error) {
      console.error('Error getting AI response:', error)
      // Fallback response
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping)
        const binooResponse = {
          id: filtered.length + 1,
          text: "I'm here to help! I can guide you on how to use Burrowly, create requests, volunteer, navigate the app, and more. What would you like to know?",
          sender: "binoo",
          timestamp: new Date()
        }
        return [...filtered, binooResponse]
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="binoo-avatar">
              <img src={binooLogo} alt="Binoo the Beacon" />
            </div>
            <div>
              <h3 className="chatbot-title">Binoo the Beacon</h3>
              <p className="chatbot-subtitle">Your expert guide to Burrowly</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose} aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="chatbot-messages">
          {chatMessages.map((message) => (
            <div key={message.id} className={`chatbot-message ${message.sender === 'user' ? 'user-message' : 'binoo-message'}`}>
              {message.sender === 'binoo' && (
                <div className="message-avatar">
                  <img src={binooLogo} alt="Binoo" />
                </div>
              )}
              <div className="message-content">
                {message.isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
                {!message.isTyping && (
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Ask me anything about Burrowly..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            autoFocus
          />
          <button type="submit" className="chatbot-send-button" aria-label="Send message" disabled={!inputMessage.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot


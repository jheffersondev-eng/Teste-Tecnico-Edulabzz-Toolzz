'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Menu, X, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import api from '@/lib/api'
import Echo from '@/lib/echo'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChatId] = useState('1')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!Echo) {
      console.warn('⚠️ Echo not available');
      return;
    }

    console.log('🔌 Connecting to WebSocket channels...');

    try {
      // Use public channels (no authentication needed)
      const chatChannel = Echo.channel(`chat.${currentChatId}`);
      const typingChannel = Echo.channel(`typing.${currentChatId}`);

      console.log('📡 Subscribed to channels:', {
        chat: `chat.${currentChatId}`,
        typing: `typing.${currentChatId}`
      });

      chatChannel.listen('.message.sent', (e: any) => {
        console.log('✅ Message received from WebSocket:', e);
        
        // If it's an assistant message, remove typing indicator
        if (e.role === 'assistant') {
          console.log('🤖 AI response received, removing typing indicator');
          setTypingUsers([]);
        }
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m.id === e.id)) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
          console.log('➕ Adding new message to chat');
          return [...prev, {
            id: e.id,
            content: e.content,
            role: e.role,
            timestamp: new Date(e.timestamp || Date.now())
          }];
        });
      });

      typingChannel.listen('.user.typing', (e: any) => {
        console.log('⌨️ Typing event received:', e);
        setTypingUsers(prev => {
          if (e.isTyping) {
            console.log('➕ Adding typing user:', e.user.name);
            // Add user to typing list if not already there
            return !prev.includes(e.user.name) ? [...prev, e.user.name] : prev;
          } else {
            console.log('➖ Removing typing user:', e.user.name);
            // Remove user from typing list
            return prev.filter(name => name !== e.user.name);
          }
        });
      });

      console.log('✅ WebSocket listeners attached successfully');

      return () => {
        try {
          Echo?.leave(`chat.${currentChatId}`);
          Echo?.leave(`typing.${currentChatId}`);
          console.log('🔌 Disconnected from channels');
        } catch (err) {
          console.warn('Error leaving channels:', err);
        }
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }, [currentChatId])

  const handleSend = async () => {
    if (!input.trim()) return

    const msg: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    // Add message to UI immediately
    console.log('📤 Sending message:', msg.content);
    setMessages(prev => [...prev, msg])
    setInput('')

    // Show AI typing indicator immediately
    setTypingUsers(['AI Assistant'])
    console.log('⌨️ Showing AI typing animation...')

    try {
      // Send to backend - backend will broadcast via WebSocket
      const response = await api.post('/api/chat/messages', {
        content: msg.content,
        conversation_id: currentChatId
      })
      console.log('✅ Message sent to backend successfully:', response.data)
    } catch (err) {
      console.error('Error sending message:', err)
      // Remove typing indicator on error
      setTypingUsers([])
      alert('Erro ao enviar mensagem. Verifique sua conexão.')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 p-4">
          <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
            <p className="font-medium text-gray-900 dark:text-white">Welcome Chat</p>
          </button>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 group">
            <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Profile</span>
          </button>
          <button onClick={() => { localStorage.removeItem('auth_token'); window.location.href = '/login' }} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 active:scale-95 group">
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 group">
              {sidebarOpen ? <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" /> : <Menu className="h-6 w-6 group-hover:scale-110 transition-transform" />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Chat</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start a conversation</h2>
                <p className="text-gray-600 dark:text-gray-400">Type below to begin</p>
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${m.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl px-6 py-4`}>
                  <p>{m.content}</p>
                </div>
              </div>
            ))
          )}
          {typingUsers.length > 0 && (
            <div className="flex mb-4 justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {typingUsers[0]} está digitando...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white dark:bg-gray-800 border-t p-4">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-6 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button onClick={handleSend} disabled={!input.trim()} className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100">
              <Send className="h-6 w-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

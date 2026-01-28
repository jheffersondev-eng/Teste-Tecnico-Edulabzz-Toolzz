'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Bot, Loader2, MoreVertical } from 'lucide-react';
import api from '@/lib/api';
import Echo from '@/lib/echo';
import { useI18n } from '@/lib/i18n';

interface Message {
  id: number | string;
  content: string;
  type: 'user' | 'bot' | 'system';
  user: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  status?: 'sending' | 'sent';
  isTemporary?: boolean;
}

interface Conversation {
  id: number;
  type: string;
  name: string;
  participants: any[];
}

export default function ChatPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const params = useParams();
  const conversationId = params.id as string;
  const localeMap: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es-ES' };
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [waitingForBot, setWaitingForBot] = useState(false); // Block until bot responds
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    loadConversation();
    loadMessages();
    loadCurrentUser();
    subscribeToChannel();

    return () => {
      if (conversationId) {
        Echo.leave(`chat.${conversationId}`);
      }
    };
  }, [conversationId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/api/user');
      setCurrentUserId(response.data.user.id);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}`);
      setConversation(response.data.conversation);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChannel = () => {
    if (!Echo) return;
    
    console.log('🔌 Subscrevendo ao canal:', `chat.${conversationId}`);
    
    const channel = (Echo as any).connector.pusher.subscribe(`chat.${conversationId}`);
    
    // Ouvir evento direto do Pusher
    channel.bind('MessageSent', (data: any) => {
      console.log('✅ MENSAGEM RECEBIDA!', data);
      
      const message = data.message;
      const isOwnMessage = message.user_id && message.user_id === currentUserId;
      
      if (!isOwnMessage) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
        if (message.type === 'bot') {
          setTypingUsers([]);
          setWaitingForBot(false); // Allow sending new messages
        }
      }
    });

    console.log('✅ Listener Pusher registrado');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage;
    setNewMessage('');
    setSending(true);

    // Add message optimistically
    const tempMessage: Message = {
      id: Date.now(),
      content: messageContent,
      type: 'user',
      user: {
        id: currentUserId!,
        name: t('chat.you')
      },
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    // Show typing indicator for AI
    if (conversation?.type === 'ai') {
      setTypingUsers([t('chat.ai.typing')]);
    }

    try {
      await api.post(`/api/conversations/${conversationId}/messages`, {
        content: messageContent
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setTypingUsers([]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            {conversation?.type === 'ai' ? (
              <Bot className="w-5 h-5" />
            ) : (
              <span className="font-bold">{conversation?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold">{conversation?.name}</h2>
            <p className="text-sm text-gray-400">
              {conversation?.type === 'ai' ? t('chat.ai.title') : t('chat.status.online')}
            </p>
          </div>
          
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.user?.id === currentUserId;
          const isBot = message.type === 'bot';
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {isBot ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">
                        {message.user?.name.charAt(0)}
                      </span>
                    )}
                  </div>
                )}
                
                <div>
                  {!isOwn && (
                    <p className="text-xs text-gray-400 mb-1 px-2">
                      {isBot ? t('chat.ai.title') : message.user?.name}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-purple-600 text-white'
                        : isBot
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(message.created_at).toLocaleTimeString(localeMap[locale] || locale, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.input.placeholder')}
            className="flex-1 px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={waitingForBot}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || waitingForBot}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {waitingForBot ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

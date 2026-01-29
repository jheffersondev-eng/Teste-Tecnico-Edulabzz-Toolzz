'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
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
  status?: 'sending' | 'sent' | 'delivered';
  isTemporary?: boolean;
}

interface Conversation {
  id: number;
  type: string;
  name: string;
  participants: any[];
}

export default function UserChatPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const params = useParams();
  const userId = params.userId as string;
  const localeMap: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es-ES' };
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [friendName, setFriendName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingQueue, setSendingQueue] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    loadCurrentUser();
    getOrCreateConversation();
  }, [userId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/api/user');
      setCurrentUserId(response.data.user.id);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const getOrCreateConversation = async () => {
    try {
      const response = await api.post('/api/conversations/private', {
        friend_id: parseInt(userId)
      });
      setConversation(response.data.conversation);
      
      const friend = response.data.conversation.participants?.find(
        (p: any) => p.id !== currentUserId
      );
      setFriendName(friend?.name || t('modal.friends.friend'));
      
      loadMessages(response.data.conversation.id);
      subscribeToChannel(response.data.conversation.id);
    } catch (error) {
      console.error('Erro ao criar/buscar conversa:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChannel = (conversationId: number) => {
    if (!Echo) return;
    
    const channel = (Echo as any).connector.pusher.subscribe(`chat.${conversationId}`);
    
    channel.bind('MessageSent', (data: any) => {
      const message = data.message;
      const isOwnMessage = message.user_id && message.user_id === currentUserId;
      
      if (!isOwnMessage) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || !currentUserId) return;

    const messageContent = newMessage;
    const tempId = `temp-${Date.now()}`;
    
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      type: 'user',
      user: {
        id: currentUserId,
        name: t('chat.you')
      },
      created_at: new Date().toISOString(),
      status: 'sending',
      isTemporary: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSendingQueue(prev => [...prev, tempId]);

    try {
      const response = await api.post(`/api/conversations/${conversation.id}/messages`, {
        content: messageContent,
      });

      setMessages(prev => 
        prev.map(m => 
          m.id === tempId 
            ? { ...response.data.message, status: 'sent' }
            : m
        )
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      setMessages(prev => 
        prev.map(m => 
          m.id === tempId 
            ? { ...m, status: 'failed' as any }
            : m
        )
      );
    } finally {
      setSendingQueue(prev => prev.filter(id => id !== tempId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold">{friendName?.charAt(0) || 'U'}</span>
            </div>
            
            <div>
              <h1 className="text-xl font-bold">{friendName}</h1>
              <p className="text-sm text-gray-400">{t('chat.private.title')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.user?.id === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.user?.id === currentUserId
                    ? 'bg-purple-600'
                    : 'bg-gray-700'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-xs text-gray-300">
                    {new Date(message.created_at).toLocaleTimeString(localeMap[locale] || locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {message.user?.id === currentUserId && (
                    <span className="text-xs">
                      {message.status === 'sending' && (
                        <Loader2 className="w-3 h-3 animate-spin inline" />
                      )}
                      {message.status === 'sent' && (
                        <span className="text-gray-300">✓✓</span>
                      )}
                      {(message as any).status === 'failed' && (
                        <span className="text-red-400">✗</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.input.private.placeholder')}
            className="flex-1 px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

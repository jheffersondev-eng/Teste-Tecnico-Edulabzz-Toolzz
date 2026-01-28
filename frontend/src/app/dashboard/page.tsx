'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Plus, Bot, UserPlus, Users, LogOut, Shield } from 'lucide-react';
import api from '@/lib/api';
import SearchModal from '@/components/SearchModal';
import { useI18n } from '@/lib/i18n';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Conversation {
  id: number;
  type: string;
  name: string;
  participants?: Array<{ id: number; name: string }>;
  latest_message: {
    content: string;
    created_at: string;
  } | null;
  unread_count: number;
  updated_at: string;
}

interface ConversationSearchResult {
  id: number;
  type: string;
  name: string;
  participants: Array<{ id: number; name: string }>;
  matched_message: {
    id: number | string;
    content: string;
    created_at: string;
    user: { id: number; name: string } | null;
  } | null;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const localeMap: Record<string, string> = { en: 'en-US', pt: 'pt-BR', es: 'es-ES' };
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [chatSearchResults, setChatSearchResults] = useState<ConversationSearchResult[]>([]);
  const [chatSearchLoading, setChatSearchLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    loadUser();
    loadConversations();
  }, [router]);

  useEffect(() => {
    const term = chatSearch.trim();

    if (term.length < 2) {
      setChatSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setChatSearchLoading(true);
        const response = await api.get('/api/conversations/search', {
          params: { q: term },
        });
        setChatSearchResults(response.data.conversations ?? []);
      } catch (error) {
        console.error('Erro ao pesquisar conversas:', error);
      } finally {
        setChatSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [chatSearch]);

  const loadUser = async () => {
    try {
      const response = await api.get('/api/user');
      setUser(response.data.user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/api/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAIChat = async () => {
    if (creatingChat) return;
    
    try {
      setCreatingChat(true);
      const response = await api.post('/api/conversations/ai');
      router.push(`/chat/${response.data.conversation.id}`);
    } catch (error) {
      console.error('Erro ao criar chat com IA:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      setDeletingConversationId(conversationId);
      await api.delete(`/api/conversations/${conversationId}`);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
    } finally {
      setDeletingConversationId(null);
    }
  };

  const openConversation = (conversation: { id: number; type: string; participants?: Array<{ id: number }> }) => {
    if (conversation.type === 'ai') {
      router.push(`/chat/${conversation.id}`);
      return;
    }

    const friendId = conversation.participants?.[0]?.id;
    if (friendId) {
      router.push(`/chat/user/${friendId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('app.brand')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={t('dashboard.logout')}
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => router.push('/settings/2fa')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={t('dashboard.security')}
            >
              <Shield className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{user?.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2 border-b border-gray-700">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-semibold">{t('dashboard.sidebar.actions.addFriend')}</span>
          </button>
          
          <button
            onClick={createAIChat}
            disabled={creatingChat}
            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Bot className="w-5 h-5" />
            <span className="font-semibold">
              {creatingChat ? t('dashboard.sidebar.actions.aiChat.loading') : t('dashboard.sidebar.actions.aiChat')}
            </span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('dashboard.sidebar.conversations.title')}
            </h3>
            
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('dashboard.sidebar.conversations.empty.title')}</p>
                <p className="text-xs mt-1">{t('dashboard.sidebar.conversations.empty.subtitle')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        openConversation(conversation);
                      }}
                      className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {conversation.type === 'ai' ? (
                            <Bot className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{conversation.name.charAt(0)}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate group-hover:text-purple-400 transition-colors">
                              {conversation.name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="px-2 py-0.5 bg-purple-600 text-xs rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          {conversation.latest_message && (
                            <p className="text-sm text-gray-400 truncate">
                              {conversation.latest_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Delete Button - only for AI chats */}
                    {conversation.type === 'ai' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(conversation.id);
                        }}
                        className="absolute right-2 top-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
        <div className="w-full max-w-2xl px-6 mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={t('dashboard.search.placeholder')}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {(chatSearchLoading || chatSearchResults.length > 0 || chatSearch.trim().length >= 2) && (
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              {chatSearchLoading ? (
                <div className="p-4 text-sm text-gray-400">{t('dashboard.search.loading')}</div>
              ) : chatSearchResults.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">{t('dashboard.search.empty')}</div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {chatSearchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => openConversation(result)}
                      className="w-full text-left p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {result.type === 'ai' ? (
                            <Bot className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{result.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">{result.name}</p>
                            {result.matched_message && (
                              <span className="text-xs text-gray-400">
                                {new Date(result.matched_message.created_at).toLocaleDateString(localeMap[locale] || locale)}
                              </span>
                            )}
                          </div>
                          {result.matched_message && (
                            <p className="text-sm text-gray-300 truncate">
                              {result.matched_message.user?.name ? `${result.matched_message.user.name}${t('dashboard.search.authorPrefix')}` : ''}
                              {result.matched_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
              <MessageCircle className="relative w-24 h-24 text-purple-400" />
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-3 text-gray-200"
          >
            {t('dashboard.welcome.title')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mb-8 max-w-md"
          >
            {t('dashboard.welcome.subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => setShowSearchModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {t('dashboard.welcome.addFriend')}
            </button>
            
            <button
              onClick={createAIChat}
              disabled={creatingChat}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Bot className="w-5 h-5" />
              {creatingChat ? t('dashboard.sidebar.actions.aiChat.loading') : t('dashboard.welcome.aiChat')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onFriendAdded={loadConversations}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-4">{t('dashboard.chat.delete.title')}</h3>
            <p className="text-gray-400 mb-6">{t('dashboard.chat.delete.body')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingConversationId === confirmDelete}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {t('dashboard.chat.delete.cancel')}
              </button>
              <button
                onClick={() => handleDeleteConversation(confirmDelete)}
                disabled={deletingConversationId === confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {deletingConversationId === confirmDelete
                  ? t('dashboard.chat.delete.confirming')
                  : t('dashboard.chat.delete.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

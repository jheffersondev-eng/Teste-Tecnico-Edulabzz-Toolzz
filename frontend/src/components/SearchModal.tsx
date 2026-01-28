'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Check, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface User {
  id: number;
  name: string;
  email: string;
  is_friend: boolean;
  pending_request?: boolean;
}

interface FriendRequest {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface SearchModalProps {
  onClose: () => void;
  onFriendAdded: () => void;
}

export default function SearchModal({ onClose, onFriendAdded }: SearchModalProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'requests'>('search');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounce = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadPendingRequests = async () => {
    try {
      const response = await api.get('/api/friendships/pending');
      setPendingRequests(response.data.requests);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/users/search?q=${searchQuery}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    setActionLoading(userId);
    try {
      await api.post('/api/friendships', { friend_id: userId });
      setSearchResults(results =>
        results.map(user =>
          user.id === userId ? { ...user, pending_request: true } : user
        )
      );
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const acceptRequest = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.put(`/api/friendships/${requestId}/accept`);
      setPendingRequests(reqs => reqs.filter(req => req.id !== requestId));
      onFriendAdded();
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.delete(`/api/friendships/${requestId}/reject`);
      setPendingRequests(reqs => reqs.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t('modal.friends.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                {t('modal.friends.search')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {t('modal.friends.requests')}
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'search' ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('modal.friends.search.placeholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>
                        {user.is_friend ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {t('modal.friends.friend')}
                          </div>
                        ) : user.pending_request ? (
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <Clock className="w-4 h-4" />
                            {t('modal.friends.pending')}
                          </div>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            disabled={actionLoading === user.id}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                            {t('modal.friends.add')}
                          </button>
                        )}
                      </motion.div>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('modal.friends.search.empty')}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('modal.friends.search.helper')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-3">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold">
                            {request.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{request.user?.name || t('modal.friends.unknownUser')}</p>
                          <p className="text-sm text-gray-400 truncate">{request.user?.email || ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            title={t('modal.friends.accept')}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            title={t('modal.friends.reject')}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('modal.friends.requests.empty')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

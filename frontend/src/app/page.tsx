'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, Shield, Sparkles, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redireciona se já estiver logado
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const handleGoogleLogin = () => {
    setShowBugModal(true);
  };

  const handleGithubLogin = () => {
    setShowBugModal(true);
  };

  const proceedWithLogin = (provider: 'google' | 'github') => {
    setShowBugModal(false);
    window.location.href = `${apiBaseUrl}/auth/${provider}/redirect`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Fundo animado bonitão */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10">
        {/* Cabeçalho */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('app.brand')}
              </span>
            </div>
          </div>
        </motion.header>

      {/* Seção principal */}
      <section className="container mx-auto px-6 py-20">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
                <MessageCircle className="relative w-24 h-24 text-purple-400" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-700 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent"
            >
              {t('landing.title')}
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl"
            >
              {t('landing.subtitle')}
            </motion.p>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleGoogleLogin}
                className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="relative">{t('landing.google')}</span>
                </div>
              </button>

              <button
                onClick={handleGithubLogin}
                className="group relative px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  <Github className="w-6 h-6" />
                  <span className="relative">{t('landing.github')}</span>
                </div>
              </button>
            </motion.div>
          </div>
        </section>

      {/* Funcionalidades */}
      <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: t('landing.feature.realtime.title'),
                description: t('landing.feature.realtime.desc'),
                color: 'from-yellow-400 to-orange-400'
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: t('landing.feature.ai.title'),
                description: t('landing.feature.ai.desc'),
                color: 'from-purple-400 to-pink-400'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: t('landing.feature.secure.title'),
                description: t('landing.feature.secure.desc'),
                color: 'from-blue-400 to-cyan-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                className="group relative p-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <div className={`inline-flex p-3 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Chamada para ação */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center"
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <Users className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">{t('landing.cta.title')}</h2>
              <p className="text-xl mb-8 text-purple-100">
                {t('landing.cta.subtitle')}
              </p>
              <button
                onClick={handleGoogleLogin}
                className="px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl"
              >
                {t('landing.cta.button')}
              </button>
            </div>
          </motion.div>
        </section>

        {/* Rodapé */}
        <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>ChatFlow © 2026 - Comunicação Inteligente em Tempo Real</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Modal de bug temporário */}
      {showBugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚠️ Problema Temporário de Login
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Há um bug temporário que afeta apenas o ambiente de produção. Para fazer login, você pode precisar tentar algumas vezes clicando no botão de login. Desculpe pelo inconveniente!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => proceedWithLogin('google')}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logar com Google
              </button>
              <button
                onClick={() => proceedWithLogin('github')}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Logar com GitHub
              </button>
            </div>
            <button
              onClick={() => setShowBugModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Lock, Github, Chrome, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useI18n } from '@/lib/i18n'

export default function LoginPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost/auth/google/redirect'
  }

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost/auth/github/redirect'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl inline-block">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('login.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="group w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>{t('login.google')}</span>
            </button>

            <button
              onClick={handleGithubLogin}
              className="group w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-gray-700 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-400"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>{t('login.github')}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">{t('login.divider')}</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative overflow-hidden w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span className="relative z-10">{t('login.submit')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            {t('login.footer')}{' '}
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              {t('login.footer.link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

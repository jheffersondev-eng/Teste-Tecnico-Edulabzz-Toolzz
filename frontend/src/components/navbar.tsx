'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { useI18n } from '@/lib/i18n'

export function Navbar() {
  const { locale, setLocale, t } = useI18n()

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.brand')}
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'en' | 'pt' | 'es')}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="pt">🇧🇷 PT</option>
              <option value="es">🇪🇸 ES</option>
            </select>

            <ThemeToggle />

            {/* Auth Buttons */}
            <Link
              href="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-200 hover:scale-105 active:scale-95 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/signup"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <span className="relative z-10">{t('nav.signup')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
